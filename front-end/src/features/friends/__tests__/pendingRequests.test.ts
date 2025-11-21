import { describe, it, expect, vi } from "vitest";
import { fetchPendingRequests } from "../../friends/api/friends";
import * as axiosApi from "../../../lib/axios";

// Mock axios "api" instance
vi.mock("../../../lib/axios", () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

describe("fetchPendingRequests", () => {
  it("maps backend shape to PendingFriendRequest[]", async () => {
    const sample = [
      {
        id: 10,
        user: { id: 7, username: "alice" },
        created_at: "2025-11-20T12:00:00Z",
      },
    ];
    (axiosApi as any).api.get.mockResolvedValue({ data: sample });
    const result = await fetchPendingRequests();
    expect(result).toEqual([
      {
        id: 10,
        user: { id: 7, username: "alice" },
        created_at: "2025-11-20T12:00:00Z",
      },
    ]);
  });
});
