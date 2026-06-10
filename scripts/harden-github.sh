#!/usr/bin/env bash
# One-shot GitHub hardening for going public. Run AFTER flipping the repo to
# public (branch protection and fork-PR approval are unavailable on private
# repos under the free plan). Requires gh with admin access to the repo.
#
#   ./scripts/harden-github.sh
#
# Flip visibility first (interactive, hard to undo quietly, so not automated):
#   gh repo edit DivineSkins/divine-wiki --visibility public --accept-visibility-change-consequences

set -euo pipefail

REPO="DivineSkins/divine-wiki"

visibility=$(gh repo view "$REPO" --json visibility -q .visibility)
if [ "$visibility" != "PUBLIC" ]; then
  echo "Repo is $visibility. Flip it to public first (see header comment)." >&2
  exit 1
fi

# The prettier workflow is path-filtered, so it is intentionally NOT a
# required status check: an image-only PR would never report it and could
# never merge. Review approval is the gate.
echo "Protecting main: require 1 PR review, no force pushes, no deletions..."
gh api -X PUT "repos/$REPO/branches/main/protection" \
  --input - <<'JSON'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

echo "Requiring approval for workflow runs from first-time contributors..."
gh api -X PUT "repos/$REPO/actions/permissions/fork-pr-contributor-approval" \
  -f approval_policy="first_time_contributors"

echo "Done. Verify at https://github.com/$REPO/settings/branches"
