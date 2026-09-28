import { getAgent } from "@/lib/agents";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const agent = getAgent(slug);
  if (!agent) return new Response("Not found", { status: 404 });
  return new Response(JSON.stringify(agent, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `inline; filename="${agent.slug}.json"`,
      "cache-control": "public, max-age=300",
    },
  });
}
