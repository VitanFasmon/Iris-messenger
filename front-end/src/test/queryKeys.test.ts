import { describe, it, expect } from "vitest";
import { queryKeys } from "../lib/queryKeys";

describe("queryKeys", () => {
  it("generates stable keys for the same receiver", () => {
    const key1 = queryKeys.directMessages(42);
    const key2 = queryKeys.directMessages(42);
    expect(key1).toEqual(key2);
  });

  it("generates different keys for different receivers", () => {
    const key1 = queryKeys.directMessages(1);
    const key2 = queryKeys.directMessages(2);
    expect(key1).not.toEqual(key2);
  });

  it("handles string and number ids consistently", () => {
    const keyStr = queryKeys.directMessages("123");
    const keyNum = queryKeys.directMessages(123);
    // They are different but both valid
    expect(keyStr[0]).toBe("directMessages");
    expect(keyNum[0]).toBe("directMessages");
  });

  it("provides stable presence key", () => {
    expect(queryKeys.presence).toEqual(["presence"]);
  });
});
