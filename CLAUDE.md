# STARS Agent Marketplace: instructions for Claude Code

@AGENTS.md

## What this repo is
A free marketplace of AI education agents. Agents are JSON files in `agents/`; the site is built statically from them.

## Rules
- **Next.js 16 differs from your training data.** Before writing code, read the relevant guide in `node_modules/next/dist/docs/`. `middleware.ts` is `proxy.ts`; `params` are async Promises; Clerk is v7 (`<Show when="signed-in">`, not `<SignedIn>`).
- The site MUST build and run with no env vars. Anything that touches Clerk or Anthropic must be gated on `HAS_CLERK` / env presence (see `lib/site.ts`).
- System prompts are only read server-side from `agents/*.json`. Never accept a system prompt from a client.
- To add or change an agent, follow `docs/AGENT_SPEC.md`. For the daily job, follow `docs/DAILY_ROUTINE.md` exactly.
- Always run `npm run validate && npm run lint && npm run build` before committing.
- Never push to `main`; use a branch and a PR. Never commit secrets or `.env*` (except `.env.example`).
- Child safety rules in `docs/AGENT_SPEC.md` are non-negotiable.

## Commands
`npm run dev` · `npm run validate` · `npm run coverage` · `npm run lint` · `npm run build`
