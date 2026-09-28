import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { HAS_CLERK } from "@/lib/site";

export default function Page() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      {HAS_CLERK ? <SignUp /> : <NotConfigured what="Sign-up" />}
    </div>
  );
}

function NotConfigured({ what }: { what: string }) {
  return (
    <div className="card p-6 text-center">
      <h1 className="text-xl font-bold">{what} is not configured</h1>
      <p className="mt-2 text-slate-300">This deployment has no Clerk keys, so accounts and hosted chat are switched off. Browsing, copying prompts, and downloads all work.</p>
      <Link href="/agents" className="btn-gold mt-4">Browse agents</Link>
    </div>
  );
}
