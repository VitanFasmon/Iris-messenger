import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "../../../features/auth/components/LoginForm";

// Mock useAuth hook
vi.mock("../../../features/auth/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    loading: false,
    error: null,
  })),
}));

describe("LoginForm component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it("renders username and password inputs", () => {
    renderWithProvider(<LoginForm />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderWithProvider(<LoginForm />);
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    renderWithProvider(<LoginForm />);
    const form = screen.getByRole("form");
    expect(form).toHaveAttribute("aria-label", "Login form");

    const usernameInput = screen.getByLabelText(/username/i);
    expect(usernameInput).toHaveAttribute("id", "login-username");
    expect(usernameInput).toHaveAttribute("autoComplete", "username");
  });
});
