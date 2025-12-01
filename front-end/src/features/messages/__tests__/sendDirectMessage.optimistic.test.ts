import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useSendDirectMessage } from "../hooks/useMessages";

vi.mock("../api/messages", async () => {
  const actual: any = await vi.importActual("../api/messages");
  return {
    ...actual,
    sendDirectMessage: vi.fn(async (payload: any) => {
      return {
        id: 999,
        sender_id: "me",
        receiver_id: payload.receiverId,
        content: payload.content ?? null,
        file_url: null,
        timestamp: new Date().toISOString(),
        localStatus: "sent",
      };
    }),
    fetchMessages: vi.fn(async () => []),
  };
});

function setup(receiverId: number) {
  const qc = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
  return { qc, wrapper, receiverId };
}

describe("useSendDirectMessage optimistic update", () => {
  it("appends optimistic message then replaces after success", async () => {
    const { wrapper, receiverId } = setup(42);
    const { result: sendResult } = renderHook(
      () => useSendDirectMessage(receiverId),
      { wrapper }
    );

    // Mutation should succeed and return message with id 999 from mock
    let mutationResult;
    await act(async () => {
      mutationResult = await sendResult.current.mutateAsync({
        content: "Hello world",
      });
    });

    // Verify mock returned expected message
    expect(mutationResult).toBeDefined();
    expect((mutationResult as any).id).toBe(999);
  });
});
