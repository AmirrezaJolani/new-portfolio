import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";
import { DrivePage } from "@/features/drive";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("drive.meta");
  const title = t("title");
  const description = t("description");
  // The image comes from app/opengraph-image.tsx.
  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: { title, description, url: "/", type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

// The game owns the whole screen: no pinch-zoom fighting the joystick.
export const viewport: Viewport = {
  themeColor: "#2a1240",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function Home() {
  return <DrivePage />;
}
