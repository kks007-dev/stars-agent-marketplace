import Image from "next/image";
import Link from "next/link";
import AgentCard from "@/components/AgentCard";
import { getAllAgents } from "@/lib/agents";
import { AGE_BANDS, AUDIENCES, AUDIENCE_LABELS, SUBJECTS, SUBJECT_LABELS, overlapsBand } from "@/lib/schema";

export default function Home() {
  const agents = getAllAgents();
  const newest = agents.slice(0, 3);
  // Featured: one agent per subject, spread across the catalog
  const seen = new Set<string>();
  const featured = agents.filter((a) => (seen.has(a.subject) ? false : (seen.add(a.subject), true))).slice(0, 6);
  const subjectCounts = SUBJECTS.map((s) => ({ s, n: agents.filter((a) => a.subject === s).length })).filter((x) => x.n > 0);

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(1.5px_1.5px_at_20px_30px,#fff8,transparent),radial-gradient(1px_1px_at_120px_80px,#fff6,transparent),radial-gradient(1.5px_1.5px_at_200px_140px,#e8b84acc,transparent),radial-gradient(1px_1px_at_60px_170px,#fff5,transparent)] [background-size:240px_200px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.3fr_1fr] md:py-24">
          <div>
            <p className="chip chip-gold mb-4">Free forever · Open source · No ads</p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              AI tutors for every learner, <span className="text-gold-400">free to copy and use.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-200">
              A growing library of carefully written education agents for students, teachers, and parents. Copy a prompt into Claude, ChatGPT, or Gemini in one click, or chat with it here.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/agents" className="btn-gold">Browse {agents.length} agents</Link>
              <Link href="/setup" className="btn-ghost">How to set one up</Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <Image src="/logo.png" alt="STARS logo" width={420} height={130} className="h-auto w-full max-w-xs drop-shadow-[0_0_40px_rgba(232,184,74,0.25)]" priority />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4" aria-labelledby="new">
        <div className="flex items-end justify-between">
          <h2 id="new" className="text-2xl font-bold">Recently added</h2>
          <Link href="/agents" className="text-sm text-gold-300 underline">See all</Link>
        </div>
        <p className="mt-1 text-sm text-slate-400">A fresh agent is added by our daily routine. Newest first.</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">{newest.map((a) => <li key={a.slug}><AgentCard agent={a} /></li>)}</ul>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4" aria-labelledby="feat">
        <h2 id="feat" className="text-2xl font-bold">Featured agents</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featured.map((a) => <li key={a.slug}><AgentCard agent={a} /></li>)}</ul>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4" aria-labelledby="how">
        <h2 id="how" className="text-2xl font-bold">How it works</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-4">
          {[
            ["Find an agent", "Filter by age, audience, subject, and level."],
            ["Copy the prompt", "One click. Read it first, it is plain text and it is yours."],
            ["Set it up", "Step-by-step guides for Claude Projects, ChatGPT GPTs, Gemini Gems, or any API."],
            ["Or chat here", "Create a free account and use the agent in your browser."],
          ].map(([t, d], i) => (
            <li key={t} className="card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 font-bold text-black">{i + 1}</span>
              <p className="mt-3 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-slate-300">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4" aria-labelledby="browse">
        <h2 id="browse" className="text-2xl font-bold">Browse by</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Age</h3>
            <ul className="flex flex-wrap gap-2">
              {AGE_BANDS.map((b) => (
                <li key={b.id}><Link className="chip chip-gold !px-3 !py-1.5 text-sm hover:bg-gold-400/20" href={`/agents?age=${b.id}`}>{b.label} <span className="ml-1 text-slate-400">{agents.filter((a) => overlapsBand(a, b)).length}</span></Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Audience</h3>
            <ul className="flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <li key={a}><Link className="chip !px-3 !py-1.5 text-sm hover:bg-white/10" href={`/agents?audience=${a}`}>{AUDIENCE_LABELS[a]}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Subject</h3>
            <ul className="flex flex-wrap gap-2">
              {subjectCounts.map(({ s, n }) => (
                <li key={s}><Link className="chip !px-3 !py-1.5 text-sm hover:bg-white/10" href={`/agents?subject=${s}`}>{SUBJECT_LABELS[s]} <span className="ml-1 text-slate-400">{n}</span></Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="card flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Built by STARS, kept free by people like you</h2>
            <p className="mt-1 text-slate-300">Donations pay for hosted chat and keep every agent free. You can also contribute an agent.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/donate" className="btn-gold">Donate</Link>
            <Link href="/submit" className="btn-ghost">Contribute</Link>
          </div>
        </div>
      </section>
    </>
  );
}
