import Link from "next/link";
import { ageLabel, SUBJECT_LABELS, AUDIENCE_LABELS, type Agent } from "@/lib/schema";

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link href={`/agents/${agent.slug}`} className="card group flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-gold-400/50">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip chip-gold">{ageLabel(agent)}</span>
        <span className="chip">{SUBJECT_LABELS[agent.subject]}</span>
        {agent.kind === "skill" && <span className="chip">Skill</span>}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-gold-300">{agent.name}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-300">{agent.tagline}</p>
      <p className="mt-4 text-xs text-slate-400">For {agent.audiences.map((a) => AUDIENCE_LABELS[a].toLowerCase()).join(", ")}</p>
    </Link>
  );
}
