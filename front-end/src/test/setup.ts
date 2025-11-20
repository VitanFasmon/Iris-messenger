import "@testing-library/jest-dom";
import { beforeAll } from "vitest";

// Global test setup
beforeAll(() => {
  // Mock environment variables
  import.meta.env.VITE_API_URL = "http://localhost:8000/api";
});
