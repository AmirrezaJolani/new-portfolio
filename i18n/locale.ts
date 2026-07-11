"use server";

import { cookies } from "next/headers";
import { hasLocale } from "next-intl";
import { defaultLocale, type Locale, locales } from "./config";

const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale(): Promise<Locale> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return hasLocale(locales, value) ? value : defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);
}
