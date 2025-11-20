import { RegisterForm } from "../features/auth/components/RegisterForm";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm p-8 w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Create an account</h2>
          <p className="text-sm text-muted-foreground">
            Enter your information to get started
          </p>
        </div>
        <RegisterForm onSuccess={() => navigate("/app")} />
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
