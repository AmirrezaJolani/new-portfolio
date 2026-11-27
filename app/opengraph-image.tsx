import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/features/drive/lib/content";
import en from "@/messages/en.json";

// Link preview for every route (LinkedIn, Telegram, Slack…). Rendered once at
// build time. Satori can't read CSS variables, so the colours below are the
// --px-* token values (DESIGN.md), the same exception as the canvas art.
// og-island.png: the game at 1200×630 with the intro closed and the HUD hidden.
const ASSETS = join(process.cwd(), "features/drive/assets");
const INK = "#1d1530";
const CREAM = "#fbe7cf";
const AMBER = "#ffb36b";
const DROP = "#0d0818";

export const alt = `${profile.name}: ${en.drive.profile.title}, ${en.drive.profile.location}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [font, island] = await Promise.all([
    readFile(join(ASSETS, "PressStart2P-Regular.ttf")),
    readFile(join(ASSETS, "og-island.png"), "base64"),
  ]);
  const { title, location } = en.drive.profile;

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      {/* biome-ignore lint/performance/noImgElement: Satori renders plain <img>, next/image doesn't apply */}
      <img
        src={`data:image/png;base64,${island}`}
        width={1200}
        height={630}
        alt=""
        style={{ position: "absolute" }}
      />
      <div
        style={{
          position: "absolute",
          left: 48,
          bottom: 56,
          display: "flex",
          flexDirection: "column",
          gap: 22,
          padding: "30px 34px",
          background: INK,
          color: CREAM,
          // .pixel-box: four hard cream edges = notched corners, plus a drop.
          boxShadow: `0 -6px 0 0 ${CREAM}, 0 6px 0 0 ${CREAM}, -6px 0 0 0 ${CREAM}, 6px 0 0 0 ${CREAM}, 0 14px 0 0 ${DROP}`,
        }}
      >
        {/* One line: at 36px the full name is ~900px, inside the 1200px card. */}
        <div style={{ fontSize: 36, whiteSpace: "nowrap" }}>{profile.name}</div>
        <div style={{ fontSize: 18, color: AMBER }}>
          {`${title} · ${location}`.toUpperCase()}
        </div>
        <div style={{ fontSize: 16, opacity: 0.8 }}>
          {profile.site.replace("https://www.", "")}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Press Start 2P", data: font, weight: 400 }],
    },
  );
}
