import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { contact, profile } from "@/features/drive/lib/content";
import { type Locale, rtlLocales } from "@/i18n/config";
import "./globals.css";

// Per-page title, description and Open Graph come from each page.
export const metadata: Metadata = { metadataBase: new URL(profile.site) };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = await getTranslations("drive.profile");
  const dir = rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";

  // schema.org Person, so search engines and AI tools know whose site this is.
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: t("title"),
    url: profile.site,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Milan",
      addressCountry: "IT",
    },
    sameAs: [
      profile.github,
      profile.linkedin,
      ...contact.filter((c) => c.id === "github2").map((c) => c.href),
    ],
  };

  return (
    <html lang={locale} dir={dir} className="h-full antialiased">
      <body className="min-h-full">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from our own data; `<` escaped per the Next.js JSON-LD guide
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(person).replace(/</g, "\\u003c"),
          }}
        />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
