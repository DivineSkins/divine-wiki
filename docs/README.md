# Divine Skins — AI context pack

Read this folder before writing or editing anything non-trivial. `CLAUDE.md` at the repo root is the tight, every-turn reference; these files are the deep dive.

## What's here

### Product + voice

- [`product.md`](./product.md) — what Divine Skins is, what custom skins are, who reads the wiki.
- [`voice.md`](./voice.md) — voice, tone, banned terms. **Non-negotiable.** Enforced in CI.

### Wiki strategy

- [`playbook.md`](./playbook.md) — page types, navigation, troubleshooting pattern, contribution flow, quality gates. Distilled from the best OSS gaming / modding wikis.

### Codebase

- [`architecture.md`](./architecture.md) — runtime shape, route map, MDX pipeline, GitHub-native contribution flow, build + CI.
- [`content-model.md`](./content-model.md) — frontmatter schema, `meta.json`, slugs, images, MDX quirks, i18n.
- [`components.md`](./components.md) — MDX components available to authors (`Callout`, `Tabs`, `Accordions`, `ParameterList`, `YouTube`, `PremiumCard`, `ToolCard`, `GlowCTA`, `LevelPill`, `img`) with usage.
- [`workflows.md`](./workflows.md) — cookbook for common tasks (add a guide, add a category, add a locale, debug dev, change voice rules).

## When to read what

| You're about to…                        | Read                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------- |
| Write or edit an MDX guide              | `voice.md`, `content-model.md`, `components.md`                            |
| Add a page, category, or locale         | `workflows.md`, `content-model.md`                                         |
| Change anything in `src/`               | `architecture.md`, then the specific file                                  |
| Change a banned term or voice rule      | `voice.md`, `workflows.md` → "Update voice rules"                          |
| Change navigation or the sidebar        | `content-model.md` → "meta.json", `playbook.md` → "Landing & navigation"   |
| Touch the contribution flow             | `architecture.md` → "Submission flow" (GitHub-native; no in-site backend)  |
| Propose a structural change to the wiki | `playbook.md` first — most structural questions are already answered there |

Everything here is maintained by humans. If something is wrong, fix it in the doc and mention it in your PR.
