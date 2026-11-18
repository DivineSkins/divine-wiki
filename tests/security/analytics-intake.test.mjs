import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isSameOrigin,
  MAX_BODY_BYTES,
  readEventBody,
  withinRateLimit,
} from "../../src/lib/analytics/intake.ts";

const endpoint = "https://wiki.divineskins.gg/api/m";

test("origin checks reject scheme changes and forged Host headers", () => {
  assert.equal(
    isSameOrigin(
      new Request(endpoint, {
        headers: { origin: "https://wiki.divineskins.gg" },
      }),
    ),
    true,
  );
  for (const origin of [
    "http://wiki.divineskins.gg",
    "https://evil.example",
    "null",
    "https://wiki.divineskins.gg/extra",
  ]) {
    assert.equal(
      isSameOrigin(
        new Request(endpoint, {
          headers: {
            origin,
            host: "evil.example",
            "sec-fetch-site": "same-origin",
          },
        }),
      ),
      false,
    );
  }
  assert.equal(isSameOrigin(new Request(endpoint)), false);
  assert.equal(
    isSameOrigin(
      new Request(endpoint, {
        headers: { "sec-fetch-site": "same-origin" },
      }),
    ),
    true,
  );
});

test("body limit counts UTF-8 bytes rather than JavaScript characters", async () => {
  const exact = "é".repeat(MAX_BODY_BYTES / 2);
  assert.equal(
    await readEventBody(new Request(endpoint, { method: "POST", body: exact })),
    exact,
  );
  assert.equal(
    await readEventBody(
      new Request(endpoint, { method: "POST", body: exact + "é" }),
    ),
    null,
  );
});

test("chunked oversized bodies are cancelled without reading the full stream", async () => {
  let pulls = 0;
  let cancelled = false;
  const body = new ReadableStream(
    {
      pull(controller) {
        pulls++;
        controller.enqueue(new Uint8Array(2048));
      },
      cancel() {
        cancelled = true;
      },
    },
    { highWaterMark: 0 },
  );
  const request = new Request(endpoint, {
    method: "POST",
    body,
    duplex: "half",
  });
  assert.equal(await readEventBody(request), null);
  assert.equal(cancelled, true);
  assert.equal(pulls, 3);
});

test("a false Content-Length cannot bypass the streamed byte limit", async () => {
  const request = new Request(endpoint, {
    method: "POST",
    body: "x".repeat(MAX_BODY_BYTES + 1),
    headers: { "content-length": "1" },
  });
  assert.equal(await readEventBody(request), null);
});

test("declared oversized bodies are rejected without consuming bytes", async () => {
  let reads = 0;
  const body = new ReadableStream(
    {
      pull() {
        reads++;
      },
    },
    { highWaterMark: 0 },
  );
  const request = new Request(endpoint, {
    method: "POST",
    body,
    duplex: "half",
    headers: { "content-length": String(MAX_BODY_BYTES + 1) },
  });
  assert.equal(await readEventBody(request), null);
  assert.equal(reads, 0);
});

test("broken streams and invalid UTF-8 are discarded", async () => {
  const broken = new ReadableStream({
    start(controller) {
      controller.error(new Error("closed"));
    },
  });
  assert.equal(
    await readEventBody(
      new Request(endpoint, { method: "POST", body: broken, duplex: "half" }),
    ),
    null,
  );
  assert.equal(
    await readEventBody(
      new Request(endpoint, { method: "POST", body: new Uint8Array([0xff]) }),
    ),
    null,
  );
});

test("rate limiting fails closed in production and permits local development", async () => {
  assert.equal(await withinRateLimit(undefined, "127.0.0.1"), false);
  assert.equal(
    await withinRateLimit({ limit: async () => ({ success: true }) }, null),
    false,
  );
  assert.equal(await withinRateLimit(undefined, null, true), true);
  assert.equal(
    await withinRateLimit(
      { limit: async () => ({ success: false }) },
      "127.0.0.1",
    ),
    false,
  );
  assert.equal(
    await withinRateLimit(
      { limit: async () => ({ success: true }) },
      "127.0.0.1",
    ),
    true,
  );
  assert.equal(
    await withinRateLimit(
      {
        limit: async () => {
          throw new Error("unavailable");
        },
      },
      "127.0.0.1",
    ),
    false,
  );
});
