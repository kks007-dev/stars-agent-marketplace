import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HAS_CLERK, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "STARS Agent Marketplace", template: "%s | STARS Agent Marketplace" },
  description:
    "A free marketplace of specialized AI education agents: copy a prompt, set it up in Claude, ChatGPT, or Gemini, or chat with it here.",
  openGraph: { title: "STARS Agent Marketplace", description: "Free, open AI education agents for students, teachers, and parents.", type: "website" },
  icons: { icon: "/logo.png" },
};

export const viewport: Viewport = { themeColor: "#050b1f", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const shell = (
    <html lang="en">
      <body className="antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-gold-400 focus:px-3 focus:py-2 focus:text-black">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
  // Clerk is only mounted when keys exist, so the site builds and runs with no env vars.
  return HAS_CLERK ? (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">{shell}</ClerkProvider>
  ) : (
    shell
  );
}
