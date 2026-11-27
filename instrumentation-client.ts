import posthog from "posthog-js";

// Product analytics (PostHog). Runs before the app is interactive. Without a
// token (local dev, CI, the Docker image) nothing loads and track() is a no-op.
const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token) {
  posthog.init(token, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2026-01-30",
    // Cookieless: nothing stored on the device, so no consent banner is
    // needed. Trade-off: every page load is a new anonymous visitor.
    persistence: "memory",
  });
}
