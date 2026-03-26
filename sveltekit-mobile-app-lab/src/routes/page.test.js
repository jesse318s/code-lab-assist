import { describe, it, expect } from "vitest";
import { modulo } from "./utils.js";

describe("modulo function", () => {
  it("divides 1 by 1 and gives remainder of 0", () => {
    expect(modulo(1, 1)).toBe(0);
  });
});
