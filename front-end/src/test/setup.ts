import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const apiBase = "http://localhost:8000/api";

// MSW server for API mocking
const server = setupServer(
  // Login mock
  http.post(`${apiBase}/auth/login`, () => {
    return HttpResponse.json({
      message: "Login successful",
      user: { id: 1, username: "alice", email: "alice@example.com" },
      token: "test-token",
    });
  }),
  // Messages page mock (paginated)
  http.get(`${apiBase}/messages/:id`, () => {
    return HttpResponse.json([
      {
        id: 1,
        sender_id: 1,
        receiver_id: 2,
        content: "Hello Bob!",
        file_url: null,
        filename: null,
        timestamp: new Date(Date.now() - 60000).toISOString(),
        delete_after: null,
        expires_at: null,
        attachments: [],
      },
    ]);
  }),
  // Friends list mock
  http.get(`${apiBase}/friends`, () => {
    return HttpResponse.json([
      {
        id: 2,
        username: "bob",
        email: "bob@example.com",
        profile_picture_url: null,
        last_online: new Date().toISOString(),
      },
    ]);
  }),
  // User session mock
  http.get(`${apiBase}/me`, () => {
    return HttpResponse.json({
      id: 1,
      username: "alice",
      email: "alice@example.com",
      profile_picture_url: null,
      last_online: new Date().toISOString(),
    });
  })
);

beforeAll(() => {
  server.listen();
  // Mock environment
  import.meta.env.VITE_API_URL = apiBase;
  import.meta.env.VITE_API_BASE_URL = "http://localhost:8000";
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

export { server, http, HttpResponse };
