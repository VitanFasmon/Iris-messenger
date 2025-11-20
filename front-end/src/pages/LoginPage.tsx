import { LoginForm } from "../features/auth/components/LoginForm";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // Use replace to avoid back-button loop, and navigate immediately after token is stored
    navigate("/app", { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm p-8 w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        <LoginForm onSuccess={handleLoginSuccess} />
        <p className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
