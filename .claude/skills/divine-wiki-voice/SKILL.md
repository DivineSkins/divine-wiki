---
name: divine-wiki-voice
description: "Plain-English voice for the Divine Skins wiki. Use whenever writing, editing, or reviewing guides, tutorials, how-to pages, FAQ answers, callouts, or any user-facing copy on the wiki — including new guide drafts, voice audits, MDX prose, and translation source text. Audience is creators (skinners using Maya/Blender/VFX) but most readers are non-native English speakers and many are minors. Enforces short sentences, simple words, verb-first commands, locked terminology, and consistent safety wording. Mirrors the prod copywriting voice for brand consistency, but tuned for long-form instructional content rather than marketing FAQ."
---

# Divine Skins Wiki Voice

## When to Use

Load this skill before writing or reviewing any user-facing text on the wiki:

- New guide / tutorial / how-to drafts in `content/docs/en/lol/**`
- Voice audits of existing pages
- FAQ entries, callouts, error copy, microcopy
- MDX prose where a 12-year-old non-native English reader has to follow along
- Frontmatter `description` fields (~160 chars, plain English)
- Draft text typed into the `/draft` in-browser editor before the contributor opens a PR

The wiki is the **creator** surface — readers come here to learn how to model, texture, rig, install, and ship custom skins. The voice is the same brand voice as the prod app, with one shift: prod is conversational FAQ ("Yeah", "Easy", "Nope"), the wiki is patient instructional ("Open Celestial. Click Install. A green checkmark appears when the skin is ready.").

## References

### Wiki Voice Guide — `references/wiki-voice-guide.md`

Read for the full ruleset: writing-short rules, simple-word swaps, verb-first commands, jargon list, safety wording, locked terminology, structure of a good guide, the four reusable patterns, and the publish checklist.

### Source of Truth — `docs/voice.md` (in this repo)

The wiki's canonical voice doc — written for human contributors and reviewed in PRs. **It overrides this skill if there's ever a conflict.** Read it any time you're unsure whether a rule is a style preference or a hard rule.

## The Voice — In One Line

**Short, plain, kind. Talk like you're explaining to a friend who's never done this before.**

A 12-year-old should be able to follow every step you write without getting stuck. Most readers are not native English speakers. Assume nothing.

## The Voice Test

Before shipping, ask: **"Can a 12-year-old non-native-English reader follow every step without getting stuck?"**

If a sentence is over 20 words, break it. If a paragraph is over 3 sentences, break it. If you used "utilize", swap to "use".

## Non-Negotiable Rules (Quick List)

The full guide has the patterns and examples; here's the hard floor:

### Compliance (legal / safety)

1. **No "skin hack" or "cheat".** Always "custom skin" or "mod".
2. **No "undetectable" or "bypass".** Use "client-side only" or "cosmetic only".
3. **No "buy" / "purchase" for skins.** Use "download" or "get".
4. **Never recommend custom skins for Korea or China.** The anti-cheat there blocks all mods. Always exclude KR / CN explicitly when listing safe regions.
5. **All skins are free** since 2026-01-31. Don't imply payment is required.
6. **Custom skins ≠ skin changers.** Don't conflate.
7. **No safety claims framed as evading detection.** Custom skins are cosmetic-only and client-side, period.

### Voice (zero-tolerance)

These flatten the voice. Delete on sight:

- "simply", "just", "basically", "easily", "quickly"
- "please"
- "as you can see", "as mentioned above"
- "it's important to note that"
- "utilize", "facilitate", "leverage", "robust", "seamless", "cutting-edge", "state-of-the-art", "revolutionary"
- "ecosystem" / "onboarding" / "monetize" in user-facing copy
- RPG hype verbs: "ascend", "evolve", "summon", "unleash", "dominate", "transform"
- Three-word slogans ("Safe. Free. Divine.")
- "Welcome to [thing]" as a headline

### Style

- **Em dashes (`—`) and en dashes (`–`) are banned in prose.** They slow non-native readers down. Use a period, comma, colon, or parentheses. Hyphens (`-`) in compound words (`client-side`, `step-by-step`) are fine.
- **Use "you"** — never "the user" or "one should".
- **Every step starts with a verb.** Tell the reader what to do; don't describe what exists.
- **One action per numbered step.** Never stack actions in one bullet.
- **Show the outcome.** After a step, say what the reader should see. _"Click Install. A green checkmark appears when the skin is ready."_
- **Warn before the danger, not after.** Risk warnings come **before** the risky step.
- **Link, don't repeat.** If something is explained on another page, link to it.

### Casing

- **Headlines / guide titles:** sentence case, one short phrase. _"Install Celestial Launcher"_, _"Make a custom skin"_.
- **Buttons:** sentence case, 1–3 words, action-first. _"Get started"_, _"Edit this page"_.
- **UPPERCASE:** reserved for tiny meta labels (10–12px eyebrows) with letter-spacing. Never on body copy or buttons.

## Workflow

### When writing new copy

1. Confirm the page, audience (creator subtype), and context if unclear.
2. Read `references/wiki-voice-guide.md` for the matching pattern (guide intro / step / callout / FAQ answer / etc.).
3. Draft 2–3 short variants. Keep the strongest first.
4. Cut every filler word. If 4 words work, ship 4 words.
5. Note any compliance flags proactively (banned terms, KR/CN safety wording).

### When reviewing existing copy

1. **Compliance scan** — banned words, detection claims, missing KR/CN exclusions.
2. **Voice scan** — does it sound like a friend explaining? If not, rewrite.
3. **Length scan** — any sentence over 20 words? Cut. Any paragraph over 3? Split.
4. **Hype scan** — strip RPG verbs, three-word slogans, stacked adjectives, em dashes.
5. **Casing scan** — sentence case for headlines and buttons.
6. **Truth scan** — any stat or claim must be defensible (don't invent counts like "150+ skins" without checking).

For each piece of copy reviewed, return:

- **Original**
- **Revised**
- **One-sentence rationale**
- **Severity:** 🔴 Critical (compliance / banned terms) · 🟡 Important (voice / clarity) · 🟢 Polish

## Audience Notes (Brief)

- **Creators (Maya / Blender / VFX, the core wiki audience):** Slightly more technical OK. Still no jargon-without-explanation. Lean on precise step-by-step.
- **Curious end-users wandering in:** Don't assume modding background. Explain _mod_, _fantome file_, _client_, _patch_, _override_ on first use.
- **Global readers (FR / TR / BR / US):** Avoid US-only idioms ("home run", "knock it out of the park"). Plain English that translates well.
- **Translators (Crowdin):** Your English source goes through translation. Short sentences with no clever phrasing are easier to translate accurately. Don't hand-edit `content/docs/fr-FR/lol/**`, `tr-TR/lol/**`, `pt-BR/lol/**` — Crowdin overwrites.

## Final Reminders

- Less is more. If you wrote a paragraph, cut it to a sentence.
- The voice is "patient friend who knows the tool", not "creative director" and not "AI doing gamer voice".
- Read the actual file when reviewing — don't guess at what the copy says.
- Read the actual prod site copy when in doubt about brand voice (`NewHomePage.jsx`, `CelestialLauncher.jsx`, `DivinePlus.jsx` in `DivineSkinsWEB-PROD`).
