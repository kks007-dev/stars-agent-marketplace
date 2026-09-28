# Contributing

Thank you for helping every learner get a great AI tutor.

## Contribute an agent
1. Read [`docs/AGENT_SPEC.md`](docs/AGENT_SPEC.md): schema, quality bar, safety rubric, and how to write a great prompt.
2. Check `npm run coverage` and `docs/BACKLOG.md` to see what is missing, and search `agents/` so you do not duplicate.
3. Create `agents/<slug>.json`.
4. `npm install && npm run validate && npm run lint && npm run build`
5. Test the prompt in a real chat and try to break it.
6. Open a PR titled `Agent: <name>` (the daily routine uses `Daily agent: <name>`).

## Contribute code
Keep the site buildable with no env vars. Read `node_modules/next/dist/docs/` (Next.js 16 differs from older versions). Small PRs are best.

## Ground rules
- Agents are MIT licensed. Do not paste text from projects whose licenses forbid reuse; cite inspiration in `inspiredBy` with a verified license.
- Child safety is non-negotiable (see spec). Maintainers may reject any agent for safety reasons.
- Be kind: see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
