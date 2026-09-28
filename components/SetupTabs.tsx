"use client";
import { useId, useState } from "react";
import type { Guide } from "@/lib/guides";
import CopyButton from "./CopyButton";

export default function SetupTabs({ guides, prompt, examples }: { guides: Guide[]; prompt: string; examples: { anthropic: string; openai: string } }) {
  const [active, setActive] = useState(guides[0].id);
  const base = useId();
  const guide = guides.find((g) => g.id === active) ?? guides[0];

  function onKey(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + guides.length) % guides.length;
    setActive(guides[next].id);
    document.getElementById(`${base}-tab-${guides[next].id}`)?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Setup platform" className="flex gap-1 overflow-x-auto border-b border-white/10">
        {guides.map((g, i) => (
          <button
            key={g.id}
            role="tab"
            id={`${base}-tab-${g.id}`}
            aria-selected={g.id === active}
            aria-controls={`${base}-panel-${g.id}`}
            tabIndex={g.id === active ? 0 : -1}
            onClick={() => setActive(g.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium ${g.id === active ? "border-b-2 border-gold-400 text-gold-300" : "text-slate-300 hover:text-white"}`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${base}-panel-${guide.id}`} aria-labelledby={`${base}-tab-${guide.id}`} className="pt-5">
        <p className="text-slate-200">{guide.intro}</p>
        <p className="mt-2 rounded-lg border border-gold-400/30 bg-gold-400/5 px-3 py-2 text-sm text-gold-300">{guide.plan}</p>
        <ol className="mt-5 space-y-4">
          {guide.steps.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-black" aria-hidden>{i + 1}</span>
              <div>
                <p className="font-semibold text-white">{s.title}</p>
                <p className="text-sm text-slate-300">{s.body}</p>
                {i === 0 && guide.id !== "api" && <div className="mt-2"><CopyButton text={prompt} /></div>}
              </div>
            </li>
          ))}
        </ol>
        {guide.id === "api" && (
          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-1 text-sm font-semibold">Anthropic Messages API (curl)</p>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-space-950 p-4 text-xs text-slate-200"><code>{examples.anthropic}</code></pre>
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold">OpenAI-compatible chat endpoint (Ollama shown)</p>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-space-950 p-4 text-xs text-slate-200"><code>{examples.openai}</code></pre>
            </div>
          </div>
        )}
        <h3 className="mt-6 font-semibold">Tips</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-300">{guide.tips.map((t) => <li key={t}>{t}</li>)}</ul>
        <h3 className="mt-6 font-semibold">Troubleshooting</h3>
        <dl className="mt-1 space-y-3 text-sm">
          {guide.troubleshooting.map((t) => (
            <div key={t.q}><dt className="font-medium text-white">{t.q}</dt><dd className="text-slate-300">{t.a}</dd></div>
          ))}
        </dl>
      </div>
    </div>
  );
}
