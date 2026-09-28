"use client";
import { useState } from "react";

export default function CopyButton({ text, label = "Copy prompt", className = "btn-gold" }: { text: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("ok");
    } catch {
      // Fallback for insecure contexts / older browsers
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        setState(ok ? "ok" : "err");
      } catch {
        setState("err");
      }
    }
    setTimeout(() => setState("idle"), 2200);
  }
  return (
    <button type="button" onClick={copy} className={className} aria-live="polite">
      {state === "ok" ? "Copied!" : state === "err" ? "Press Ctrl/Cmd+C to copy" : label}
    </button>
  );
}
