import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { SettingsProvider } from "@/context/SettingsContext";
import { parseSettings, SETTINGS_COOKIE } from "@/settings/config";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio OS",
  description: "An interactive macOS-style portfolio.",
};

// Runs before paint: resolves `auto` against the OS preference so there is no
// dark-mode flash. Explicit light/dark is already set server-side below.
const NO_FLASH = `(function(){try{var m=document.cookie.match(/(?:^|; )app-settings=([^;]*)/);var s=m?JSON.parse(decodeURIComponent(m[1])):{};var t=s.theme||"auto";var dark=t==="dark"||(t==="auto"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";
  const settings = parseSettings((await cookies()).get(SETTINGS_COOKIE)?.value);
  const serverDark = settings.theme === "dark"; // `auto` corrected by NO_FLASH

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${serverDark ? "dark" : ""}`}
      data-wallpaper={settings.wallpaper}
      data-reduce-transparency={settings.reduceTransparency ? "" : undefined}
      data-reduce-motion={settings.reduceMotion ? "" : undefined}
      data-larger-text={settings.largerText ? "" : undefined}
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: pre-hydration no-flash theme script */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body className="min-h-full">
        <NextIntlClientProvider>
          <SettingsProvider initial={settings}>{children}</SettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
