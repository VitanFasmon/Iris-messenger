import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import AuthGate from "../features/auth/components/AuthGate";
import ChatsPage from "../pages/ChatsPage";
import SettingsPage from "../pages/SettingsPage";
import NotFoundPage from "../pages/NotFoundPage";
import { getAccessToken } from "../lib/tokenStore";

function RootRedirect() {
  const token = getAccessToken();
  return <Navigate to={token ? "/app" : "/login"} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/app"
          element={
            <AuthGate>
              <AppLayout />
            </AuthGate>
          }
        >
          <Route index element={<ChatsPage />} />
          <Route path="chat/:id" element={<ChatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route
            path="profile"
            element={<Navigate to="/app/settings" replace />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
