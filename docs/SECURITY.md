# Security

## Reporting a vulnerability

Use GitHub's **Report a vulnerability** button on this repo's Security tab,
or email `security@divineskins.gg`. Include:

- What you found
- How to reproduce it
- What impact you think it has

Do not open a public GitHub Issue for security bugs.

## Scope

This policy covers:

- The wiki site itself (`wiki.divineskins.gg`)
- The in-browser draft editor at `/draft`
- The read-only API routes under `/api/` (`health`, `og`, `search`)
- The public analytics intake at `/api/m`

The site renders server-side on Cloudflare Workers. It has no login or user accounts. Contributions are GitHub-native: the `/draft` editor opens a pull request via a client-side GitHub URL handoff (`src/lib/draft/github.ts`). It never holds a GitHub token or acts on a contributor's behalf.

The analytics endpoint accepts public events, not authenticated user data. It checks the request origin, enforces a streamed 4 KB body limit, validates the event schema, and applies a per-IP rate limit. Production events are dropped if the rate limiter is missing or fails. A daily salted visitor hash uses short-lived salts in Workers KV. Raw IP addresses are not stored in event data.

Drafts compile in the contributor's browser. The preview accepts static component props and Icon JSX, but rejects executable expressions, event handlers, active HTML, and unsafe URL schemes. Published MDX is trusted repository code and must still be reviewed before merge.

## Dependency checks

Run `npm audit` and `npm run test:security` before shipping security changes. The security workflow runs both on pull requests and pushes to `main`.

Three overrides keep transitive dependencies on patched releases while upstream packages pin older versions:

- `@node-minify/core` uses `glob` 10.5.0 or newer within version 10.
- `brace-expansion` version 1 uses 1.1.21 or newer within version 1.
- `undici` version 7 uses 7.30.1 or newer, including Miniflare's dependency.

Use version-scoped overrides for pinned transitive packages. Nested overrides can fail lockfile validation with npm 10 even when npm 11 installs the same lockfile successfully.

Remove an override once its upstream dependency resolves to a patched version without it. Re-run the audit, tests, and Cloudflare build after changing these overrides.

## What we care about most

- XSS in rendered MDX content (build-time pages and the in-browser `/draft` preview)
- Anything in the `/draft` handoff that could be abused to forge or hijack a pull request

## Response

We aim to acknowledge reports within 2 business days. Real fix timelines vary.
