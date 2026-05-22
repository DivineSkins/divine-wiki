# Divine Skins Wiki — Voice Guide

> The deep reference for writing guides, tutorials, and any user-facing copy on the wiki. The hard rules live in `docs/voice.md` (in the repo root) — that's the source of truth and overrides this document if there's ever a conflict. This file expands the rules with examples, patterns, and component-by-component templates.

---

## 1. The Voice — In One Line

**Short, plain, kind. Talk like you're explaining to a friend who's never done this before.**

A 12-year-old should be able to follow every step you write without getting stuck. Most readers are not native English speakers. Assume nothing — explain jargon the first time, link instead of repeating, warn before risk.

### What the voice sounds like (good — adapt these)

From `docs/voice.md` and the live wiki:

- _"Open Celestial."_ (verb-first, no fluff)
- _"Click Install. A green checkmark appears when the skin is ready."_ (action + outcome)
- _"Before you install, close League of Legends. Installing while the game is open can break it."_ (warning before danger)
- _"A mod is a file that changes how the game looks. Download the mod you want."_ (jargon explained on first use, then used freely)

### What the voice doesn't sound like (avoid these)

- _"The user should then proceed to launch the application."_ (fix: _Open Celestial._)
- _"Simply click the button to easily install your mod."_ (fix: _Click Install._)
- _"It is important to note that you must close LoL prior to installation."_ (fix: _Close LoL before you install._)
- _"Unleash your creativity and ascend the ranks of skin creators."_ (fix: just delete it)

---

## 2. Write Short

| Rule                  | Limit         |
| --------------------- | ------------- |
| One idea per sentence | —             |
| One action per step   | —             |
| Sentence length       | < 20 words    |
| Paragraph length      | ≤ 3 sentences |

**If you cross a limit, break it up.** No exceptions.

### Examples

❌ _Once you have downloaded the fantome file from the catalog, you should then move it into the mods folder, which is usually located inside the Celestial Launcher directory under your Documents folder._

✅

- Download the fantome file from the catalog.
- Move it into the `mods` folder inside the Celestial Launcher directory. (Usually under Documents.)

---

## 3. Use Simple Words

Pick the plain word every time. Even if it feels less "professional" — that's the point.

| Don't write   | Write                 |
| ------------- | --------------------- |
| Utilize       | Use                   |
| Initiate      | Start                 |
| Navigate to   | Go to, open           |
| Terminate     | Close, stop           |
| Subsequently  | Then, after           |
| In order to   | To                    |
| Ensure that   | Make sure             |
| Prior to      | Before                |
| Execute       | Run                   |
| Select        | Click, pick           |
| Locate        | Find                  |
| Modify        | Change                |
| Verify        | Check                 |
| Configure     | Set up                |
| Implement     | Add, build            |
| Functionality | Feature, what it does |
| Sufficient    | Enough                |
| Approximately | About                 |

If a word would not appear in a 7th-grade textbook, swap it.

---

## 4. Talk to the Reader Directly

Use **"you"**. Never "the user", "one should", or "the reader".

| Bad                                                     | Good                           |
| ------------------------------------------------------- | ------------------------------ |
| The user should then proceed to launch the application. | Open Celestial.                |
| One must be careful to back up files first.             | Back up your files first.      |
| The reader will see a confirmation dialog.              | A confirmation dialog appears. |

---

## 5. Give Commands, Not Descriptions

Every step starts with a verb. Tell the reader what to do, not what exists on screen.

| Bad                                                                    | Good                                        |
| ---------------------------------------------------------------------- | ------------------------------------------- |
| There is a settings button in the top right corner that you can press. | Click the settings button in the top right. |
| You will need to find the import option in the menu.                   | Open the menu. Click **Import**.            |
| The catalog has filters you can apply.                                 | Open the catalog. Apply a filter.           |

---

## 6. Explain Jargon on First Use

If a technical word is unavoidable, explain it the first time, then use it freely.

Words that **always** need explaining on first use in a guide:

- **mod** — a file that changes how the game looks
- **fantome file** — the `.fantome` file format Celestial uses for custom skins
- **client** — the main League of Legends app
- **patch** — a Riot update to League of Legends
- **champion** — a playable character (only needed in tool docs read by non-LoL players)
- **import** — bringing a file into a tool
- **override** — replacing the original game asset with the custom one
- **rig** — the bone skeleton inside a 3D model
- **UV** — the 2D map of a 3D model's surface

Pattern: _"A mod is a file that changes how the game looks. Download the mod you want."_

---

## 7. One Step Per Line

Number the steps. Never stack actions.

❌ Bad

```
1. Open Celestial, log in, then go to the catalog and pick a skin.
```

✅ Good

```
1. Open Celestial.
2. Log in.
3. Go to the catalog.
4. Pick a skin.
```

---

## 8. Show the Outcome

After a step, say what the reader should see. That's how they know it worked.

- _Click Install. A green checkmark appears when the skin is ready._
- _Open the catalog. The grid of skins loads._
- _Run the export. A success toast appears in the bottom right._

If a step has no visible outcome, say so: _"This runs in the background. No notification appears — that's normal."_

---

## 9. Warn Before the Danger, Not After

Risk warnings come **before** the risky step. Always.

✅ _"Before you install, close League of Legends. Installing while the game is open can break it."_

❌ _"Install the skin. (Note: this can break the game if LoL is open.)"_

For high-risk warnings (data loss, account risk), use a **Danger callout** with the warning text — see Section 12.

---

## 10. Link, Don't Repeat

If something is explained on another page, link to it. Don't re-explain it.

✅ _Before you start, [install Celestial Launcher](/en/docs/install/celestial). Then come back here._

❌ _Before you start, install Celestial Launcher. To install Celestial Launcher, first download the installer from divineskins.gg/launcher, then run it, then... [200 more words]_

---

## 11. Cut Filler

Delete these on sight:

- "simply", "just", "basically", "easily", "quickly"
- "please"
- "as you can see", "as mentioned above"
- "it's important to note that"
- "of course", "obviously"

If a step is simple, the reader will notice. You don't need to say it.

### No em dashes or en dashes

`—` and `–` slow non-native readers down. Replace with a period, comma, colon, or parentheses.

| Don't write                                  | Write                                       |
| -------------------------------------------- | ------------------------------------------- |
| It's safe — outside Korea.                   | It's safe outside Korea.                    |
| Open Flint — the all-in-one tool.            | Open Flint, the all-in-one tool.            |
| Three things to check — files, paths, names. | Three things to check: files, paths, names. |

Regular hyphens (`-`) in compound words (`client-side`, `step-by-step`) are fine.

---

## 12. Safety Wording (Use the Exact Phrasing)

Safety comes up in almost every guide. Say it the **same way every time**:

- **Custom skins are safe outside Korea and China.** No bans since 2014 when you use trusted tools like Celestial.
- **Never use custom skins in Korea or China.** The anti-cheat there blocks all mods.
- **Custom skins are client-side only.** Only you see them. Teammates and enemies see the default skin.
- **They give no gameplay advantage.** Nothing about the game changes — only how it looks.

**Place safety info at the top of install guides**, never in a footnote.

For high-risk regions, use a **Danger callout** at the top of the page:

> **Danger.** Never use custom skins in Korea or China. The anti-cheat there blocks all mods. Accounts get banned.

---

## 13. Locked Terminology (Non-Negotiable)

| Never write             | Write instead              |
| ----------------------- | -------------------------- |
| Skin hack, skin changer | Custom skin, mod           |
| Cheat, exploit          | Mod, custom skin           |
| Unlock skins            | Customize, change the look |
| Undetectable            | Safe, client-side          |
| Buy, purchase           | Download, get              |
| Free-to-play skins      | Custom skins               |

These are not style preferences. "Hack" and "undetectable" suggest breaking rules. Custom skins **don't** break rules — the wrong word makes the whole wiki look shady. Reviewers will block PRs over these.

---

## 14. Structure of a Good Guide

```
1. What this guide is for      — one sentence
2. What you need before you start — tools, accounts, files
3. The steps                   — numbered, one action per step
4. How to check it worked      — what the reader sees at the end
5. If something goes wrong     — common problems and fixes
```

Put the most useful thing at the top. Readers skim. If the headline answers their question, they leave happy. If they have to scroll to find it, they leave annoyed.

### Frontmatter

Every guide MDX file needs:

```yaml
---
title: Install Celestial Launcher # required, sentence case, becomes the H1
description: Step-by-step install guide for Celestial on Windows. # ~160 chars, plain English
---
```

Optional: `authors`, `patch`, `icon`, `full`. The `category` is auto-set by path.

### H1 / Headings

H1 is set by the `title` frontmatter — **start your content at `##`**. Don't write a manual H1.

---

## 15. Component-by-Component Patterns

### 15.1 Guide intro paragraph (the very first thing under the H1)

One sentence: what this guide gets you. One sentence: who it's for / what you need.

✅ _This guide installs Celestial Launcher on Windows so you can use custom skins. You need a Windows PC and 5 minutes._

### 15.2 Numbered steps

Verb-first, one action, outcome shown when there is one.

```
1. Download the installer from divineskins.gg/launcher.
2. Run `CelestialSetup.exe`. A welcome window opens.
3. Click **Install**. A progress bar fills. Installation finishes in about 30 seconds.
4. Click **Launch**. Celestial opens to the home screen.
```

### 15.3 Callouts (use the MDX `<Callout>` component)

| Type        | Use for                                                                  | Tone                 |
| ----------- | ------------------------------------------------------------------------ | -------------------- |
| **Note**    | Helpful side info, optional context                                      | Neutral              |
| **Tip**     | A shortcut, a faster way, an "if you also want X" detour                 | Friendly             |
| **Warning** | A common mistake or non-fatal risk (e.g. "this can be slow on weak PCs") | Calm, factual        |
| **Danger**  | High-risk: account bans, data loss, irreversible action                  | Direct, no softening |

Examples:

> **Note.** Celestial only works on Windows right now. Mac support is in progress.

> **Tip.** You can drag a fantome file directly onto Celestial to import it.

> **Warning.** Installing while LoL is open can break the client. Close LoL first.

> **Danger.** Never use custom skins on Korean or Chinese servers. Anti-cheat there blocks all mods. You will be banned.

### 15.4 Error messages and troubleshooting

In a "If something goes wrong" section, use a `## Troubleshooting` heading and a list of "Problem → Fix" pairs:

```
## Troubleshooting

### Celestial won't open
Check that LoL is not running. Right-click the Celestial icon and "Run as administrator".

### Skin doesn't show in game
Make sure you installed the skin in Celestial first. Then restart LoL.
```

### 15.5 FAQ entries (when a guide ends with a small FAQ)

The wiki FAQ is more patient than the prod app's "Easy. / Yep. / Nope." style. Match these:

```
### Can I use custom skins in ranked?
Yes, anywhere except Korea and China. They're client-side only and give no gameplay advantage.

### What if a skin breaks after a patch?
Celestial auto-updates skins when the creator fixes them. If a skin is still broken after 24 hours, the creator hasn't shipped a fix yet.
```

### 15.6 Frontmatter `description`

~160 characters. One plain sentence that says what the page covers. No marketing.

✅ _Step-by-step install guide for Celestial Launcher on Windows._
✅ _How to import a finished custom skin into Celestial and test it in-game._
❌ _Unleash the power of custom skins with our comprehensive Celestial install guide!_

### 15.7 UI button copy and microcopy

When a guide quotes a button label, **match the actual UI exactly** (case, punctuation, spacing). Wrap the label in `**bold**`:

✅ _Click **Install**._
❌ _Click "install"._ ❌ _Click the install button._

For your own copy on wiki UI (not quoting the app), use sentence case and 1–3 words.

---

## 16. The Four Reusable Patterns

These are the patterns the wiki keeps reaching for. When in doubt, pick one.

### 1. Verb-first command + outcome

> _Click Install. A green checkmark appears when the skin is ready._

### 2. Warning + reason, in that order

> _Close League of Legends before you install. Installing while the game is open can break the client._

### 3. Jargon definition + immediate use

> _A mod is a file that changes how the game looks. Download the mod you want._

### 4. Negation pair (for reassurance)

> _No bans since 2014. No gameplay changes — only how it looks._

---

## 17. Audience Notes

- **Creators (Maya / Blender / VFX, the core wiki audience):** Slightly more technical depth is OK. Still explain jargon on first use, still verb-first, still no fluff.
- **Curious end-users wandering in:** Don't assume modding background. Explain _mod_, _fantome file_, _client_, _patch_ on first use.
- **Global readers (FR / TR / BR / US):** Avoid US-only idioms. Plain English translates better. Short sentences translate better. Crowdin will thank you.
- **Minors:** A meaningful chunk of readers are under 16. No swearing. No "edgy" jokes. Be patient and warm.

---

## 18. Review Workflow

When reviewing existing copy, walk this checklist in order:

1. **Compliance scan** — banned terms (skin hack, cheat, undetectable, buy, free-to-play skins), missing KR/CN exclusions, payment claims for skins.
2. **Voice scan** — does it sound like a patient friend? If not, rewrite.
3. **Length scan** — sentences > 20 words? Paragraphs > 3 sentences? Cut.
4. **Hype scan** — RPG verbs ("ascend", "unleash"), three-word slogans, stacked adjectives, em dashes? Remove.
5. **Casing scan** — sentence case for headlines and buttons. UPPERCASE only on tiny eyebrows.
6. **Truth scan** — every stat or claim defensible? (Don't invent counts.)
7. **Structure scan** — does the guide follow the 5-part structure? Is safety info near the top?

For each piece reviewed, return:

- **Original**
- **Revised**
- **One-sentence rationale**
- **Severity:** 🔴 Critical (compliance / banned terms) · 🟡 Important (voice / clarity / structure) · 🟢 Polish

---

## 19. Publish Checklist

Run through every item before delivering:

- [ ] A 12-year-old can follow every step
- [ ] No words from the "Never write" list
- [ ] Every numbered step starts with a verb
- [ ] Every sentence is under 20 words
- [ ] Every paragraph is 3 sentences or fewer
- [ ] No em dashes or en dashes in prose
- [ ] Each big step says what the reader should see after
- [ ] Safety info is near the top, not buried
- [ ] Jargon is explained on first use
- [ ] Warnings come before the risky step, not after
- [ ] No filler ("simply", "just", "please", "basically")
- [ ] Reader is addressed as "you", never "the user"
- [ ] Frontmatter has `title` and a plain ~160-char `description`
- [ ] Content starts at `##`, not `#`
- [ ] All `<img>` tags have `alt="..."`
- [ ] If the guide touches install or regions, KR/CN exclusion is explicit

---

## 20. Quick Swap Sheet

When AI / corporate flavor sneaks in, swap it.

| Instead of…                               | Write…                             |
| ----------------------------------------- | ---------------------------------- |
| "Utilize the export functionality"        | "Click Export."                    |
| "Navigate to the catalog page"            | "Open the catalog."                |
| "Ensure your file is properly configured" | "Check your file is set up right." |
| "It's important to note that…"            | (delete the phrase)                |
| "Simply click here to easily install"     | "Click Install."                   |
| "Welcome to the Divine Skins wiki!"       | (start with what they came for)    |
| "Unleash your creativity"                 | (delete the sentence)              |
| "The user must then proceed to…"          | "Then…"                            |

---

_This guide expands `docs/voice.md` (the source of truth). When `docs/voice.md` changes, mirror the change here._
