import Link from "next/link";
import { LANDING_URL, REPO_URL } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-space-950/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-slate-300 sm:grid-cols-3">
        <div>
          <p className="font-semibold text-white">STARS Agent Marketplace</p>
          <p className="mt-2 max-w-xs">Free, open AI education agents. Every agent is a plain file anyone can read, copy, and improve.</p>
        </div>
        <div>
          <p className="font-semibold text-white">Explore</p>
          <ul className="mt-2 space-y-1">
            <li><Link className="hover:text-gold-300" href="/agents">Browse agents</Link></li>
            <li><Link className="hover:text-gold-300" href="/setup">Setup guide</Link></li>
            <li><Link className="hover:text-gold-300" href="/submit">Contribute an agent</Link></li>
            <li><a className="hover:text-gold-300" href="/api/agents.json">Catalog (JSON)</a></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">STARS</p>
          <ul className="mt-2 space-y-1">
            <li><a className="hover:text-gold-300" href={LANDING_URL}>STARS home</a></li>
            <li><Link className="hover:text-gold-300" href="/donate">Donate</Link></li>
            <li><Link className="hover:text-gold-300" href="/about">About &amp; safety</Link></li>
            {REPO_URL && <li><a className="hover:text-gold-300" href={REPO_URL}>Source on GitHub</a></li>}
          </ul>
        </div>
      </div>
      <p className="border-t border-white/5 px-4 py-4 text-center text-xs text-slate-400">
        AI can make mistakes. Agents are learning aids, not replacements for teachers, parents, or professionals. Content is MIT licensed.
      </p>
    </footer>
  );
}
