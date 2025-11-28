import { RegisterForm } from "../features/auth/components/RegisterForm";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-linear-to-br from-emerald-900 via-teal-900 to-emerald-950 p-4 sm:p-8">
      <div className="w-full max-w-sm lg:max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/50 mb-4">
            <MessageCircle className="w-10 h-10 text-gray-900" />
          </div>
          <h1 className="text-white text-2xl font-semibold">Messenger</h1>
          <p className="text-emerald-200 text-sm mt-2">Create your account</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <RegisterForm onSuccess={() => navigate("/app")} />
        </div>

        {/* Switch to Login */}
        <div className="mt-6 text-center">
          <span className="text-emerald-100 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-emerald-100 underline hover:text-emerald-300 ml-2"
            >
              Sign in
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
