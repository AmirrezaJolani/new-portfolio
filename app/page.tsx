import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("apps");
  return <main className="p-8">{t("about")} · i18n works.</main>;
}
