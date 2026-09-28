import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ChatClient from "@/components/ChatClient";
import { getAgent } from "@/lib/agents";
import { HAS_CLERK } from "@/lib/site";

export const metadata: Metadata = { title: "Chat", robots: { index: false } };

export default async function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = getAgent(slug);
  if (!agent) notFound();

  if (!HAS_CLERK) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-bold">Chat with {agent.name}</h1>
        <div className="card mt-6 p-6">
          <p className="font-semibold text-gold-300">Sign-in is not configured on this deployment.</p>
          <p className="mt-2 text-slate-300">Hosted chat needs accounts. You can still copy this agent&apos;s prompt and use it in Claude, ChatGPT, or Gemini.</p>
          <div className="mt-4 flex gap-3">
            <Link href={`/agents/${agent.slug}`} className="btn-gold">Back to the agent and setup guides</Link>
          </div>
        </div>
      </div>
    );
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/chat/${slug}`)}`);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href={`/agents/${agent.slug}`} className="text-sm text-slate-400 hover:text-gold-300">&larr; {agent.name} details</Link>
      <h1 className="mt-2 text-2xl font-bold">Chat with {agent.name}</h1>
      <p className="mb-4 mt-1 text-sm text-slate-300">{agent.tagline}</p>
      {agent.ageRange.min < 13 && (
        <p className="mb-4 rounded-lg border border-gold-400/40 bg-gold-400/5 px-3 py-2 text-sm text-slate-100">An adult should sit with younger learners during chat.</p>
      )}
      <ChatClient slug={agent.slug} name={agent.name} starters={agent.starterPrompts.slice(0, 4)} />
    </div>
  );
}
