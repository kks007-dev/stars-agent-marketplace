"use client";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };
const MAX = 2000;

export default function ChatClient({ slug, name, starters }: { slug: string; name: string; starters: string[] }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setError("");
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, messages: next }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
    } catch (e) {
      setMessages(next);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card flex h-[70vh] min-h-[420px] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4" role="log" aria-live="polite" aria-label={`Conversation with ${name}`}>
        {messages.length === 0 && (
          <div>
            <p className="text-slate-300">Say hello, or try one of these:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {starters.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm hover:border-gold-400/60">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "ml-auto bg-gold-400/15" : "bg-white/5"}`}>
            {m.content || (busy && i === messages.length - 1 ? "Thinking..." : "")}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {error && <p role="alert" className="border-t border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</p>}
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-white/10 p-3">
        <label htmlFor="msg" className="sr-only">Your message</label>
        <textarea
          id="msg" value={input} maxLength={MAX} rows={2} disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Type your message... (Shift+Enter for a new line)"
          className="min-h-[3rem] flex-1 resize-none rounded-xl border border-white/15 bg-space-800 px-3 py-2 text-sm text-white placeholder:text-slate-500"
        />
        <button className="btn-gold self-end" disabled={busy || !input.trim()}>Send</button>
      </form>
      <p className="px-4 pb-3 text-xs text-slate-400">Please do not share personal information (full name, address, school, phone). AI can make mistakes. Check important facts with a trusted adult or teacher.</p>
    </div>
  );
}
