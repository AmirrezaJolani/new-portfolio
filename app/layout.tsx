import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { type Locale, rtlLocales } from "@/i18n/config";
import "./globals.css";

// Title, description and fonts come from the page (app/page.tsx, DrivePage).
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="h-full antialiased">
      <body className="min-h-full">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
