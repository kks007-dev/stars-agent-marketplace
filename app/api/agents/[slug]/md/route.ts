import { agentToMarkdown, getAgent } from "@/lib/agents";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const agent = getAgent(slug);
  if (!agent) return new Response("Not found", { status: 404 });
  return new Response(agentToMarkdown(agent), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `inline; filename="${agent.slug}.md"`,
      "cache-control": "public, max-age=300",
    },
  });
}
