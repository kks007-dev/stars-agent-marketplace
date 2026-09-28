/**
 * Prints coverage of agents/ across age band x subject and age band x audience,
 * then a ranked list of gaps. Run: npm run coverage
 */
import fs from "node:fs";
import path from "node:path";
import { AgentSchema, AGE_BANDS, AUDIENCES, SUBJECTS, overlapsBand, type Agent } from "../lib/schema";

const dir = path.join(process.cwd(), "agents");
const agents: Agent[] = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => AgentSchema.parse(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))));

function pad(s: string | number, n: number) {
  return String(s).padEnd(n);
}

console.log(`\n${agents.length} agents\n`);

console.log("AGE BAND x SUBJECT (count of agents whose age range overlaps the band)");
console.log(pad("", 18) + SUBJECTS.map((s) => pad(s.slice(0, 7), 8)).join(""));
for (const b of AGE_BANDS) {
  console.log(pad(b.label, 18) + SUBJECTS.map((s) => pad(agents.filter((a) => a.subject === s && overlapsBand(a, b)).length || ".", 8)).join(""));
}

console.log("\nAGE BAND x AUDIENCE");
console.log(pad("", 18) + AUDIENCES.map((s) => pad(s, 14)).join(""));
for (const b of AGE_BANDS) {
  console.log(pad(b.label, 18) + AUDIENCES.map((au) => pad(agents.filter((a) => a.audiences.includes(au) && overlapsBand(a, b)).length || ".", 14)).join(""));
}

// Gap ranking: cells with zero agents, weighted by how plausible the combo is.
const implausible = new Set([
  "4-6|test-prep", "4-6|college-career", "4-6|languages", "4-6|coding", "7-9|college-career", "7-9|test-prep", "10-12|college-career",
  "4-6|life-skills", "4-6|ai-literacy", "4-6|social-studies", "4-6|teaching", "4-6|parenting", "7-9|teaching", "7-9|parenting", "10-12|teaching", "10-12|parenting",
]);
const teacherParent = new Set(["teaching", "parenting"]);
const gaps: { score: number; text: string }[] = [];
for (const b of AGE_BANDS) {
  for (const s of SUBJECTS) {
    const n = agents.filter((a) => a.subject === s && overlapsBand(a, b)).length;
    if (n > 0) continue;
    if (teacherParent.has(s) && b.id !== "adult") continue; // teacher/parent agents are for adults, whatever age the learners are
    const key = `${b.id}|${s}`;
    const adultOnly = teacherParent.has(s) ? "adult-facing (about learners of this age)" : "";
    const score = (implausible.has(key) ? 1 : 3) + (b.id === "adult" && teacherParent.has(s) ? -2 : 0);
    if (score > 0) gaps.push({ score, text: `${b.label} x ${s} ${adultOnly}`.trim() });
  }
  for (const au of AUDIENCES) {
    const n = agents.filter((a) => a.audiences.includes(au) && overlapsBand(a, b)).length;
    if (n === 0) gaps.push({ score: 2, text: `${b.label} x audience:${au}` });
  }
}
gaps.sort((x, y) => y.score - x.score);
console.log("\nTOP GAPS (score 3 = plausible and empty; 1 = unlikely combination)");
for (const g of gaps.slice(0, 25)) console.log(`  [${g.score}] ${g.text}`);
if (gaps.length === 0) console.log("  none: every plausible cell has at least one agent. Go deeper: pick cells with only 1 agent.");

const thin = SUBJECTS.map((s) => ({ s, n: agents.filter((a) => a.subject === s).length })).sort((a, b) => a.n - b.n);
console.log("\nSUBJECT TOTALS (thinnest first): " + thin.map((t) => `${t.s}=${t.n}`).join(", "));
console.log("EXISTING SLUGS: " + agents.map((a) => a.slug).join(", "));
