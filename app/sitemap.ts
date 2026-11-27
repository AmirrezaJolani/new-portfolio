import type { MetadataRoute } from "next";
import { profile } from "@/features/drive/lib/content";

// No locale URLs: the language is a cookie, so each page is listed once.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: profile.site, changeFrequency: "monthly", priority: 1 },
    { url: `${profile.site}/cv`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
