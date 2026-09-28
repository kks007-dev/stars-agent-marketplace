import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import SetupTabs from "@/components/SetupTabs";
import AgentCard from "@/components/AgentCard";
import { getAgent, getAllAgents } from "@/lib/agents";
import { GUIDES, API_EXAMPLES } from "@/lib/guides";
import { ageLabel, AUDIENCE_LABELS, SUBJECT_LABELS } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllAgents().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getAgent(slug);
  if (!a) return {};
  return { title: a.name, description: a.tagline, openGraph: { title: a.name, description: a.tagline } };
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = getAgent(slug);
  if (!agent) notFound();
  const related = getAllAgents().filter((a) => a.slug !== agent.slug && (a.subject === agent.subject || a.audiences.some((x) => agent.audiences.includes(x)))).slice(0, 3);
  const under13 = agent.ageRange.min < 13;

  return (
    <article className="mx-auto max-w-5xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
        <Link href="/agents" className="hover:text-gold-300">Agents</Link> <span aria-hidden>/</span> <span>{agent.name}</span>
      </nav>
      <header className="mt-4">
        <div className="flex flex-wrap gap-2">
          <span className="chip chip-gold">{ageLabel(agent)}</span>
          <span className="chip">{SUBJECT_LABELS[agent.subject]}</span>
          <span className="chip">{agent.level === "all" ? "All levels" : agent.level}</span>
          {agent.audiences.map((a) => <span key={a} className="chip">{AUDIENCE_LABELS[a]}</span>)}
        </div>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{agent.name}</h1>
        <p className="mt-2 text-lg text-gold-300">{agent.tagline}</p>
        <p className="mt-4 max-w-3xl text-slate-200">{agent.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <CopyButton text={agent.systemPrompt} label="Copy prompt" />
          <Link href={`/chat/${agent.slug}`} className="btn-ghost">Chat now (free account)</Link>
          <a href={`/api/agents/${agent.slug}/md`} download={`${agent.slug}.md`} className="btn-ghost">Download .md</a>
          <a href={`/api/agents/${agent.slug}/json`} download={`${agent.slug}.json`} className="btn-ghost">Download .json</a>
        </div>
        <p className="mt-3 text-xs text-slate-400">By {agent.author.name} · Added {agent.createdAt} · Raw prompt: <a className="underline" href={`/agents/${agent.slug}.md`}>/agents/{agent.slug}.md</a></p>
      </header>

      {under13 && (
        <aside className="mt-6 rounded-xl border border-gold-400/40 bg-gold-400/5 p-4 text-sm text-slate-100" aria-label="Adult supervision note">
          <strong className="text-gold-300">For young learners:</strong> a parent or teacher should set this up and stay nearby. Accounts on this site are for adults or teens 13+; an adult can sign in and chat alongside a child.
        </aside>
      )}

      <section className="mt-10 grid gap-6 md:grid-cols-2" aria-label="Goals and starters">
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Learning goals</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">{agent.learningGoals.map((g) => <li key={g}>{g}</li>)}</ul>
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Starter prompts</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {agent.starterPrompts.map((s) => <li key={s} className="rounded-lg bg-white/5 px-3 py-2 text-slate-100">{s}</li>)}
          </ul>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="sys">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="sys" className="text-2xl font-bold">The prompt</h2>
          <CopyButton text={agent.systemPrompt} label="Copy prompt" className="btn-ghost" />
        </div>
        <pre tabIndex={0} className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-space-950 p-4 text-sm leading-relaxed text-slate-200">{agent.systemPrompt}</pre>
      </section>

      <section className="mt-12" aria-labelledby="setup">
        <h2 id="setup" className="text-2xl font-bold">Set it up in your favorite AI</h2>
        <div className="card mt-4 p-5">
          <SetupTabs guides={GUIDES} prompt={agent.systemPrompt} examples={API_EXAMPLES} />
        </div>
      </section>

      <section className="mt-12" aria-labelledby="sample">
        <h2 id="sample" className="text-2xl font-bold">Sample conversation</h2>
        <div className="mt-4 space-y-3">
          {agent.sampleConversation.map((m, i) => (
            <div key={i} className={`max-w-[92%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm sm:max-w-[80%] ${m.role === "user" ? "ml-auto bg-gold-400/15 text-slate-50" : "bg-white/5 text-slate-100"}`}>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">{m.role === "user" ? "Learner" : agent.name}</span>
              {m.content}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2" aria-label="Safety and inspiration">
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Safety notes</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">{agent.safety.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          {agent.safety.escalation && <p className="mt-3 text-sm text-slate-300"><strong className="text-white">Escalation:</strong> {agent.safety.escalation}</p>}
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Inspired by open source</h2>
          {agent.inspiredBy.length === 0 ? <p className="mt-2 text-sm text-slate-400">Original STARS design.</p> : (
            <ul className="mt-2 space-y-2 text-sm">
              {agent.inspiredBy.map((i) => (
                <li key={i.url}>
                  <a href={i.url} target="_blank" rel="noopener noreferrer" className="font-medium text-gold-300 underline">{i.name}</a>{" "}
                  <span className="chip">{i.license}</span>
                  {i.note && <p className="text-slate-300">{i.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="rel">
          <h2 id="rel" className="text-2xl font-bold">Related agents</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">{related.map((a) => <li key={a.slug}><AgentCard agent={a} /></li>)}</ul>
        </section>
      )}
    </article>
  );
}
