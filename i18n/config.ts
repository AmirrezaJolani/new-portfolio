export const locales = ["en", "fa", "de", "nl", "it"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Right-to-left locales (drives `dir` on <html> and the Vazir Persian font). */
export const rtlLocales: Locale[] = ["fa"];

/** Each language shown in its own name (endonym) in the language switcher. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  fa: "فارسی",
  de: "Deutsch",
  nl: "Nederlands",
  it: "Italiano",
};
