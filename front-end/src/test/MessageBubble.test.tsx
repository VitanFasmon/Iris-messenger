import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { MessageBubble } from "../features/messages/components/MessageBubble";
import type { Message } from "../features/messages/api/messages";

const createWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("MessageBubble", () => {
  it("renders text content correctly", () => {
    const message: Message = {
      id: 1,
      sender_id: 1,
      receiver_id: 2,
      content: "Hello, world!",
      file_url: null,
      filename: null,
      timestamp: new Date().toISOString(),
      delete_after: null,
      expires_at: null,
      attachments: [],
    };

    const { container } = render(
      <MessageBubble message={message} isMine={true} />,
      { wrapper: createWrapper() }
    );

    expect(container.textContent).toContain("Hello, world!");
  });

  it("displays countdown when delete_after is set", () => {
    const message: Message = {
      id: 2,
      sender_id: 1,
      receiver_id: 2,
      content: "Ephemeral",
      file_url: null,
      filename: null,
      timestamp: new Date().toISOString(),
      delete_after: 300,
      expires_at: new Date(Date.now() + 300000).toISOString(),
      attachments: [],
    };

    render(<MessageBubble message={message} isMine={false} />, {
      wrapper: createWrapper(),
    });

    // Should display countdown timer badge (separate from timestamp HH:MM format)
    // The countdown badge has specific styling: rounded-full with emerald text
    const timerBadge = screen.getByText(/^\d+:\d{2}$/, {
      selector: ".text-emerald-300",
    });
    expect(timerBadge).toBeDefined();
  });

  it("renders download button for non-image attachments", () => {
    const message: Message = {
      id: 3,
      sender_id: 1,
      receiver_id: 2,
      content: null,
      file_url: "/storage/uploads/document.pdf",
      filename: "report.pdf",
      timestamp: new Date().toISOString(),
      delete_after: null,
      expires_at: null,
      attachments: [
        {
          id: 1,
          file_type: "file",
          file_url: "/storage/uploads/document.pdf",
          filename: "report.pdf",
        },
      ],
    };

    render(<MessageBubble message={message} isMine={true} />, {
      wrapper: createWrapper(),
    });

    const button = screen.getByRole("button", { name: /report\.pdf/i });
    expect(button).toBeDefined();
  });
});
