import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { defaultLocale, localeOptions, locales } from "./config";

type Tree = { [key: string]: string | Tree };
const load = (locale: string): Tree =>
  JSON.parse(
    readFileSync(
      new URL(`../messages/${locale}.json`, import.meta.url),
      "utf8",
    ),
  );
const keys = (tree: Tree, prefix = ""): string[] =>
  Object.entries(tree).flatMap(([k, v]) =>
    typeof v === "string" ? [prefix + k] : keys(v, `${prefix}${k}.`),
  );

describe("message catalogs", () => {
  const base = keys(load(defaultLocale)).sort();

  test.each(locales)("%s has exactly the default locale's keys", (locale) => {
    expect(keys(load(locale)).sort()).toEqual(base);
  });

  test("every switcher option is a real locale with a label", () => {
    expect(localeOptions.map((l) => l.id).sort()).toEqual([...locales].sort());
    for (const l of localeOptions)
      expect(base).toContain(`languages.${l.labelKey}`);
  });
});
