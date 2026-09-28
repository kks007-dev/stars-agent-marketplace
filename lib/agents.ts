import fs from "node:fs";
import path from "node:path";
import { AgentSchema, type Agent } from "./schema";

const AGENTS_DIR = path.join(process.cwd(), "agents");

let cache: Agent[] | null = null;

/** Loads and validates every agents/*.json. Throws with a clear message on bad data. */
export function getAllAgents(): Agent[] {
  if (cache) return cache;
  const files = fs.readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".json")).sort();
  const agents = files.map((f) => {
    const raw = JSON.parse(fs.readFileSync(path.join(AGENTS_DIR, f), "utf8"));
    const parsed = AgentSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Invalid agent file ${f}: ${parsed.error.message}`);
    }
    return parsed.data;
  });
  agents.sort((a, b) => (b.createdAt.localeCompare(a.createdAt)) || a.name.localeCompare(b.name));
  cache = agents;
  return agents;
}

export function getAgent(slug: string): Agent | undefined {
  return getAllAgents().find((a) => a.slug === slug);
}

/** Markdown export with YAML-ish frontmatter (used by /agents/<slug>.md and downloads). */
export function agentToMarkdown(a: Agent): string {
  const fm = [
    "---",
    `name: ${JSON.stringify(a.name)}`,
    `slug: ${a.slug}`,
    `tagline: ${JSON.stringify(a.tagline)}`,
    `ages: ${a.ageRange.min}-${a.ageRange.max}`,
    `audiences: [${a.audiences.join(", ")}]`,
    `subject: ${a.subject}`,
    `level: ${a.level}`,
    `author: ${JSON.stringify(a.author.name)}`,
    `created: ${a.createdAt}`,
    "license: MIT",
    "---",
    "",
  ];
  const body = [
    `# ${a.name}`,
    "",
    a.description,
    "",
    "## System prompt",
    "",
    a.systemPrompt,
    "",
    "## Starter prompts",
    "",
    ...a.starterPrompts.map((s) => `- ${s}`),
    "",
    "## Safety notes",
    "",
    ...a.safety.notes.map((s) => `- ${s}`),
    "",
    "## Learning goals",
    "",
    ...a.learningGoals.map((s) => `- ${s}`),
    "",
  ];
  return [...fm, ...body].join("\n");
}
