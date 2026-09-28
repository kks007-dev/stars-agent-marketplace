"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AGE_BANDS, AUDIENCES, AUDIENCE_LABELS, LEVELS, SUBJECTS, SUBJECT_LABELS, ageLabel } from "@/lib/schema";
import type { Agent } from "@/lib/schema";

export type AgentSummary = Pick<Agent, "slug" | "name" | "tagline" | "description" | "ageRange" | "audiences" | "subject" | "level" | "tags" | "kind">;

function Select({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-300">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-white/15 bg-space-800 px-3 py-2 text-sm text-white">
        <option value="">Any</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Inner({ agents }: { agents: AgentSummary[] }) {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [age, setAge] = useState(sp.get("age") ?? "");
  const [audience, setAudience] = useState(sp.get("audience") ?? "");
  const [subject, setSubject] = useState(sp.get("subject") ?? "");
  const [level, setLevel] = useState(sp.get("level") ?? "");

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (age) p.set("age", age);
    if (audience) p.set("audience", audience);
    if (subject) p.set("subject", subject);
    if (level) p.set("level", level);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [q, age, audience, subject, level]);

  const results = useMemo(() => {
    const band = AGE_BANDS.find((b) => b.id === age);
    const needle = q.trim().toLowerCase();
    return agents.filter((a) => {
      if (band && !(a.ageRange.min <= band.max && a.ageRange.max >= band.min)) return false;
      if (audience && !a.audiences.includes(audience as never)) return false;
      if (subject && a.subject !== subject) return false;
      if (level && a.level !== level && a.level !== "all") return false;
      if (needle) {
        const hay = `${a.name} ${a.tagline} ${a.description} ${a.tags.join(" ")} ${SUBJECT_LABELS[a.subject]}`.toLowerCase();
        return needle.split(/\s+/).every((w) => hay.includes(w));
      }
      return true;
    });
  }, [agents, q, age, audience, subject, level]);

  const active = Boolean(q || age || audience || subject || level);

  return (
    <div>
      <div className="card p-4">
        <label htmlFor="search" className="mb-1 block text-xs font-medium text-slate-300">Search</label>
        <input id="search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try &quot;multiplication&quot;, &quot;essay&quot;, &quot;python&quot;..." className="w-full rounded-lg border border-white/15 bg-space-800 px-3 py-2 text-white placeholder:text-slate-500" />
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Select id="age" label="Age" value={age} onChange={setAge} options={AGE_BANDS.map((b) => ({ value: b.id, label: b.label }))} />
          <Select id="aud" label="Audience" value={audience} onChange={setAudience} options={AUDIENCES.map((a) => ({ value: a, label: AUDIENCE_LABELS[a] }))} />
          <Select id="sub" label="Subject" value={subject} onChange={setSubject} options={SUBJECTS.map((s) => ({ value: s, label: SUBJECT_LABELS[s] }))} />
          <Select id="lvl" label="Level" value={level} onChange={setLevel} options={LEVELS.filter((l) => l !== "all").map((l) => ({ value: l, label: l[0].toUpperCase() + l.slice(1) }))} />
        </div>
        {active && (
          <button className="mt-3 text-sm text-gold-300 underline" onClick={() => { setQ(""); setAge(""); setAudience(""); setSubject(""); setLevel(""); }}>
            Clear all filters
          </button>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-300" role="status" aria-live="polite">{results.length} agent{results.length === 1 ? "" : "s"}</p>
      {results.length === 0 ? (
        <div className="card mt-4 p-8 text-center text-slate-300">
          No agents match. Try clearing a filter, or <Link href="/submit" className="text-gold-300 underline">suggest a new agent</Link>.
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <li key={a.slug}>
              <Link href={`/agents/${a.slug}`} className="card group flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-gold-400/50">
                <div className="flex flex-wrap gap-2">
                  <span className="chip chip-gold">{ageLabel(a)}</span>
                  <span className="chip">{SUBJECT_LABELS[a.subject]}</span>
                  {a.kind === "skill" && <span className="chip">Skill</span>}
                </div>
                <h2 className="mt-3 text-lg font-semibold group-hover:text-gold-300">{a.name}</h2>
                <p className="mt-1 flex-1 text-sm text-slate-300">{a.tagline}</p>
                <p className="mt-4 text-xs text-slate-400">For {a.audiences.map((x) => AUDIENCE_LABELS[x].toLowerCase()).join(", ")}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AgentBrowser({ agents }: { agents: AgentSummary[] }) {
  return (
    <Suspense fallback={<p className="text-slate-300">Loading agents...</p>}>
      <Inner agents={agents} />
    </Suspense>
  );
}
