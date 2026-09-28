import type { Metadata } from "next";
import Link from "next/link";
import SetupTabs from "@/components/SetupTabs";
import { GUIDES, API_EXAMPLES } from "@/lib/guides";

export const metadata: Metadata = { title: "Setup guide", description: "How to turn any agent prompt into a Claude Project, ChatGPT Custom GPT, Gemini Gem, or API assistant." };

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Getting started</h1>
      <p className="mt-2 text-slate-300">Every agent is just a well-written prompt. Pick the tool you already use and follow the steps. The steps below use a placeholder; on any agent page the Copy prompt button fills in the real prompt.</p>
      <div className="prose-stars mt-8">
        <h2>Before you start</h2>
        <ul>
          <li><strong>Read the prompt.</strong> It is plain English. Change the tone, add your child&apos;s or class&apos;s grade level, or remove what you do not need.</li>
          <li><strong>Young learners need an adult.</strong> For under-13 agents, set up the account yourself and stay nearby.</li>
          <li><strong>Keep personal info out.</strong> Do not paste student names, grades, or health details into any AI tool.</li>
          <li><strong>Check the answers.</strong> AI can be wrong. The best agents teach kids to check, and so should you.</li>
        </ul>
        <h2>Pick your platform</h2>
      </div>
      <div className="card p-5">
        <SetupTabs guides={GUIDES} prompt="Open any agent page and press Copy prompt." examples={API_EXAMPLES} />
      </div>
      <div className="prose-stars mt-10">
        <h2>Which should I choose?</h2>
        <ul>
          <li><strong>Claude Project:</strong> works on free accounts; instructions apply to every chat in the project; good for one project per learner.</li>
          <li><strong>ChatGPT Custom GPT:</strong> shareable link and conversation starters, but creating one generally needs a paid plan.</li>
          <li><strong>Gemini Gem:</strong> handy if your school uses Google accounts; check that your admin allows Gems.</li>
          <li><strong>API or local model:</strong> most control, best for developers and schools running their own tools.</li>
        </ul>
        <p>Or skip setup: <Link href="/agents">pick an agent</Link> and use <em>Chat now</em> with a free account.</p>
      </div>
    </div>
  );
}
