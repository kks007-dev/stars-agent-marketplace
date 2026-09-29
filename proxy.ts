import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Next.js 16: `middleware.ts` was renamed to `proxy.ts`.
const isProtected = createRouteMatcher(["/chat(.*)", "/api/chat(.*)"]);

const clerk = clerkMiddleware(async (auth, req) => {
  if (!isProtected(req)) return;
  // API callers get a JSON 401 instead of a redirect to the sign-in page.
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Please sign in to chat." }, { status: 401 });
    return;
  }
  await auth.protect();
});

const configured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

export default function proxy(req: NextRequest, evt: NextFetchEvent) {
  // Without Clerk keys the site still works: pages are public and /chat shows a
  // "sign-in not configured" notice; /api/chat refuses to run.
  if (!configured) return NextResponse.next();
  return clerk(req, evt);
}

export const config = {
  matcher: [
    // Skip Next internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|txt|xml|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
