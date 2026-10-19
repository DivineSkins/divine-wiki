#!/usr/bin/env node
// Prints a traffic report from the wiki's Workers Analytics Engine dataset.
// See src/lib/analytics/server.ts for what each blob/double column holds;
// the column numbers below must match its layout.
//
// Needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (permission:
// Account > Account Analytics > Read) in the environment.
//
//   node scripts/analytics-report.mjs             last 7 days
//   node scripts/analytics-report.mjs --days 30   last 30 days (max ~90)
//   node scripts/analytics-report.mjs --live      who's reading right now
//   node scripts/analytics-report.mjs --sql "SELECT blob2, count() AS n
//     FROM wiki_events GROUP BY blob2"            any query, printed as a table

import { parseArgs } from "node:util";

const DATASET = "wiki_events";

const { values: args } = parseArgs({
  options: {
    days: { type: "string", default: "7" },
    live: { type: "boolean", default: false },
    sql: { type: "string" },
  },
});

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!accountId || !token) {
  console.error(
    "Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (Account Analytics: Read).",
  );
  process.exit(1);
}

const days = Number.parseInt(args.days, 10);
if (!Number.isInteger(days) || days < 1 || days > 92) {
  console.error("--days must be a whole number from 1 to 92.");
  process.exit(1);
}

async function query(sql) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: `${sql} FORMAT JSON`,
    },
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`Analytics Engine ${res.status}: ${text}`);
  return JSON.parse(text).data;
}

// Column widths come from the data; numbers are right-aligned.
function table(title, rows, columns) {
  console.log(`\n${title}`);
  if (rows.length === 0) {
    console.log("  (no data yet)");
    return;
  }
  const cells = rows.map((row) =>
    columns.map(([key, , format]) =>
      format ? format(row[key]) : printable(row[key]),
    ),
  );
  const widths = columns.map(([, label], i) =>
    Math.max(label.length, ...cells.map((r) => r[i].length)),
  );
  const isNumber = columns.map(([key]) => typeof rows[0][key] === "number");
  const line = (values) =>
    "  " +
    values
      .map((v, i) =>
        isNumber[i] ? v.padStart(widths[i]) : v.padEnd(widths[i]),
      )
      .join("  ");
  console.log(line(columns.map(([, label]) => label)));
  for (const row of cells) console.log(line(row));
}

// Values come from a public endpoint: strip control and formatting
// characters so a crafted path or search can't send escape sequences (or
// bidi overrides) to the terminal. The intake strips them too; this covers
// rows written before that or by future columns.
const printable = (v) => String(v ?? "").replace(/[\p{Cc}\p{Cf}]/gu, "");

// ClickHouse returns 64-bit integers as strings.
const num = (v) => Math.round(Number(v)).toLocaleString("en-US");
const pct = (v) => `${Math.round(Number(v))}%`;
const secs = (v) => {
  const s = Math.round(Number(v));
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
};
const numeric = (rows, keys) =>
  rows.map((row) => {
    const out = { ...row };
    for (const key of keys) out[key] = Number(row[key]);
    return out;
  });

const since = `timestamp > NOW() - INTERVAL '${days}' DAY`;

async function live() {
  const [now] = await query(`
    SELECT count(DISTINCT blob12) AS visitors
    FROM ${DATASET}
    WHERE timestamp > NOW() - INTERVAL '5' MINUTE AND blob12 != ''`);
  console.log(`Readers in the last 5 minutes: ${num(now?.visitors ?? 0)}`);
  table(
    "Pages open now",
    numeric(
      await query(`
        SELECT blob2 AS path, count(DISTINCT blob12) AS readers
        FROM ${DATASET}
        WHERE timestamp > NOW() - INTERVAL '5' MINUTE
          AND blob1 IN ('pageview', 'engage') AND blob12 != ''
        GROUP BY path ORDER BY readers DESC LIMIT 15`),
      ["readers"],
    ),
    [
      ["readers", "readers", num],
      ["path", "page"],
    ],
  );
}

async function report() {
  console.log(`Divine wiki, last ${days} day${days === 1 ? "" : "s"}`);

  // Visitor ids rotate daily, so uniques are only meaningful per day.
  table(
    "Daily",
    numeric(
      await query(`
        SELECT
          formatDateTime(toStartOfDay(timestamp), '%Y-%m-%d') AS day,
          -- An empty id (none could be computed) would count as one more
          -- distinct visitor; subtract it when present.
          count(DISTINCT blob12) - max(if(blob12 = '', 1, 0)) AS visitors,
          sumIf(_sample_interval, blob1 = 'pageview' AND double1 = 1) AS visits,
          sumIf(_sample_interval, blob1 = 'pageview') AS views
        FROM ${DATASET}
        WHERE ${since}
        GROUP BY day ORDER BY day`),
      ["visitors", "visits", "views"],
    ),
    [
      ["day", "day"],
      ["visitors", "visitors", num],
      ["visits", "visits", num],
      ["views", "page views", num],
    ],
  );

  table(
    "Top pages",
    numeric(
      await query(`
        SELECT blob2 AS path, sum(_sample_interval) AS views
        FROM ${DATASET}
        WHERE blob1 = 'pageview' AND ${since}
        GROUP BY path ORDER BY views DESC LIMIT 25`),
      ["views"],
    ),
    [
      ["views", "views", num],
      ["path", "page"],
    ],
  );

  // One row per pageview first: a reader who switches tabs sends several
  // engage events for the same page.
  table(
    "Reading depth (pages with 10+ reads)",
    numeric(
      await query(`
        SELECT path, count() AS reads, avg(seconds) AS time, avg(scroll) AS scroll
        FROM (
          SELECT blob2 AS path, blob13 AS page,
            sum(double1) AS seconds, max(double2) AS scroll
          FROM ${DATASET}
          WHERE blob1 = 'engage' AND ${since}
          GROUP BY path, page
        )
        GROUP BY path HAVING reads >= 10
        ORDER BY reads DESC LIMIT 25`),
      ["reads", "time", "scroll"],
    ),
    [
      ["reads", "reads", num],
      ["time", "avg time", secs],
      ["scroll", "avg scroll", pct],
      ["path", "page"],
    ],
  );

  table(
    "Where visits come from",
    numeric(
      await query(`
        SELECT if(blob6 = '', '(direct / unknown)', blob6) AS referrer,
          sum(_sample_interval) AS visits
        FROM ${DATASET}
        WHERE blob1 = 'pageview' AND double1 = 1 AND ${since}
        GROUP BY referrer ORDER BY visits DESC LIMIT 15`),
      ["visits"],
    ),
    [
      ["visits", "visits", num],
      ["referrer", "referrer"],
    ],
  );

  table(
    "Campaign tags (?utm_source= / ?ref=)",
    numeric(
      await query(`
        SELECT blob7 AS source, sum(_sample_interval) AS visits
        FROM ${DATASET}
        WHERE blob1 = 'pageview' AND blob7 != '' AND ${since}
        GROUP BY source ORDER BY visits DESC LIMIT 10`),
      ["visits"],
    ),
    [
      ["visits", "visits", num],
      ["source", "source"],
    ],
  );

  table(
    "Top searches",
    numeric(
      await query(`
        SELECT blob5 AS term, sum(_sample_interval) AS searches,
          avg(double1) AS results
        FROM ${DATASET}
        WHERE blob1 = 'search' AND ${since}
        GROUP BY term ORDER BY searches DESC LIMIT 25`),
      ["searches", "results"],
    ),
    [
      ["searches", "searches", num],
      ["results", "pages found", num],
      ["term", "term"],
    ],
  );

  table(
    "Searches with no results (missing guides?)",
    numeric(
      await query(`
        SELECT blob5 AS term, sum(_sample_interval) AS searches
        FROM ${DATASET}
        WHERE blob1 = 'search' AND double1 = 0 AND ${since}
        GROUP BY term ORDER BY searches DESC LIMIT 25`),
      ["searches"],
    ),
    [
      ["searches", "searches", num],
      ["term", "term"],
    ],
  );

  table(
    "Clicks out and downloads",
    numeric(
      await query(`
        SELECT blob1 AS kind, blob5 AS target, sum(_sample_interval) AS clicks
        FROM ${DATASET}
        WHERE blob1 IN ('outbound', 'download') AND ${since}
        GROUP BY kind, target ORDER BY clicks DESC LIMIT 25`),
      ["clicks"],
    ),
    [
      ["clicks", "clicks", num],
      ["kind", "kind"],
      ["target", "target"],
    ],
  );

  table(
    "Broken links (404s)",
    numeric(
      await query(`
        SELECT blob2 AS path, sum(_sample_interval) AS hits
        FROM ${DATASET}
        WHERE blob1 = 'notfound' AND ${since}
        GROUP BY path ORDER BY hits DESC LIMIT 15`),
      ["hits"],
    ),
    [
      ["hits", "hits", num],
      ["path", "path"],
    ],
  );

  for (const [title, column, label] of [
    ["Games", "blob4", "game"],
    ["Languages", "blob3", "language"],
    ["Countries", "blob8", "country"],
    ["Devices", "blob9", "device"],
    ["Operating systems", "blob11", "os"],
    ["Browsers", "blob10", "browser"],
  ]) {
    table(
      title,
      numeric(
        await query(`
          SELECT if(${column} = '', '(none)', ${column}) AS name,
            sum(_sample_interval) AS views
          FROM ${DATASET}
          WHERE blob1 = 'pageview' AND ${since}
          GROUP BY name ORDER BY views DESC LIMIT 12`),
        ["views"],
      ),
      [
        ["views", "views", num],
        ["name", label],
      ],
    );
  }
}

// Ad-hoc query. Columns whose values are all numeric are right-aligned and
// printed as-is (no rounding, so averages keep their decimals).
async function custom(sql) {
  const rows = await query(sql.trim().replace(/;$/, ""));
  const keys = rows.length ? Object.keys(rows[0]) : [];
  const numericKeys = keys.filter((key) =>
    rows.every((row) => row[key] !== "" && !Number.isNaN(Number(row[key]))),
  );
  table(
    "Result",
    numeric(rows, numericKeys),
    keys.map((key) => [key, key]),
  );
}

try {
  await (args.sql ? custom(args.sql) : args.live ? live() : report());
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
