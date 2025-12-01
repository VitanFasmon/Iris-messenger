import { describe, it, expect } from "vitest";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../lib/tokenStore";

describe("tokenStore", () => {
  it("returns null when no token is set", () => {
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("stores and retrieves token from memory", () => {
    setAccessToken("test-token-123");
    expect(getAccessToken()).toBe("test-token-123");
  });

  it("clears token correctly", () => {
    setAccessToken("test-token-456");
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});
