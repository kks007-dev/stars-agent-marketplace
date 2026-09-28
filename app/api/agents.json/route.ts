import { getAllAgents } from "@/lib/agents";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** Public catalog. Includes full prompts so tools can import agents directly. */
export function GET() {
  const agents = getAllAgents().map((a) => ({
    ...a,
    url: `${SITE_URL}/agents/${a.slug}`,
    markdownUrl: `${SITE_URL}/agents/${a.slug}.md`,
  }));
  return Response.json(
    { generatedFrom: "agents/*.json", license: "MIT", count: agents.length, agents },
    { headers: { "access-control-allow-origin": "*", "cache-control": "public, max-age=300" } },
  );
}
