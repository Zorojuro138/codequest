import { describe, expect, it } from "vitest";
import { getLevelFromXp, totalXpForLevel } from "./levels";

describe("level progression", () => {
  it("starts at level one and advances at the next threshold", () => {
    expect(getLevelFromXp(0).level).toBe(1);
    expect(getLevelFromXp(totalXpForLevel(2)).level).toBe(2);
  });

  it("keeps progress within the current level", () => {
    const progress = getLevelFromXp(150);
    expect(progress.level).toBe(1);
    expect(progress.progress).toBeGreaterThan(0);
    expect(progress.progress).toBeLessThan(100);
  });
});
