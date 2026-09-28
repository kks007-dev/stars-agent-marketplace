import type { Metadata } from "next";
import { REPO_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Contribute an agent", description: "Add an AI education agent to the marketplace with a pull request." };

const TEMPLATE = `{
  "slug": "fractions-pizza-coach",
  "kind": "agent",
  "name": "Fractions Pizza Coach",
  "tagline": "Learn fractions by slicing pretend pizzas, one question at a time.",
  "description": "A patient coach that ... (80-900 characters)",
  "ageRange": { "min": 8, "max": 11 },
  "audiences": ["student", "parent"],
  "subject": "math",
  "level": "beginner",
  "tags": ["fractions", "visual-models"],
  "systemPrompt": "You are ... (250-600 words; see docs/AGENT_SPEC.md)",
  "starterPrompts": ["Help me understand 3/4", "Quiz me on halves and quarters", "Why is 2/4 the same as 1/2?"],
  "safety": {
    "notes": ["Never asks for personal information.", "Encourages checking with a teacher."],
    "escalation": "If a child mentions being hurt or unsafe, gently urge them to tell a trusted adult right now."
  },
  "learningGoals": ["Compare fractions", "Find equivalent fractions", "Explain reasoning aloud"],
  "sampleConversation": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "inspiredBy": [],
  "createdAt": "2026-01-31",
  "author": { "name": "Your Name" }
}`;

export default function Submit() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Contribute an agent</h1>
      <p className="mt-2 text-slate-300">Teachers, parents, students, and developers are welcome. Agents are single JSON files reviewed through pull requests.</p>
      <div className="prose-stars mt-6">
        <h2>Steps</h2>
        <ol>
          <li>Read <code>docs/AGENT_SPEC.md</code> (quality bar, safety rubric, prompt writing guide).</li>
          <li>Fork {REPO_URL ? <a href={REPO_URL}>the repository</a> : "the repository"}, and create <code>agents/your-slug.json</code> from the template below.</li>
          <li>Run <code>npm install</code>, then <code>npm run validate</code> and <code>npm run build</code>.</li>
          <li>Test your prompt in a real chat. Try to break it: ask for homework answers, ask it to ignore its rules, and say something worrying as a child would.</li>
          <li>Open a pull request titled <code>Agent: Your Agent Name</code>. Fill in the checklist.</li>
        </ol>
        <p>Cite any open-source project you drew on in <code>inspiredBy</code> with its real URL and verified license. Do not copy text from projects whose license forbids it; write your own.</p>
        <h2>Template</h2>
      </div>
      <pre tabIndex={0} className="overflow-x-auto rounded-xl border border-white/10 bg-space-950 p-4 text-xs leading-relaxed text-slate-200"><code>{TEMPLATE}</code></pre>
      <div className="prose-stars mt-8">
        <h2>Rules that are checked automatically</h2>
        <ul>
          <li>Unique kebab-case slug; all required fields; valid subject, audience, and level values.</li>
          <li>Age range makes sense (min at most max, ages 3 to 99).</li>
          <li>System prompt is 250 to 800 words.</li>
          <li>Agents with <code>ageRange.min</code> under 13 need a safety section in the prompt, safety notes, an escalation line, and a promise never to ask for personal information.</li>
          <li>No prompts that collect personal data, request contact details, or try to bypass safety.</li>
        </ul>
        <p>No GitHub account? Email your idea to STARS and a maintainer can help you turn it into a file.</p>
      </div>
    </div>
  );
}
