export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const LANDING_URL = (process.env.NEXT_PUBLIC_LANDING_URL || "https://starsportal.org").replace(/\/$/, "");
export const DONATE_URL = `${LANDING_URL}/donate`;
/** Set NEXT_PUBLIC_REPO_URL once the public repo exists; links fall back to /submit until then. */
export const REPO_URL = (process.env.NEXT_PUBLIC_REPO_URL || "").replace(/\/$/, "");

/** True when Clerk keys are present. The whole site works without them. */
export const HAS_CLERK = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
