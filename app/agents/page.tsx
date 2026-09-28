import type { Metadata } from "next";
import AgentBrowser from "@/components/AgentBrowser";
import { getAllAgents } from "@/lib/agents";

export const metadata: Metadata = {
  title: "Browse agents",
  description: "Search free AI education agents by age, audience, subject, and level.",
};

export default function AgentsPage() {
  const agents = getAllAgents().map(({ slug, name, tagline, description, ageRange, audiences, subject, level, tags, kind }) => ({
    slug, name, tagline, description, ageRange, audiences, subject, level, tags, kind,
  }));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Browse agents</h1>
      <p className="mt-2 max-w-2xl text-slate-300">Every agent is free. Copy the prompt, follow a setup guide, or sign in and chat right here.</p>
      <div className="mt-6"><AgentBrowser agents={agents} /></div>
    </div>
  );
}
