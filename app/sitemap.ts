import type { MetadataRoute } from "next";
import { getAllAgents } from "@/lib/agents";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/agents", "/setup", "/submit", "/about"].map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }));
  const agents = getAllAgents().map((a) => ({ url: `${SITE_URL}/agents/${a.slug}`, lastModified: a.createdAt, changeFrequency: "monthly" as const, priority: 0.8 }));
  return [...pages, ...agents];
}
