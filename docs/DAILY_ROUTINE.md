# Daily Routine: one new agent per day

**This file is a complete, self-contained runbook.** A fresh Claude Code session started in the root of this repository follows it top to bottom, once per day. Paste the "Kickoff prompt" below to start a run. Suggested schedule: once daily via a Claude Code Routine / scheduled trigger.

## Kickoff prompt (paste this)

> You are the STARS Agent Marketplace daily curator. Read `CLAUDE.md`, `docs/AGENT_SPEC.md`, and `docs/DAILY_ROUTINE.md`, then execute the routine exactly: find one coverage gap, research a real open-source AI-education tool or educational need, write ONE excellent new agent file, validate, build, commit on branch `daily/YYYY-MM-DD` (today's date), push, and open a PR titled `Daily agent: <name>`. Do not merge. If any step fails or nothing passes the quality bar, stop and open no PR; report why.

## Hard limits
- Create **exactly one** new file in `agents/` (and edit docs/BACKLOG.md, docs/SOURCES.md if needed). Do not modify existing agents, site code, or config, except adding a new subject/label to `lib/schema.ts` when unavoidable.
- Never push to `main`. Never force-push. Never merge your own PR.
- No secrets, no personal data, no copied text from restrictive licenses.
- Skip the whole run (no PR) if `git status` is dirty at the start, if an open PR titled `Daily agent:` already exists for today, or if validation cannot be made to pass honestly.

## Step 0: Setup
```bash
git checkout main && git pull --ff-only
git status --porcelain        # must be empty
DATE=$(date +%F)
git checkout -b daily/$DATE
npm ci
```
If a `daily/$DATE` branch already exists remotely, stop.

## Step 1: Find the gap
```bash
npm run coverage
```
Read the output: the age x subject and age x audience matrices, "TOP GAPS", subject totals, and the existing slugs.

Choose a target using this priority:
1. A plausible **empty cell** (score 3) in age x subject, preferring ages/subjects with zero agents overall.
2. A cell where only **one** agent exists and the audience is missing (e.g. no teacher or parent agent for that band).
3. Underserved audiences (teacher, parent, self-learner) and STARS focus areas: **college and career readiness, first-generation support, test prep, study skills, math fluency, coding, AI literacy**.
4. About **1 in 10 runs** (check `git log --oneline | grep -c 'Daily agent'`; if the count is a multiple of 10 minus 1), make a **skill** (`kind: "skill"`) instead of an agent.

Open `docs/BACKLOG.md` and pick the backlog item that best fits the target. If none fits, use step 2 to invent a better one.

## Step 2: Dedup rules (must all pass)
- `ls agents/` and read the `name`, `tagline`, and `description` of the 3 closest existing agents (`grep -il <keyword> agents/*.json`).
- Slug and name must not collide or be near-duplicates (the validator checks exact slug and normalized name).
- It must differ from every existing agent in at least **two** of: age band, subject, audience, method. "Another math coach for the same ages" is a duplicate.
- Open PRs count: `gh pr list --search "Daily agent" --state open` (if `gh` is available). Do not duplicate an open PR's topic.
- If in doubt, pick a different gap.

## Step 3: Research (read-only web; real sources only)
Goal: ground the agent in a **real** open-source AI-education tool or a well-documented educational need, so `inspiredBy` is truthful.

1. Search (WebSearch/WebFetch), e.g. `github open source AI tutor <topic>`, `github <subject> education open source`, `site:github.com "socratic" tutor <topic> license`, plus known families: Oppia, Kolibri, Open edX, Moodle, LibreTexts, Jupyter/nbgrader/Jupyter AI, Exercism, Blockly/Scratch, Open TutorAI, education prompt libraries and cookbooks.
2. For every project you intend to cite: **fetch its GitHub page**, confirm it exists, read the **exact license** (LICENSE file or sidebar), and note approximate stars and what it does. If the license cannot be confirmed, do not cite it.
3. Also check for trending: `https://github.com/topics/ai-tutor`, `https://github.com/topics/education?o=desc&s=updated`.
4. Skim 1-2 credible pedagogy sources for your topic (e.g. common misconceptions, evidence-based methods). Use them to shape the method, not to copy text.
5. Record findings: add or update rows in `docs/SOURCES.md` (project, URL, license, why it matters) and append to its verification log.
6. `inspiredBy` gets 0-3 entries. Zero is fine for original designs; never pad with unrelated projects.

## Step 4: Write the agent
Follow `docs/AGENT_SPEC.md` completely. Practical recipe:
1. Copy the closest existing agent as a structural reference (same age band if possible). Do **not** copy its wording.
2. Draft `agents/<slug>.json`: schema fields, then the prompt (250-600 words) using Role / How to talk / Method / Adapting / Rules / Safety.
3. For `ageRange.min < 13`: include the Safety section (trusted adult, never asks for personal information, stays on topic, is a computer program), `safety.notes` >= 2 and `safety.escalation`.
4. Write 3-6 starter prompts in the learner's voice and a >= 4 message sample conversation that shows hint-not-answer behaviour.
5. `createdAt` = today's date. `author` = `{ "name": "STARS Daily Routine" }`.
6. Self-review with the spec's safety rubric S1-S12 and its quality bar. Actually simulate three learner messages mentally (normal, "just tell me the answer", distress) and check the prompt handles each. Revise until it does.

## Step 5: Verify
```bash
npm run validate     # must print OK; fix every error; read warnings
npm run lint
npm run build        # no env vars needed
npm run coverage     # confirm the target gap closed
```
Optional but encouraged: `npm run start` and `curl -s localhost:3000/agents/<slug>.md | head` to check the page renders.

## Step 6: Update the backlog
In `docs/BACKLOG.md` mark the chosen item `- [x] ... -> <slug>` (or add it as done if you invented it). Add 2-3 fresh ideas you noticed during research, so the backlog never dries up (keep it at 60+ open items).

## Step 7: Commit, push, PR
```bash
git add agents/<slug>.json docs/BACKLOG.md docs/SOURCES.md
git commit -m "Add agent: <Name>"        # add attribution trailers your environment requires
git push -u origin daily/$DATE
gh pr create --title "Daily agent: <Name>" --body-file /tmp/pr-body.md
```
PR body template:
```
## New agent: <Name> (`<slug>`)
- Ages: X-Y | Audience: ... | Subject: ... | Level: ...
- Gap filled: <coverage cell / rationale>
- Sources (verified today): <name - license - URL> ...
- Method: <e.g. hint ladder, retrieval practice>
- Safety: <under-13? which safety items apply; anything a reviewer should double-check>
- Dedup check: closest existing agents = <a>, <b>; differs by <two dimensions>
- Checks: validate OK, lint OK, build OK
```
If `gh` is unavailable, use the GitHub MCP `create_pull_request` tool. Do not enable auto-merge.

## Step 8: Report
Reply with: agent name, slug, gap addressed, sources cited (with licenses), PR URL, and anything you were unsure about (e.g. a license you could not verify, a safety edge case).

## Failure handling
- Validation error you can't fix honestly (e.g. cannot reach 250 words without filler): pick a simpler agent. Never loosen the validator to pass.
- Web research blocked: write the agent with `inspiredBy: []` and say so in the PR. Never invent sources or licenses.
- Build fails on something unrelated to your file: stop, open no PR, and report the failure.

## Quality anti-patterns (reject your own draft if it has these)
Generic "helpful tutor" prompts; multiple questions per turn; giving final answers; praise without specifics; moralizing; walls of formatting for young kids; a sample conversation that could be from any agent; a safety section pasted without adapting to the subject (a science agent must address experiment safety; a career agent must warn about job scams).
