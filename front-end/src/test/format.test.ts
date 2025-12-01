import { describe, it, expect } from "vitest";
import { formatRemaining, formatTimerDisplay } from "../lib/format";

describe("Format Utilities", () => {
  describe("formatRemaining", () => {
    it("formats seconds only (below 1 minute)", () => {
      expect(formatRemaining(45000)).toBe("0:45");
    });

    it("formats minutes and seconds", () => {
      expect(formatRemaining(125000)).toBe("2:05");
    });

    it("formats hours, minutes, and seconds", () => {
      expect(formatRemaining(7325000)).toBe("2:02:05");
    });

    it("handles zero", () => {
      expect(formatRemaining(0)).toBe("0:00");
    });
  });

  describe("formatTimerDisplay", () => {
    it("shows seconds for < 60", () => {
      expect(formatTimerDisplay(30)).toBe("30s");
    });

    it("shows minutes for < 3600", () => {
      expect(formatTimerDisplay(300)).toBe("5m");
    });

    it("shows hours for < 86400", () => {
      expect(formatTimerDisplay(7200)).toBe("2h");
    });

    it("shows days for >= 86400", () => {
      expect(formatTimerDisplay(172800)).toBe("2d");
    });
  });
});
