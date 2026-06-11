# Open-source operations playbook

How to take this repo public and run it safely as an open-source project.
Written for maintainers without a devops background. Every claim here was
verified against primary sources (GitHub Docs, GitHub Security Lab, OpenSSF,
first-party incident reports) in June 2026.

Pair this with [`playbook.md`](./playbook.md) (content operations) and
[`../CONTRIBUTING.md`](../CONTRIBUTING.md) (contributor-facing rules).

---

## Where we stand (audited 2026-06-11)

Already in place and good:

- **Licenses**: MIT for code (root `LICENSE`), CC BY-SA 4.0 for guide content
  (`content/LICENSE`). README states the split. Same model as the Kubernetes
  website and MDN.
- **Community health files**: README, CONTRIBUTING, CODE_OF_CONDUCT,
  SECURITY.md, issue templates with `config.yml` routing questions to Discord,
  PR template. This is the full set GitHub looks for; nothing important is
  missing.
- **Default Actions token is read-only** (repo setting), and workflows cannot
  approve PRs.
- **Git history is clean**: 245 commits, no `.env` ever committed, and a
  pattern scan for GitHub/AWS/OpenAI/Slack tokens, private keys, and JWTs
  found nothing.
- **`scripts/harden-github.sh`** is ready to apply branch protection and
  first-time-contributor workflow approval after the flip.

Fixed in the same-day hardening pass (2026-06-11): all workflows SHA-pinned
on current action versions (clears the Node 20 deadline) with least-privilege
`permissions:` blocks, `dependabot.yml` added, CODEOWNERS simplified to a
working catch-all (`* @DISCOCX`; the old file pointed at nonexistent teams
and pre-`lol/` paths), SECURITY.md and the PR template corrected, squash-only
merges with branch auto-delete, topics set, Dependabot alerts and security
updates enabled.

Still open (see [Fix list](#fix-list)):

- `CROWDIN_PROJECT_ID` and `CROWDIN_PERSONAL_TOKEN` secrets were never set,
  so both Crowdin workflows had failed every scheduled run for weeks. They
  are now **disabled** (`gh workflow enable <name>` after setting secrets).
- "Allow GitHub Actions to create and approve pull requests" is blocked by
  an org-level setting that needs the `admin:org` token scope to change.
  Required before crowdin-download can open its sync PRs.
- Everything gated on going public (free-plan limits on private repos):
  branch protection, secret scanning, CodeQL, private vulnerability
  reporting, auto-merge.

---

## Go-public runbook

Do these in order. Steps 1 and 2 are the only ones that can't be undone.

1. **Final history check.** Flipping public exposes the entire git history
   forever, including deleted files and old commits. Forks and caches mean
   you can never truly retract it. The pattern scan above came back clean,
   but for belt-and-suspenders run a real scanner first:

   ```bash
   brew install gitleaks
   gitleaks git --no-banner .
   ```

   If anything real ever turns up in history, **rotate the credential**.
   Rewriting history doesn't un-leak a secret; treat it as burned.

1. **Flip visibility.**

   ```bash
   gh repo edit DivineSkins/divine-wiki --visibility public \
     --accept-visibility-change-consequences
   ```

1. **Run the hardening script.**

   ```bash
   ./scripts/harden-github.sh
   ```

   This protects `main` (1 required review, no force pushes, no deletions)
   and requires maintainer approval before workflows run on PRs from
   first-time contributors. That approval gate is the main defense against
   drive-by PRs that try to abuse CI.

1. **Enable the free security features.** Going public automatically unlocks
   GitHub Advanced Security for free: secret scanning with push protection is
   on by default for public repos. In Settings, then Advanced Security,
   additionally enable:
   - **Dependabot alerts** and **Dependabot security updates** (auto-PRs
     that bump vulnerable dependencies; npm is the ecosystem this works best
     in).
   - **CodeQL code scanning, "Default" setup.** GitHub manages it; no
     workflow file to maintain. Right choice at our scale.
   - **Private vulnerability reporting.** Lets researchers report through
     GitHub's form instead of (or alongside) the security email. Update
     SECURITY.md to mention it.

1. **Tidy general settings.** (Squash-only merging, branch auto-delete, and
   topics were already applied 2026-06-11; the social preview image is the
   only piece left.)
   - Merge button: allow **squash merging only**. One commit per PR keeps
     `main` readable and makes reverts trivial. Disable merge commits and
     rebase merging.
   - Enable **"Automatically delete head branches"**.
   - Add topics (`league-of-legends`, `custom-skins`, `wiki`, `nextjs`,
     `fumadocs`), confirm the description and website URL, upload a social
     preview image.
   - Leave Discussions off. Discord fills that role and the issue template
     `config.yml` already routes questions there.

1. **Decide on CODEOWNERS.** Either create the teams it references and fix
   the paths, or simplify it to route everything to the maintainers until
   reviewer teams are real. A CODEOWNERS file pointing at nonexistent teams
   silently does nothing.

---

## GitHub Actions security

This is the highest-risk area for a wiki accepting PRs from forks. Two real
2025 incidents frame the rules: the March 2025 `tj-actions/changed-files`
compromise (every version tag re-pointed at a malicious commit,
CVE-2025-30066) and the April 2025 Grafana incident (a `pull_request_target`
workflow let an attacker run code from a malicious fork in a trusted
environment and exfiltrate credentials).

The rules, in order of importance:

1. **Use the `pull_request` trigger for CI on fork PRs. Never
   `pull_request_target`.** `pull_request` gives fork PRs a read-only token
   and no secrets. `pull_request_target` runs with write permission and
   secrets, and combining it with a checkout of the PR's code means any
   `package.json` script, build step, or test can compromise the repo. This
   holds even if the workflow references no secrets: the read/write token
   sits in runner memory, readable by any program the workflow runs. Our
   format-check workflow correctly uses `pull_request`. Keep it that way.
   If we ever need privileged PR automation (auto-labeling, preview
   comments), use the split pattern: an unprivileged `pull_request` workflow
   uploads an artifact, and a separate `workflow_run` workflow processes it
   while treating the artifact as untrusted.

1. **Pin third-party actions to full commit SHAs**, with the tag in a
   comment:

   ```yaml
   - uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v5.0.0
   ```

   Tags and branches can be re-pointed by an attacker; a full SHA cannot.
   This is GitHub's own stated guidance ("the only way to use an action as
   an immutable release"). Dependabot understands SHA pins and keeps them
   updated, so this costs nothing once `dependabot.yml` exists.

1. **Declare least-privilege `permissions:` in every workflow.** The repo
   default is already read-only, but explicit blocks survive settings
   changes and document intent:

   ```yaml
   permissions:
     contents: read
   ```

   The crowdin-download workflow needs more
   (`contents: write`, `pull-requests: write`) because it pushes a branch
   and opens a PR. Grant exactly that, nothing else. It also needs
   "Allow GitHub Actions to create and approve pull requests" enabled in
   Settings, then Actions, or PR creation fails even with the right
   permissions.

1. **Never interpolate untrusted input into `run:` scripts.** PR titles,
   branch names, issue bodies, and comments are attacker-controlled on a
   public repo. `run: echo "${{ github.event.pull_request.title }}"` is a
   shell injection. Pass untrusted values through `env:` and quote them:

   ```yaml
   env:
     TITLE: ${{ github.event.pull_request.title }}
   run: echo "$TITLE"
   ```

   None of our current workflows do this, which is why none of them are
   vulnerable today. The rule matters when adding new automation.

1. **Optional: lint workflows with zizmor.** It's a static analyzer
   (sponsored by Grafana after their incident) that catches exactly these
   classes: dangerous triggers, unpinned actions, injection. Run it locally
   (`brew install zizmor && zizmor .github/workflows/`) or add it as a CI
   job later.

---

## Dependency updates

`.github/dependabot.yml` (added 2026-06-11):

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

The `groups` block batches routine npm bumps into one weekly PR instead of
ten, which is the difference between Dependabot being useful and being
noise. Security updates arrive as separate, immediate PRs regardless of
schedule. Review and merge them promptly; they're the main ongoing
maintenance cost of being public.

---

## Branch protection: the script vs rulesets

`harden-github.sh` uses the classic branch protection API. That works, and
the settings it applies are right. GitHub's newer mechanism is **rulesets**,
which layer alongside classic rules (where both define the same rule, the
most restrictive wins), so there's no migration pressure. If we rebuild
protection later, do it as a ruleset in the UI: Settings, then Rules, then
Rulesets.

One trade-off to know about: requiring 1 review means maintainers can't
merge their own PRs without a second person. The script sets
`enforce_admins: false`, so org admins (currently the realistic reviewers)
can still merge directly when needed. With 3 org members this is the right
balance; revisit if the maintainer team grows.

---

## Community health files

GitHub recognizes a fixed set: README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT,
SECURITY, SUPPORT, GOVERNANCE, FUNDING.yml, issue/PR templates. Lookup order
per file: `.github/` folder first, then repo root, then `docs/`. Ours live at
the root and in `.github/`, which is correct. Two notes:

- Keep health files out of our `docs/` folder. It's the AI-context pack, and
  GitHub treating it as a fallback location is a collision we don't want.
- An org-level `.github` repo can provide defaults across repos, but for a
  single-repo project in-repo files are simpler. Skip it.

We deliberately don't have: SUPPORT.md (the issue template `config.yml`
routes support to Discord already), GOVERNANCE.md (three people don't need
one), FUNDING.yml (add later if sponsorship becomes a thing).

---

## Licensing

The split is already implemented and is the standard pattern for doc sites:

- **Code: MIT** (root `LICENSE`). GitHub's license detector reads only the
  root file, so the repo badge says MIT. That's expected.
- **Content: CC BY-SA 4.0** (`content/LICENSE`). Share-alike means forks of
  the guides must stay open, which protects community-written content from
  being scraped into closed products.
- README and CONTRIBUTING state that contributing means agreeing to both.
  That line is the lightweight alternative to a CLA and is enough at our
  scale.

---

## Day-2 maintenance

The recurring work after going public, roughly 30 minutes a week:

- **Review Dependabot PRs.** Grouped weekly PR plus occasional security PRs.
  CI (format check) plus a local `npm run build` is enough validation for
  most bumps.
- **Triage issues.** Label them (`bug`, `content`, `good first issue`,
  `i18n`). `good first issue` is GitHub-blessed and surfaces the repo to
  new contributors. No formal SLA; the CONTRIBUTING flow already pushes
  quick questions to Discord.
- **Watch the security tab.** Secret scanning, CodeQL, and Dependabot alerts
  all land there. Empty most weeks.
- **Crowdin sync PRs** (once secrets are set): review per locale, merge, and
  never hand-edit `content/docs/<locale>/` directly.
- **First-time contributor workflow approvals.** Each fork PR from a new
  contributor waits for a maintainer to click "Approve and run". Glance at
  the diff for workflow-file changes before approving.

---

## Fix list

Updated 2026-06-11 after the first hardening pass. Remaining, in order:

1. **Go public** (runbook above), run `./scripts/harden-github.sh`, then in
   Settings enable CodeQL default setup and private vulnerability reporting.
1. **Crowdin secrets.** Needs the maintainer's Crowdin values plus an org
   permission our token couldn't change:

   ```bash
   gh auth refresh -h github.com -s admin:org
   gh secret set CROWDIN_PROJECT_ID
   gh secret set CROWDIN_PERSONAL_TOKEN
   gh api -X PUT orgs/DivineSkins/actions/permissions/workflow \
     -f default_workflow_permissions=read \
     -F can_approve_pull_request_reviews=true
   gh api -X PUT repos/DivineSkins/divine-wiki/actions/permissions/workflow \
     -f default_workflow_permissions=read \
     -F can_approve_pull_request_reviews=true
   gh workflow enable crowdin-upload.yml
   gh workflow enable crowdin-download.yml
   gh workflow run crowdin-upload.yml
   ```

1. **Social preview image** (Settings, then General). Used when the repo
   link is shared on Discord and social media.
1. **Auto-merge** (optional, Settings, then General) once public; the free
   plan blocks it on private repos. Handy for Dependabot PRs.
