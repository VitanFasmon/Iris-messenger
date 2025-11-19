import { RegisterForm } from "../features/auth/components/RegisterForm";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow w-full max-w-sm space-y-4">
        <h2 className="text-xl font-semibold">Register</h2>
        <RegisterForm onSuccess={() => navigate("/app")} />
        <p className="text-xs text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
