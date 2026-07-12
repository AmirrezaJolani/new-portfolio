"use server";

import { cookies } from "next/headers";
import { SETTINGS_COOKIE, type Settings } from "./config";

export async function setSettingsCookie(settings: Settings) {
  (await cookies()).set(SETTINGS_COOKIE, JSON.stringify(settings), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
