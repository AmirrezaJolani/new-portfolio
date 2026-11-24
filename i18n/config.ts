export const locales = ["en", "fa", "de", "it"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Right-to-left locales: `<html dir="rtl">`. */
export const rtlLocales: readonly Locale[] = ["fa"];

/** Language switcher options, in display order. Label: messages `languages.<labelKey>`. */
export const localeOptions = [
  { id: "en", labelKey: "english" },
  { id: "fa", labelKey: "persian" },
  { id: "de", labelKey: "german" },
  { id: "it", labelKey: "italian" },
] as const satisfies readonly { id: Locale; labelKey: string }[];
