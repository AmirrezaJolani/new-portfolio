// Titles and descriptions: messages drive.achievements.<id>.{title,desc}.
export const ACHIEVEMENTS = [
  { id: "ignition", icon: "🔑" },
  { id: "first-stop", icon: "📍" },
  { id: "grand-tour", icon: "🏁" },
  { id: "speed", icon: "⚡" },
  { id: "bump", icon: "💥" },
  { id: "beach", icon: "🏖" },
  { id: "milano", icon: "🇮🇹" },
  { id: "lighthouse", icon: "🗼" },
  { id: "road-trip", icon: "🛣" },
  { id: "test-drive", icon: "🚙" },
  { id: "teleport", icon: "🗺" },
  { id: "dj", icon: "🎵" },
  { id: "night-owl", icon: "🌙" },
  { id: "hello", icon: "👋" },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

// 1 world pixel = 0.25 m, so a 16px tile is a 4 m road lane.
export const METERS_PER_PX = 0.25;
