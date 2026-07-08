# Translation workflow

How this wiki gets translated. Written so you can hand it to an AI agent
(Claude Fable or similar) and say "read `docs/translations.md`, add
\<language\>" and it does the whole thing the way we like it.

Shipped with this method so far: pl-PL (#38), tr-TR (#39), fr-FR (#40).

## The philosophy: soul, not word-for-word

Translations are never 1:1. The goal is a page that reads as if a skilled,
friendly member of that language's LoL modding community wrote it natively.
Meaning and structure must match the English source exactly, but the prose is
rewritten, not transposed. Concretely:

- Informal address (Polish "ty", French "tu", Turkish "sen", and whatever the
  local modding community actually uses).
- Community jargon stays in English where the community keeps it in English,
  and gets inflected the local way ("w Mayi", "packer le mod", "tego skina").
  A shared glossary per language keeps this consistent across every guide.
- Short sentences, imperative steps, warm but direct. Written so a 12-year-old
  can follow, same as the English Voice rules.
- If a sentence sounds like translated English (a calque), it gets rewritten.
- The banned-terms list applies in every language: nothing that sounds like
  "skin hack", "cheat", "unlock paid skins", "undetectable", or "buy skins",
  in any translation. Referring to Riot's anti-cheat system by name is fine.

What never changes in translation: heading structure, component tags and
non-visible props (`name`, `href`, `src`, `value`, `icon`), link targets,
image paths, code fences (byte-identical), file slugs, frontmatter keys.
What always gets translated: prose, headings text, frontmatter `title` and
`description` values, `alt` text, visible label props (`title`, `badge`).

## The method: orchestrator + parallel translators + reviewer

One strong model (Fable) orchestrates and reviews. Multiple Opus subagents
translate in parallel. This split matters: translators work fast in isolation,
and the reviewer catches what isolation costs (cross-agent glossary drift,
formality slips, structural mistakes).

1. **Fable writes a shared brief** for the target language: voice rules,
   a glossary table with exact terms, banned terms localized, and the MDX
   structural invariants. One brief, every agent reads the same one.
   The fr-FR brief is a good template to mirror; its skeleton is in the
   "Brief skeleton" section below.
2. **Fable splits the work by word count**, not file count. Measure with
   `find content/docs/en/<dir> -name "*.mdx" -exec cat {} + | wc -w` and
   include subdirectories (tools/ is deceptively huge). Aim for roughly
   4,000 words per agent. One extra light agent handles
   `messages/<locale>.json`.
3. **Opus agents translate in parallel**, each writing to the identical path
   under `content/docs/<locale>/` and self-checking structure before
   finishing.
4. **Fable reviews** (see "Review pass" below), unifies terminology, builds,
   and lands the PR.

## Playbook A: add a whole new language

1. **Pick the locale code** (e.g. `vi-VN`) and confirm scope with the repo
   owner if it isn't already in `src/lib/i18n.ts`.
2. **Check the wiring.** It may already exist (fr-FR and tr-TR were wired at
   launch). The full touch-list:
   - `src/lib/i18n.ts` languages array
   - `src/lib/locale.ts` (message import + deepMerge map)
   - `next.config.mjs` locale regex (search for `const locale =`)
   - Orama localeMap in BOTH `src/app/api/search/[locale]/route.ts` and
     `src/components/search-dialog.tsx`. Orama wants language names, not
     locale codes, and stemmer support varies: Turkish exists, Polish
     doesn't (falls back to `"english"`). Check what `@orama/stemmers`
     supports for the new language.
3. **Check `messages/<locale>.json` even if it exists.** fr-FR's file
   predated most of the UI and was missing 137 keys that silently fell back
   to English. Diff its key structure against `messages/en.json`; rebuild to
   exact key parity. `displayName` is the language's own name for itself and
   feeds the language switcher. Sidebar category titles live under `meta.*`.
4. **Copy every `meta.json` verbatim** from `content/docs/en/` to
   `content/docs/<locale>/` (same relative paths). Titles resolve through
   `{meta.x.title}` placeholders in messages, so no translation happens here.
5. **Write the shared brief** (see skeleton below), including a glossary
   researched for that community's actual usage.
6. **Launch parallel Opus agents** per the method above, one group per
   ~4k words, plus the messages agent.
7. **Review pass** (below), then **land it** (below).

## Playbook B: translate one guide (new or updated) into existing locales

When a new English guide lands, or an existing one changes substantially:

1. List target locales from `content/docs/` (everything except `en`).
2. Launch one Opus agent **per locale**, in parallel. Each agent gets:
   - The generic brief skeleton rules (voice, invariants, banned terms).
   - Instruction to read 2-3 existing translated guides in its locale first
     (same category if possible) and mirror their established voice and
     glossary. The existing corpus IS the glossary; consistency with it
     beats any fresh word choice.
   - The single file to translate to `content/docs/<locale>/<same path>`.
3. If the guide is brand new, also confirm the category `meta.json` exists in
   each locale (copy from en if the category itself is new).
4. Review each result with
   `node scripts/check-locale.mjs <locale> <relative-path>.mdx`
   plus a read-through for voice, then land all locales in one PR.

For a small edit to one English guide (a sentence or two), skip the fleet:
make the same edit by hand in each locale file, matching each locale's
existing voice, and run the check script on that file for each locale.

## Brief skeleton (what every translator agent must receive)

Adapt per language; research the glossary for that community before writing.

- **Mission**: not 1:1; native community voice; meaning and structure exact.
- **Voice**: informal address for that language, short sentences, imperative
  steps, no filler words, no em or en dashes anywhere, local punctuation
  conventions.
- **Banned terms**: the list above, localized into that language, with the
  approved replacements (custom skin, mod, safe, client-side, customize,
  download).
- **Glossary table**: exact term per concept (skin, mod, mesh, rig, bone,
  particles, emitter, BIN, hash, texture, UVs, soundbank, launcher, pack,
  repath, thumbnail, client-side, in-game, level names). State which stay in
  English. Tool names, champion names, and Riot product names never
  translate.
- **MDX invariants**: the "what never changes" list above, plus: escape `<`
  before digits (`\<3`), keep blank lines between JSX and Markdown, keep
  `<Tabs>`/`<Tab>` closing tags, bare YouTube URLs byte-identical, and write
  each file to the identical path under `content/docs/<locale>/`.
- **In-page anchors**: `[text](#english-heading-slug)` must be re-slugged to
  the translated heading (lowercase, spaces to hyphens, punctuation dropped,
  accented letters kept). `wwise.mdx` has one.
- **contributing/components.mdx special case**: rendered examples that mirror
  an adjacent code fence stay in English so they match the fence; examples
  without a fence get translated.
- **Self-check**: same counts of headings, fences, component tags, links,
  images as the source; no dashes; no banned terms; glossary respected.
- **Output**: report files written plus any English source problems noticed
  (typos, broken links) without fixing them.

## Review pass (the orchestrator does this, never skip it)

1. `node scripts/check-locale.mjs <locale>` for structural parity, dashes,
   and unescaped `<digit`. Intentional localized anchors show up as link
   mismatches; verify those by hand.
2. **Formality sweep**: grep for the formal register the brief banned
   (French "vous"/"veuillez", etc.). One usually slips through.
3. **Calque sweep**: grep for the classic false friends of that language
   (French "librairie", "il suffit de"; Polish literal calques; etc.).
4. **Glossary drift unification**: agents working in isolation WILL drift on
   a few terms (tr-TR: anti-cheat vs anti-hile; fr-FR: three different names
   for the sounds category across sidebar, homepage card, and guide titles).
   Grep candidate terms across the whole locale, pick one form (prefer the
   sidebar/messages wording), and unify.
5. **Deep-read the high-traffic pages** end to end for actual language
   quality: `lol/index.mdx`, `guided-walkthrough/walkthrough.mdx`, and the
   biggest single guide.
6. **Messages parity**: programmatically diff `messages/<locale>.json` key
   structure against `en.json` yourself; don't trust the agent's claim.
7. `npm run build` (full production build) and `npm run format:check`.
   Note: `.prettierignore` excludes non-English MDX on purpose, but
   `messages/*.json` is formatted.

## Landing

- Branch `feat/<language>-translation`, one commit, Conventional Commits
  style matching `git log` (`feat: french (fr-FR) translation`). No
  co-author trailers, no emoji.
- PR body follows #38/#39/#40: What / Translation approach / Locale wiring /
  Notes for reviewers / Verified list.
- English source fixes surfaced by translation go in a separate follow-up PR
  (see #41), never mixed into the translation PR.

## Copy-paste prompts

New language:

> Read `docs/translations.md` and follow Playbook A to add \<Language\>
> (\<code\>) to the wiki. Fable orchestrates: write the shared brief with a
> researched \<Language\> modding-community glossary, launch parallel Opus
> translator agents balanced by word count plus one for
> `messages/<code>.json`, then do the full review pass yourself before
> landing the PR. Translations must have soul: native community voice,
> never 1:1.

Single guide:

> Read `docs/translations.md` and follow Playbook B to translate
> `content/docs/en/<path>.mdx` into every existing locale. One Opus agent
> per locale in parallel, each mirroring the voice and glossary of that
> locale's existing guides, then review each with the check script and a
> read-through before landing one PR.
