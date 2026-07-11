"use client";

import { useMediaQuery } from "./useMediaQuery";

/** Below Tailwind's md breakpoint (768px) we use the stacked mobile shell. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
