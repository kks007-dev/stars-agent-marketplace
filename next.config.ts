import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve /agents/<slug>.md as the raw prompt (markdown with frontmatter).
  async rewrites() {
    return [
      { source: "/agents/:slug([a-z0-9-]+).md", destination: "/api/agents/:slug/md" },
    ];
  },
};

export default nextConfig;
