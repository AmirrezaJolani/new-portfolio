import type { IconName } from "./icons";

// Titles and descriptions: messages drive.achievements.<id>.{title,desc}.
export const ACHIEVEMENTS = [
  { id: "ignition", icon: "key" },
  { id: "first-stop", icon: "pin" },
  { id: "grand-tour", icon: "flag" },
  { id: "speed", icon: "bolt" },
  { id: "bump", icon: "boom" },
  { id: "beach", icon: "beach" },
  { id: "milano", icon: "italy" },
  { id: "lighthouse", icon: "lighthouse" },
  { id: "road-trip", icon: "road" },
  { id: "test-drive", icon: "car" },
  { id: "teleport", icon: "map" },
  { id: "dj", icon: "note" },
  { id: "night-owl", icon: "moon" },
  { id: "hello", icon: "wave" },
] as const satisfies readonly { id: string; icon: IconName }[];

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

// 1 world pixel = 0.25 m, so a 16px tile is a 4 m road lane.
export const METERS_PER_PX = 0.25;
