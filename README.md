# STARS Agent Marketplace

A free, open marketplace of specialized AI education agents from [STARS](https://starsportal.org). Every agent is a well-crafted prompt in a plain JSON file. Users can:

1. **Copy** the prompt in one click.
2. Follow **step-by-step setup guides** for Claude Projects, ChatGPT Custom GPTs, Gemini Gems, or any API/model.
3. **Download** it as `.md` or `.json`.
4. **Chat with it in the browser** after creating a free account (hosted chat).

Stack: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Clerk v7, zod. Agents are static files, the site is built statically from them, and it **builds and runs with no environment variables**.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Without any env vars you get browsing, search/filters, prompt copy, downloads, setup guides, the public API, and a friendly "sign-in not configured" notice on chat pages.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run validate` | Validate every `agents/*.json` (schema, unique slugs, age sanity, prompt length, child-safety rules, no personal-data asks) |
| `npm run coverage` | Print the age x subject x audience coverage matrix and top gaps |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |

## Environment variables

Copy `.env.example` to `.env.local`. All are optional.

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Accounts + hosted chat | Both must be set, or auth is fully disabled |
| `ANTHROPIC_API_KEY` | Hosted chat | Server-side only |
| `ANTHROPIC_MODEL` | Hosted chat | Default `claude-haiku-4-5-20251001` |
| `NEXT_PUBLIC_SITE_URL` | Sitemap, canonical URLs, API links | Default `http://localhost:3000` |
| `NEXT_PUBLIC_LANDING_URL` | `/donate` redirect and footer links | Default `https://starsportal.org`; donate goes to `${LANDING}/donate` |
| `NEXT_PUBLIC_REPO_URL` | "Source on GitHub" links | Hidden when unset |
| `CHAT_RATE_LIMIT_MAX`, `CHAT_RATE_LIMIT_WINDOW_SEC` | Hosted chat | Default 20 messages per 600 s per user |

## Clerk setup

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com); enable the sign-in methods you want (email, Google...).
2. Copy the publishable and secret keys into `.env.local` (and into Vercel project settings).
3. Under the Clerk dashboard's paths settings, use `/sign-in` and `/sign-up` (the app already passes these URLs to `ClerkProvider`).
4. Add your production domain in Clerk.

How it is wired (adapted from `stars-portal-v3`, updated for Clerk v7 and Next 16):
- `app/layout.tsx` mounts `<ClerkProvider>` only when both keys exist.
- `proxy.ts` (Next 16's replacement for `middleware.ts`) runs `clerkMiddleware` and `auth.protect()` for `/chat/*` and `/api/chat`; with no keys it passes requests through.
- `app/sign-in/[[...sign-in]]` and `app/sign-up/[[...sign-up]]` render Clerk components, or a notice when unconfigured.
- Header uses `<Show when="signed-in">` / `<Show when="signed-out">`.
- `/api/chat` re-checks `auth()` server-side, so protection does not rely on the proxy alone.

**Child-safety note:** most sign-up flows expect users 13 or older. For under-13 agents the UI tells families that an adult should hold the account and sit with the child. Review COPPA/GDPR-K obligations before opening accounts to children.

## Hosted chat

`POST /api/chat` with `{ slug, messages }`:
- Requires a signed-in Clerk user (503 "not configured" without keys, 401 when signed out).
- The **system prompt is read server-side from `agents/<slug>.json`**; the client never supplies one.
- Limits: 2,000 chars per message, 30 messages, 20,000 total chars, 1,024 output tokens, 20 messages / 10 min per user.
- Calls the Anthropic Messages API via `fetch` with streaming and relays text deltas.
- **Production:** the rate limiter is in-memory (`lib/ratelimit.ts`) and per server instance. Swap it for Upstash Redis (`@upstash/ratelimit`) or a database counter before real traffic. Also add usage caps/billing alerts on your API key, and consider moderation on inputs.

## Public endpoints

| Path | Description |
|---|---|
| `/api/agents.json` | Full catalog (CORS open) |
| `/agents/<slug>.md` | Raw prompt as markdown with frontmatter (a rewrite to `/api/agents/<slug>/md`) |
| `/api/agents/<slug>/json`, `/md` | Downloads |
| `/sitemap.xml`, `/robots.txt` | SEO |

## Repository layout

```
agents/                 one JSON file per agent (source of truth)
app/                    routes: /, /agents, /agents/[slug], /chat/[slug], /setup, /submit, /about, /donate, api/*
components/             Header, Footer, AgentCard, AgentBrowser, SetupTabs, CopyButton, ChatClient
lib/schema.ts           zod schema + enums + age bands
lib/agents.ts           loader + markdown export
lib/guides.ts           setup guide content per platform
lib/ratelimit.ts        in-memory limiter (swap for Upstash)
scripts/                validate-agents.ts, coverage.ts
docs/                   AGENT_SPEC.md, DAILY_ROUTINE.md, BACKLOG.md, SOURCES.md
.github/workflows/      validate.yml (validate + lint + build on PRs)
proxy.ts                Clerk route protection (Next 16 "proxy")
```

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel (framework preset: Next.js; no special build settings).
2. Add env vars from the table above (at minimum Clerk + `ANTHROPIC_API_KEY` for chat, and `NEXT_PUBLIC_SITE_URL`).
3. Deploy. Add the Vercel domain to Clerk. Point a custom domain (e.g. `agents.starsportal.org`) if desired.

## Adding agents and the daily routine

Humans: see [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/AGENT_SPEC.md](docs/AGENT_SPEC.md); the `/submit` page shows a template.

Automation: [docs/DAILY_ROUTINE.md](docs/DAILY_ROUTINE.md) is a self-contained runbook. A fresh Claude Code session runs it daily: `npm run coverage` to find a gap, real-source research, one new agent file, `npm run validate && npm run build`, branch `daily/YYYY-MM-DD`, and a PR titled `Daily agent: <name>` for human review. `docs/BACKLOG.md` holds 60+ ideas. CI (`.github/workflows/validate.yml`) validates every PR.

## License

MIT. See [LICENSE](LICENSE). Agents are contributed under the same license.
