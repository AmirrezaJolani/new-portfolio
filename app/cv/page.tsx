import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CvPage } from "@/features/drive";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("drive");
  const title = t("cv.title");
  const description = t("meta.description");
  return {
    title,
    description,
    alternates: { canonical: "/cv" },
    openGraph: { title, description, url: "/cv", type: "profile" },
    twitter: { card: "summary_large_image" },
  };
}

export default function Cv() {
  return <CvPage />;
}
