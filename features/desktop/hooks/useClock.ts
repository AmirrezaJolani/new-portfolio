"use client";

import { useEffect, useState } from "react";

export function useClock(locale: string): string {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
}
