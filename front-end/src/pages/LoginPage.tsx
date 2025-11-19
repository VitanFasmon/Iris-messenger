import { LoginForm } from "../features/auth/components/LoginForm";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow w-full max-w-sm space-y-4">
        <h2 className="text-xl font-semibold">Login</h2>
        <LoginForm onSuccess={() => navigate("/app")} />
        <p className="text-xs text-gray-500">
          Don't have an account?{" "}
          <a href="/register" className="text-indigo-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
