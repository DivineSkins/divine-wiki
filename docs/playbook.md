# Wiki playbook

How the Divine wiki is structured, who contributes, and how quality stays high. Distilled from how the best community gaming/modding wikis actually work — Nexus, BSMG, CSLOL, Cyberpunk RedModding, Arch, OSRS, Terraria, Minecraft, Fabric, Kubernetes docs.

Pair this with [`voice.md`](./voice.md) (how to write) and [`product.md`](./product.md) (what we are).

---

## Page types

Five types. One template per type. Don't invent new ones.

| Type                | Purpose                                        | Examples                                                       |
| ------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| **Hub**             | Routing only — icon grid that points elsewhere | Landing page, "For creators" hub, "Use skins" hub              |
| **Tutorial**        | One linear happy path, beginner-first          | "Install Celestial", "Submit your first skin"                  |
| **How-to**          | One task, goal-oriented, intermediate          | "Install a skin", "Update Celestial", "Move skins to a new PC" |
| **Reference**       | One entity per page, identical layout          | Per-skin pages, per-launcher-feature pages, file format spec   |
| **Troubleshooting** | Symptom → cause → fix                          | "Skin doesn't show in game", "Celestial won't open"            |
| **Changelog**       | Dated, never edited after publish              | Per-LoL-patch status page, Celestial release notes             |

Tutorial vs how-to is the split people get wrong. Tutorial = "I'm new, walk me through it." How-to = "I know what I want, give me the steps."

---

## Landing & navigation

**Landing page = icon-tile grid.** 6–8 tiles, max. One icon + one short label per tile (most readers are non-native English — fewer words is better). No long intro paragraph above the grid.

Tile candidates:

- Get Started
- Install Celestial
- Install a Skin
- Troubleshooting
- Safety & Regions
- For Creators
- Patch Status
- About

**Search is first-class on every page.** Top of every page, autocomplete, fuzzy/partial match. Non-native English readers lean on search but suffer when there's no autocomplete (Wikipedia mobile research).

**Sidebar groups, max 4 buckets, max 6 links each.** Over-nesting dies on mobile. OSRS pattern: Navigation / Guides / Community / Tools.

**Bottom of every article: a context navbox.** Install pages link sideways to all install pages; troubleshooting pages link sideways to all troubleshooting pages. Readers land from Google — give them lateral exits without making them re-find the hub.

**Split top-level nav: "Use skins" vs "Make skins."** Don't mix audiences. A reader installing a skin shouldn't wade through creator submission rules (Fabric, Cyberpunk pattern).

---

## Install guides

The most-read page type. Get this one right or nothing else matters.

**One verb, one screenshot, one outcome — per step.**

```
3. Click **Install**.
   ![Install button highlighted](./img/install-button.png)
   You should see a green checkmark when the skin is ready.
```

**Structure:**

1. **What this guide is for** (one sentence)
2. **Before you start** — prerequisites (LoL installed, Celestial installed, region not KR/CN)
3. **The steps** — numbered, one verb each, screenshot per step
4. **How to check it worked**
5. **If something goes wrong** — link to the matching troubleshooting page (don't repeat it here)

**Inline mini-warnings at the steps people break.** Not at the top of the page. At the actual step.

**Show the expected folder layout as a code block** when the install touches files (Stardew/SMAPI pattern):

```
Celestial/
├── profiles/
│   └── default/
│       └── Ahri-Spirit-Blossom.fantome
└── celestial.exe
```

**Split long flows into separate pages**, don't make one mega-page (OpenMW pattern):

- Install Celestial
- Install a skin
- Launch with skins active

---

## Troubleshooting

**Symptom-first.** Each H2 is what the user sees, not what we think the cause is. This is the dominant pattern across BSMG, Nexus, Cyberpunk wiki — and the one users actually find via Google.

```
## Skin doesn't show in game

**Why this happens:** Celestial wasn't running when League launched, or the skin is for a different champion than you locked in.

**Fix:**
1. Close League.
2. Open Celestial.
3. Confirm the skin shows a green checkmark.
4. Launch League from Celestial.

**If still broken:** [Reinstall Celestial →](./reinstall-celestial.md)
```

**Cross-link from the install step where that problem usually happens** ("If you don't see the green checkmark, see [Skin doesn't show in game]"). Don't paste the troubleshooting inline.

**Push Discord _after_ a written page exists**, not before. BSMG explicitly says "check this page before asking in Discord." Cuts repeat questions.

---

## Patch & version handling

LoL patches every two weeks. Skins break. Plan for it.

**Per-skin pages get a "Last tested on patch X.Y" badge.** Don't rewrite the page each patch — just bump the badge.

**Site-wide "Patch status" page, updated in place.** One page, not a new post per patch. Says: current patch, which categories of skins broke, ETA on fixes. Pinned in the landing hub on patch days.

**Per-patch changelog pages live in `/patch-notes/`** (separate namespace), one page per Celestial release, dated, never edited after publish (EVE University, WoWWiki pattern).

**Set expectations culturally.** Borrow BSMG's line, in Divine voice:

> Skins break on patch days. That's normal. Creators are volunteers. Give them a few days.

Put it on the patch status page. Reduces the patch-day rage spike.

---

## Safety & banned-region wording

Already covered in [`voice.md`](./voice.md), but two extras from research:

**Use Riot's own "use-at-your-own-risk" phrasing** rather than inventing legal language (CSLOL pattern). It's free legal cover and matches how Riot itself talks about mods.

**Banned-region warning is a red callout, one sentence, blunt.** Don't soften it. Don't bury it in a paragraph. Put it at the top of every install guide and on the landing page:

> **Don't use custom skins on Korean or Chinese servers.** The anti-cheat blocks all mods. You can get banned.

CSLOL's safety page is good but omits this. We won't.

---

## Creator / contributor docs

Top-level split, as above: "Make skins" lives in its own hub with its own sidebar.

**Five pages, in this order:**

1. **Make your first skin** — a working step-through (Fabric "your first mod" pattern). ZIP a `.fantome`, add cover image, fill metadata, hit submit, see the review queue.
2. **Asset requirements** — file format, cover image dimensions, naming rules. Tables, not prose.
3. **Submission rules** — 7–10 numbered items. What gets rejected. Short. No lectures (Nexus submission-guidelines tone).
4. **Review process** — what reviewers check, SLA, what happens if it's rejected.
5. **Updating for new patches** — how to push a fix when LoL breaks your skin.

Frame the why before the what. Nexus' best-practices doc organizes around author incentives (discoverability → usability → user support), not rules. Match that.

---

## Contribution flow

The wiki is open-source, Git-based (Markdown in a repo). Anonymous reading, but every edit is a PR. That makes vandalism a non-issue.

**Three contribution tiers, one per skill level — surface all three on every page:**

| Tier                   | Friction                                                                          | Who                          |
| ---------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| **Edit on GitHub**     | Click "Edit this page" → GitHub web editor → propose changes. Zero Git knowledge. | Anyone with a GitHub account |
| **Suggest on Discord** | Deep-link to `#wiki-feedback` channel                                             | Anyone — no GitHub needed    |
| **Clone & PR**         | Standard Git flow                                                                 | Regular contributors         |

The GitHub web editor route is the single biggest funnel for drive-by typo fixes. Every page needs an "Edit this page" link.

**Adopt ArchWiki's three rules verbatim** in `CONTRIBUTING.md`:

1. Every edit needs a descriptive summary.
2. Atomic edits only (no mega-diffs).
3. Big changes get announced first (for us: a `#wiki-proposals` Discord thread).

These three rules are the most durable piece of wiki governance ever written. Don't reinvent them.

---

## Review & quality control

**`CODEOWNERS` file routes auto-reviewers per directory.** Tiered approval:

- Typo / translation PRs → any merged contributor can approve
- Structural / policy / safety PRs → named maintainers only

**Trusted-contributor ladder, public:** Reader → Contributor → Trusted Editor → Maintainer. Promotion thresholds in merged-PR count and review quality. Kubernetes SIG Docs pattern. Clear paths convert casual contributors into long-term ones.

**Anti-vandalism heuristic:** PRs from GitHub accounts < 7 days old require maintainer review. PRs from new accounts touching > 3 files get blocked. Cheap, doesn't burden normal contributors.

**CI gate (kept deliberately thin):** Prettier formatting only. Markdown lint, broken-link scans, and spell-check were tried and removed — they failed PRs on legitimate champion names and flaky third-party links, which scared off the drive-by contributors the wiki depends on. Reviewers handle voice, links, and image hygiene at PR time.

**PR template checklist** (reviewers tick publicly):

- [ ] Voice sounds like a gamer friend, not marketing
- [ ] No banned terms (skin hack, undetectable, buy, etc.)
- [ ] Screenshots compressed
- [ ] Linked from the relevant hub page

---

## Translation

Top markets are France, Turkey, Brazil, US. Translation is launch-day, not later.

**Crowdin (free OSS tier) + Fumadocs i18n.** Native integration. Translation memory, machine-translation pre-fill, community translator moderation, one promoted "language lead" per locale with proofreader rights.

**Per-locale Discord channels** as coordination rooms: `#wiki-fr`, `#wiki-tr`, `#wiki-br`. Mirrors how Minecraft and Discord-itself coordinate community translation.

**Untranslated pages serve English silently.** Never 404. Fumadocs does this by default.

---

## Recognition & retention

For a 16–24-year-old audience, social currency in Discord matters more than a contributors page.

- **`all-contributors` bot** to recognize non-code work (translation, screenshots, bug reports, design) — not just commits.
- **Discord roles synced to merged-PR count:** `Wiki Contributor` (1+), `Wiki Editor` (10+), `Wiki Maintainer` (named). Visible to 60K members.
- **Author bylines + last-updated date** on every page, pulled from git log. Fumadocs surfaces both natively.

---

## Discord ↔ wiki bridge

60K Discord members will out-volume any maintainer team that copy-pastes reports.

- **`#wiki-feedback`** channel for "this page is wrong / missing." Use a lightweight emoji-reaction bot to convert reactions into structured GitHub issues.
- **`#wiki-proposals`** for ArchWiki rule #3 (big changes announced first).
- **Per-locale channels** (above) for translation work.
- All written troubleshooting pages link "If still broken, ask in `#help`" — Discord is escalation, not the first line.

---

## Quick checklist before publishing any page

- [ ] Page type is one of the five (hub / tutorial / how-to / reference / troubleshooting / changelog)
- [ ] Title says what the page is in 5 words or fewer
- [ ] No banned terms (see [`voice.md`](./voice.md))
- [ ] No filler words
- [ ] Every step starts with a verb
- [ ] Every sentence under 20 words
- [ ] Safety info near the top, banned-region callout if it touches install
- [ ] Cross-linked from the relevant hub
- [ ] Bottom navbox links to sibling pages
- [ ] Last-tested-on-patch badge if version-sensitive
- [ ] "Edit this page" link works
