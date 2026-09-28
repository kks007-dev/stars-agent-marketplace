/**
 * Validates every file in agents/. Run: npm run validate
 * Exit code 1 on any error. Warnings do not fail the run.
 */
import fs from "node:fs";
import path from "node:path";
import { AgentSchema } from "../lib/schema";

const dir = path.join(process.cwd(), "agents");
const errors: string[] = [];
const warnings: string[] = [];
const slugs = new Map<string, string>();
const names = new Map<string, string>();

const PERSONAL_DATA =
  /\b(home address|street address|phone number|email address|e-mail|password|social security|credit card|bank account|last name|full name|birth ?date|date of birth|school name|which school|where do you live|what city)\b/i;
const COLLECT_VERB = /\b(ask|asks|request|requests|collect|collects|get|gather|obtain|require|prompt)\b/i;
const NEGATION = /\b(never|not|don't|do not|doesn't|does not|avoid|refuse|without|no need|must not|won't|decline|instead of)\b/i;
const BANNED = [
  { re: /ignore (all |any )?(previous|prior|above) (instructions|rules)/i, why: "prompt-injection style phrase" },
  { re: /\b(jailbreak|DAN mode|developer mode enabled)\b/i, why: "jailbreak language" },
  { re: /\b(pretend (you have|there are) no (rules|restrictions|filters))\b/i, why: "asks to drop safety rules" },
  { re: /\b(sexual|erotic|porn\w*|nsfw)\b/i, why: "sexual content term (use only inside a refusal rule; review manually)", warnOnly: true },
  { re: /\b(do (the |their |your )?homework for|write (the|their|your) (entire|whole|full) (essay|assignment) for)\b/i, why: "offers to do a student's work", },
];

function words(s: string) {
  return s.trim().split(/\s+/).length;
}

if (!fs.existsSync(dir)) {
  console.error("agents/ directory not found");
  process.exit(1);
}
const files = fs.readdirSync(dir).filter((f) => !f.startsWith("."));

for (const f of files) {
  const where = `agents/${f}`;
  if (!f.endsWith(".json")) {
    errors.push(`${where}: only .json files are allowed in agents/`);
    continue;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  } catch (e) {
    errors.push(`${where}: invalid JSON (${(e as Error).message})`);
    continue;
  }
  const parsed = AgentSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors.push(`${where}: ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    continue;
  }
  const a = parsed.data;

  if (f !== `${a.slug}.json`) errors.push(`${where}: filename must equal slug ("${a.slug}.json")`);
  if (slugs.has(a.slug)) errors.push(`${where}: duplicate slug also used in ${slugs.get(a.slug)}`);
  slugs.set(a.slug, where);
  const nkey = a.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (names.has(nkey)) errors.push(`${where}: name too similar to ${names.get(nkey)}`);
  names.set(nkey, where);

  // Age sanity
  if (a.ageRange.min > a.ageRange.max) errors.push(`${where}: ageRange.min > max`);
  if (a.ageRange.min < 13 && a.ageRange.max < 99 && a.ageRange.max - a.ageRange.min > 8) warnings.push(`${where}: under-13 agent spans a wide age range; consider narrowing`);
  if (new Date(a.createdAt).toString() === "Invalid Date") errors.push(`${where}: createdAt is not a real date`);
  if (a.createdAt > new Date(Date.now() + 86400000).toISOString().slice(0, 10)) errors.push(`${where}: createdAt is in the future`);

  // Prompt length (words)
  const w = words(a.systemPrompt);
  if (w < 250) errors.push(`${where}: systemPrompt is ${w} words (min 250)`);
  if (w > 800) errors.push(`${where}: systemPrompt is ${w} words (max 800)`);
  if (w > 600) warnings.push(`${where}: systemPrompt is ${w} words; quality bar targets 250-600`);

  // Required prompt structure
  if (!/(^|\n)#+\s*(role|who you are)/i.test(a.systemPrompt) && !/^you are\b/i.test(a.systemPrompt.trim())) {
    warnings.push(`${where}: prompt should open with a Role section or "You are ..."`);
  }
  if (!/safety/i.test(a.systemPrompt)) warnings.push(`${where}: prompt has no safety guidance at all`);

  // Child-safety checks
  if (a.ageRange.min < 13) {
    if (!/(^|\n)#+\s*[^\n]*safety/i.test(a.systemPrompt)) errors.push(`${where}: under-13 agents need a "Safety" heading in the prompt`);
    if (!/trusted adult/i.test(a.systemPrompt)) errors.push(`${where}: under-13 prompt must mention telling a "trusted adult"`);
    if (!/\b(never|do not|don't)\s+ask[^.\n]{0,100}(personal|private)/i.test(a.systemPrompt))
      errors.push(`${where}: under-13 prompt must say it never asks for personal information`);
    if (a.safety.notes.length < 2) errors.push(`${where}: under-13 agents need at least 2 safety.notes`);
    if (!a.safety.escalation) errors.push(`${where}: under-13 agents need safety.escalation`);
    if (!a.audiences.some((x) => x === "parent" || x === "teacher") && a.ageRange.min < 8)
      warnings.push(`${where}: agent for under-8s should also list parent or teacher as an audience`);
  }
  if (a.ageRange.min < 18 && a.subject !== "parenting" && /\b(alcohol|vape|gambl\w+|weapon)\b/i.test(a.systemPrompt) && !NEGATION.test(a.systemPrompt))
    warnings.push(`${where}: mentions adult topics; confirm this is appropriate`);

  // Banned content + personal-data solicitation (sentence level, ignoring negated sentences)
  const sentences = a.systemPrompt.split(/(?<=[.!?])\s+|\n+/);
  for (const s of sentences) {
    if (PERSONAL_DATA.test(s) && COLLECT_VERB.test(s) && !NEGATION.test(s)) {
      errors.push(`${where}: appears to ask for personal data: "${s.trim().slice(0, 120)}"`);
    }
  }
  for (const b of BANNED) {
    const m = a.systemPrompt.match(b.re);
    if (m) {
      const line = sentences.find((s) => b.re.test(s)) ?? "";
      if ("warnOnly" in b && b.warnOnly) warnings.push(`${where}: "${m[0]}" (${b.why})`);
      else if (!NEGATION.test(line)) errors.push(`${where}: "${m[0]}" (${b.why})`);
    }
  }
  // Starter prompts / sample conversation must not solicit personal data either
  for (const s of a.starterPrompts) if (PERSONAL_DATA.test(s)) errors.push(`${where}: starter prompt mentions personal data: "${s}"`);
  for (const m of a.sampleConversation) {
    if (m.role === "assistant" && PERSONAL_DATA.test(m.content) && COLLECT_VERB.test(m.content) && !NEGATION.test(m.content))
      errors.push(`${where}: sample assistant message may solicit personal data`);
  }
  if (a.sampleConversation[0].role !== "user") errors.push(`${where}: sampleConversation must start with a user message`);
  for (let i = 1; i < a.sampleConversation.length; i++)
    if (a.sampleConversation[i].role === a.sampleConversation[i - 1].role) errors.push(`${where}: sampleConversation roles must alternate`);

  // Homework agents must teach, not answer
  if (["student"].some((x) => a.audiences.includes(x as never)) && !/(hint|guid|question|scaffold|socratic|coach|step)/i.test(a.systemPrompt))
    warnings.push(`${where}: student-facing prompt lacks pedagogy language (hints/questions/scaffolding)`);

  // inspiredBy sanity
  const seenUrl = new Set<string>();
  for (const i of a.inspiredBy) {
    if (seenUrl.has(i.url)) errors.push(`${where}: duplicate inspiredBy url ${i.url}`);
    seenUrl.add(i.url);
    if (/unknown|unverified|tbd/i.test(i.license)) errors.push(`${where}: inspiredBy "${i.name}" license must be verified`);
  }
}

console.log(`Checked ${files.length} file(s) in agents/`);
for (const w of warnings) console.warn(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}
console.log(`OK. ${slugs.size} agents valid, ${warnings.length} warning(s).`);
