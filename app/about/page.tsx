import type { Metadata } from "next";
import Link from "next/link";
import { LANDING_URL } from "@/lib/site";

export const metadata: Metadata = { title: "About", description: "Why STARS built a free marketplace of AI education agents, and how we keep it safe." };

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">About the marketplace</h1>
      <div className="prose-stars mt-6">
        <p>STARS is an education organization. This marketplace exists because good AI tutoring should not depend on a school&apos;s budget. Every agent is a free, readable prompt that anyone can copy, adapt, and share under the MIT license.</p>
        <h2>How we keep it safe</h2>
        <ul>
          <li><strong>Pedagogy first.</strong> Homework agents coach with hints and questions instead of handing over answers.</li>
          <li><strong>Extra rules for under-13.</strong> Agents for younger children must include a safety section, must never ask for personal information, and must direct children to a trusted adult when something serious comes up. A validator enforces this on every contribution.</li>
          <li><strong>Server-side prompts.</strong> In hosted chat, the system prompt is loaded on the server from the agent file. Users cannot replace it.</li>
          <li><strong>Limits.</strong> Hosted chat requires an account, caps message length, and rate-limits each user.</li>
          <li><strong>Open review.</strong> Every agent lands through a pull request that anyone can read.</li>
        </ul>
        <h2>Honest limits</h2>
        <p>AI systems make mistakes and can be manipulated. Agents are learning aids, not replacements for teachers, parents, counselors, or medical and legal professionals. Never rely on an agent in an emergency.</p>
        <h2>Daily growth</h2>
        <p>A documented routine researches open-source education projects, finds coverage gaps (age by subject by audience), and proposes one new agent per day via pull request. A human reviews and merges. See <Link href="/submit">Contribute</Link> for how you can help.</p>
        <h2>Support STARS</h2>
        <p><Link href="/donate">Donations</Link> pay for hosting and model costs. Learn more at <a href={LANDING_URL}>the STARS home page</a>.</p>
      </div>
    </div>
  );
}
