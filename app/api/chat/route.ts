import { getAgent } from "@/lib/agents";
import { check } from "@/lib/ratelimit";
import { HAS_CLERK } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE_CHARS = 2000;
const MAX_MESSAGES = 30;
const MAX_TOTAL_CHARS = 20000;
const MAX_OUTPUT_TOKENS = 1024;
const RATE_MAX = Number(process.env.CHAT_RATE_LIMIT_MAX) || 20;
const RATE_WINDOW = Number(process.env.CHAT_RATE_LIMIT_WINDOW_SEC) || 600;

function json(body: unknown, status: number, headers?: Record<string, string>) {
  return Response.json(body, { status, headers });
}

export async function POST(req: Request) {
  // 1. Auth. Without Clerk keys chat is disabled (never anonymous).
  if (!HAS_CLERK) return json({ error: "Sign-in is not configured on this deployment, so hosted chat is unavailable." }, 503);
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return json({ error: "Please sign in to chat." }, 401);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ error: "Hosted chat is not configured (missing ANTHROPIC_API_KEY)." }, 503);

  // 2. Parse + validate. The client only sends a slug and messages. Never a system prompt.
  let body: { slug?: unknown; messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }
  const agent = typeof body.slug === "string" ? getAgent(body.slug) : undefined;
  if (!agent) return json({ error: "Unknown agent." }, 404);
  if (!Array.isArray(body.messages) || body.messages.length === 0) return json({ error: "No messages." }, 400);
  if (body.messages.length > MAX_MESSAGES) return json({ error: "Conversation too long. Start a new chat." }, 400);

  const messages: { role: "user" | "assistant"; content: string }[] = [];
  let total = 0;
  for (const m of body.messages as unknown[]) {
    const mm = m as { role?: unknown; content?: unknown };
    if ((mm.role !== "user" && mm.role !== "assistant") || typeof mm.content !== "string" || !mm.content.trim()) {
      return json({ error: "Malformed message." }, 400);
    }
    if (mm.content.length > MAX_MESSAGE_CHARS) return json({ error: `Messages are limited to ${MAX_MESSAGE_CHARS} characters.` }, 400);
    total += mm.content.length;
    messages.push({ role: mm.role, content: mm.content });
  }
  if (total > MAX_TOTAL_CHARS) return json({ error: "Conversation too long. Start a new chat." }, 400);
  if (messages[0].role !== "user" || messages[messages.length - 1].role !== "user") {
    return json({ error: "Conversation must start and end with a user message." }, 400);
  }

  // 3. Rate limit per user (in-memory; see lib/ratelimit.ts for production note).
  const rl = check(`chat:${userId}`, RATE_MAX, RATE_WINDOW);
  if (!rl.ok) return json({ error: `Rate limit reached. Try again in ${rl.retryAfterSec}s.` }, 429, { "retry-after": String(rl.retryAfterSec) });

  // 4. Call Anthropic Messages API (streaming). System prompt comes from the agent file.
  let upstream: Response;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: MAX_OUTPUT_TOKENS,
        stream: true,
        system: agent.systemPrompt,
        messages,
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return json({ error: "Could not reach the model provider." }, 502);
  }
  if (!upstream.ok || !upstream.body) {
    // Do not leak provider error bodies to the client.
    console.error("Anthropic error", upstream.status);
    return json({ error: "The tutor is unavailable right now. Please try again shortly." }, 502);
  }

  // 5. Translate Anthropic SSE into a plain text stream of deltas.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();
  const stream = new ReadableStream({
    async start(controller) {
      let buf = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buf.indexOf("\n\n")) !== -1) {
            const evt = buf.slice(0, idx);
            buf = buf.slice(idx + 2);
            const data = evt.split("\n").find((l) => l.startsWith("data: "));
            if (!data) continue;
            try {
              const j = JSON.parse(data.slice(6));
              if (j.type === "content_block_delta" && j.delta?.type === "text_delta") {
                controller.enqueue(encoder.encode(j.delta.text));
              }
            } catch {
              /* ignore keep-alives / partial */
            }
          }
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n[The connection was interrupted.]"));
      } finally {
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" },
  });
}
