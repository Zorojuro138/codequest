import { describe, expect, it } from "vitest";
import { catalog } from "./catalog";

describe("demo course catalog", () => {
  it("contains Python and JavaScript with three units and four lessons per unit", () => {
    expect(catalog.map((language) => language.slug)).toEqual(["python", "javascript"]);
    for (const language of catalog) {
      expect(language.units).toHaveLength(3);
      for (const unit of language.units) expect(unit.lessons).toHaveLength(4);
    }
  });

  it("attributes each language to an allowlisted source", () => {
    for (const language of catalog) {
      expect(language.sourceName.length).toBeGreaterThan(0);
      expect(language.sourceUrl).toMatch(/^https:\/\//);
    }
  });
});
