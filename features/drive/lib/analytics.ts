import posthog from "posthog-js";
import type { SectionId } from "@/workflows/driveWorld";

// The visitor funnel: start_driving → stop_opened → cv_download / contact_click.
// PostHog adds $pathname to every event, so / and /cv are told apart for free.
type Events = {
  /** Left the intro panel: its buttons/backdrop, Esc, or "Skip to about me". */
  start_driving: { via: "close" | "esc" | "skip_to_about" };
  /** A building's panel opened: parked on its pad, fast travel, or the intro skip. */
  stop_opened: {
    id: SectionId;
    via: "pad" | "map" | "intro";
    first_visit: boolean;
  };
  cv_download: Record<string, never>;
  contact_click: { id: string };
};

/** No-op until instrumentation-client.ts has initialised PostHog. */
export function track<E extends keyof Events>(event: E, props: Events[E]) {
  if (posthog.__loaded) posthog.capture(event, props);
}
