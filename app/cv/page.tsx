import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CvPage } from "@/features/drive";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("drive");
  return { title: t("cv.title"), description: t("meta.description") };
}

export default function Cv() {
  return <CvPage />;
}
