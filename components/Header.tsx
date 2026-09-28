import Image from "next/image";
import Link from "next/link";
import AuthButtons from "./AuthButtons";
import { HAS_CLERK } from "@/lib/site";

const NAV = [
  { href: "/agents", label: "Browse agents" },
  { href: "/setup", label: "Setup guide" },
  { href: "/submit", label: "Contribute" },
  { href: "/about", label: "About" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-space-900/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold" aria-label="STARS Agent Marketplace home">
          <Image src="/logo.png" alt="" width={68} height={21} className="h-6 w-auto" priority />
          <span className="hidden text-sm sm:inline">
            Agent <span className="text-gold-400">Marketplace</span>
          </span>
        </Link>
        <nav aria-label="Main" className="ml-auto flex items-center gap-1 overflow-x-auto text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-slate-200 hover:bg-white/10 hover:text-white">
              {n.label}
            </Link>
          ))}
          <Link href="/donate" className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-gold-300 hover:bg-white/10">
            Donate
          </Link>
        </nav>
        {HAS_CLERK && (
          <div className="flex items-center">
            <AuthButtons />
          </div>
        )}
      </div>
    </header>
  );
}
