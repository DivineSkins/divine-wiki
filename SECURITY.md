# Security

## Reporting a vulnerability

Email `security@divineskins.gg`. Include:

- What you found
- How to reproduce it
- What impact you think it has

Do not open a public GitHub Issue for security bugs.

## Scope

This policy covers:

- The wiki site itself (`wiki.divineskins.gg`)
- The in-browser draft editor at `/draft`
- The read-only API routes under `/api/` (`health`, `og`, `search`, `preview`)

The site is fully static and has no backend, auth, or secrets. Contributions are GitHub-native: the `/draft` editor opens a pull request via a client-side GitHub URL handoff (`src/lib/draft/github.ts`); it never holds a token or acts on a user's behalf.

## What we care about most

- XSS in rendered MDX content (build-time pages and the `/api/preview` draft render)
- Anything in the `/draft` handoff that could be abused to forge or hijack a pull request

## Response

We aim to acknowledge reports within 2 business days. Real fix timelines vary.
