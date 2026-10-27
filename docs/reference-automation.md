# Tested React reference publication and adoption

The existing workbench verification, candidate preparation and npm publication workflows now call `.github/workflows/reference-release.yml`. This is a separate reference-archive pipeline; the npm `publish` job, OIDC permission, `next` tag, package versions and trusted-publisher workflow filename are unchanged.

## Triggers and guarantees

- A push to `main` automatically publishes/adopts references **after all three existing `verify` jobs succeed**. Pull requests run verification without publishing or receiving adoption credentials.
- `Publish experimental React packages` also calls this pipeline after its existing release verification. It does not depend on npm publication, or cause npm packages to be republished.
- `Prepare experimental React candidates` retains its normal unpublished npm candidates. The optional `publish_references` boolean (default false, main only) explicitly runs reference publication/adoption too. Its `family` choice still applies only to npm candidates; references always publish both families.
- Embedded agent ZIP and tar downloads use sorted entries and fixed timestamps/ownership so rebuilding a commit does not change reference hashes merely because time passed.
- The packager builds both archives once. Artifact versions are `<preview.version>-sha.<full-source-commit>`, independent of npm versions. Each `manifest.json` entry pins the archive filename, artifact version, preview version, source commit, SHA-256 and byte count.
- Three browser jobs download those same archives, validate digests and metadata, safely extract them into `docs-dist`, and run the reference suite. The publisher downloads the very same workflow artifact; it never rebuilds the archives.
- Publication uses a `design-v<artifactVersion>` prerelease, initially a draft until every asset has uploaded and its server-computed SHA-256 has matched. Reruns verify existing digests and tag identity; they never overwrite release assets or move tags. Enable GitHub immutable releases as an additional repository-level guarantee if desired.
- A GitHub App installation token opens one PR per host, changing only `site/react-reference.json`. App credentials cause normal host PR CI to run; the workbench's repository-scoped `GITHUB_TOKEN` cannot perform cross-repository adoption.
- The merger requires classic branch protection with the `verify` check tied to GitHub Actions, strict up-to-date checks and administrator enforcement. It separately checks successful `ci.yml` PR execution and the `verify` job, exact PR contents and unchanged head SHA. GitHub protection remains authoritative at the merge API call. It does not bypass reviews or merge queues. Missing protection, read access, approvals or failed CI leaves the PR unmerged.
- After merging, the workflow waits for the **Cloudflare app's** `Workers Builds: martlettheme` / `Workers Builds: krigsvoldtheme` success on the **host merge commit**, then fetches the corresponding live React `/preview.json` without cache and compares family, both versions, source commit, base and read-only marker. Merge alone is never reported as deployment success.

## One-time setup

### 1. Create and install a GitHub App

Create an organization-owned GitHub App under **k3jph → Settings → Developer settings → GitHub Apps → New GitHub App**, for example `Design Reference Adoption` (use a unique name if taken).

- Homepage: `https://github.com/k3jph/design-workbench`.
- Disable Webhooks; no callback URL or user authorization is needed.
- Allow installation on **Any account**, so it can be installed in both host organizations.
- Repository permissions:

| Permission | Access | Purpose |
| --- | --- | --- |
| Contents | Read and write | Read pins, create adoption branch/commit, merge |
| Pull requests | Read and write | Open/read adoption PRs and file lists |
| Actions | Read-only | Require successful host CI workflow/jobs |
| Checks | Read-only | Verify Cloudflare check on the merged commit |
| Administration | Read-only | Read and enforce host branch-protection configuration |
| Metadata | Read-only (automatic) | Repository identity |

No Workflows write permission, npm token, Cloudflare API token or administrative write permission is required by the automation.

Install the App separately into `martlettheme` and `krigsvoldtheme`, choosing **Only select repositories** and selecting `martlettheme/martlettheme` and `krigsvoldtheme/krigsvoldtheme`, respectively. Do not give the App a ruleset/branch-protection bypass. It does not need installation in `k3jph`.

Generate a private key on the App's settings page. In **k3jph/design-workbench → Settings → Secrets and variables → Actions**:

- Add repository **variable** `ADOPTION_APP_ID` = the App ID (not Client ID or installation ID).
- Add repository **secret** `ADOPTION_APP_PRIVATE_KEY` = the complete downloaded PEM private key, including header/footer and newlines.

Equivalent commands from an authenticated GitHub CLI:

```sh
gh variable set ADOPTION_APP_ID --repo k3jph/design-workbench --body 'YOUR_NUMERIC_APP_ID'
gh secret set ADOPTION_APP_PRIVATE_KEY --repo k3jph/design-workbench < /secure/path/design-reference-adoption.pem
```

Never paste the private key into an issue, PR or chat. The workflow creates separate repository-scoped installation tokens for each family and revokes them after the jobs.

### 2. Require host CI before merging

In **each** host repository, open **Settings → Branches → Add classic branch protection rule**, targeting `main` (edit an existing matching rule instead of adding a conflicting one):

1. Require a pull request before merging. Keep any existing required reviews; the automation waits for them and times out rather than bypassing them.
2. Require status checks to pass: select **`verify`**, with **GitHub Actions** as the expected source (App ID `15368`).
3. Enable **Require branches to be up to date before merging**.
4. Enable **Do not allow bypassing the above settings** (the API reports `enforce_admins.enabled: true`).
5. Keep force pushes/deletions disabled and ensure the adoption App has no bypass.
6. Allow squash merging in **Settings → General → Pull Requests**. Native GitHub auto-merge need not be enabled: this workflow calls the guarded merge endpoint after CI succeeds.

This implementation explicitly reads the classic branch protection endpoint. A ruleset-only repository must also expose the matching classic protection, or the merger will stop. Preserve stronger existing rules; if a merge queue is required, merge through that queue and rerun the adoption job to perform post-merge verification.

A read-only setup check (run as an administrator; do not replace existing protection wholesale):

```sh
gh api repos/martlettheme/martlettheme/branches/main/protection \
  --jq '{strict: .required_status_checks.strict, checks: .required_status_checks.checks, enforce_admins: .enforce_admins.enabled}'
gh api repos/krigsvoldtheme/krigsvoldtheme/branches/main/protection \
  --jq '{strict: .required_status_checks.strict, checks: .required_status_checks.checks, enforce_admins: .enforce_admins.enabled}'
```

Expect `strict: true`, `enforce_admins: true`, and a check `{context: "verify", app_id: 15368}`. The connected implementation session could read repository/check data but did not have access to these protection settings, so their present configuration must be checked during setup.

### 3. Confirm Actions and Cloudflare settings

- Allow the actions already used by the repository plus `actions/download-artifact@v4` and `actions/create-github-app-token@v2`. The publisher explicitly requests `contents: write`; organization policy must permit that job permission. Default token permissions can remain read-only.
- Retain the existing Cloudflare Workers Git integrations for both hosts, production branch `main`, current build/deploy commands, and the custom React domains. No new Cloudflare secret is needed. The observed check names and app ID (`85455`) are recorded in the script; renamed workers need a matching configuration change.
- Keep the existing npm trusted publishers and secrets/settings unchanged.

### 4. Activate and observe

After setup, merge the implementation PR once its existing three-browser workbench CI is green. The resulting main push runs verification, packages and tests archives, publishes a prerelease, opens the two host PRs, merges them only after their required CI/reviews, then verifies deployments and live versions. The Actions job summary links the release, adoption PRs and Cloudflare checks.

For a later retry at the current main commit, rerun the failed jobs from the original workflow (preserves the same source commit and packaged bytes). To start a new run on main explicitly:

```sh
gh workflow run prepare-release.yml --repo k3jph/design-workbench --ref main \
  -f family=both -f publish_references=true
```

## Failure and recovery

- **Credentials absent:** archives may already be published; adoption stops with named setup instructions. Configure the App and rerun failed jobs. Nothing is silently treated as successful.
- **Unprotected host / insufficient permission:** the PR remains open. Fix protection or App permissions and rerun. Do not give the App bypass rights.
- **CI failure or required review:** inspect the host PR. Fix the source and publish a new commit, or complete the review and rerun the job. The code does not automatically merge a skipped or failing job.
- **Base changed:** strict protection prevents stale merges. Update the PR branch in GitHub, wait for fresh CI, then rerun. The workflow refuses to overwrite a changed branch while creating a PR.
- **A closed, unmerged adoption PR:** the automation respects that decision and fails; it does not reopen or recreate the PR.
- **Partial publication:** rerun verifies the existing tag/assets and completes an unfinished draft. A mismatched digest fails; use a new source commit instead of replacing public bytes.
- **Cloudflare failure or stale live metadata:** the host PR may be merged, but the job fails. Fix/retry the existing Cloudflare deployment and rerun the adoption job; it recognizes the merged PR and only verifies deployment. Waiting limits are 15 minutes for CI, 12 for Cloudflare and 5 for the live endpoint (40-minute job ceiling).
- **A newer reference already adopted:** an older rerun is refused rather than rolling back the host. Rollback is an explicit reviewed host PR restoring a known archive pin, followed by deployment verification.
- **Workflow artifact expired:** rerun the whole workflow at the same commit to regenerate it. Existing published digests must match; otherwise publish from a new commit. Archive reproducibility is checked, never assumed.

The React artifact version is visible at:

- `https://react.martletdesign.dev/preview.json`
- `https://react.krigsvolddesign.dev/preview.json`

API/action references: [GitHub release assets and digests](https://docs.github.com/en/rest/releases/assets), [branch protection](https://docs.github.com/en/rest/branches/branch-protection), [GitHub App token action](https://github.com/actions/create-github-app-token/tree/v2).
