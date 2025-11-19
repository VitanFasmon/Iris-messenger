import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
// Placeholder page components (replace with real implementations later)
const ChatsPage = () => <div>Chats</div>;
const SettingsPage = () => <div>Settings</div>;
const ProfilePage = () => <div>Profile</div>;
const NotFoundPage = () => <div>404 Not Found</div>;

// Simple AuthGate stub (replace with real logic later)
function AuthGate({ children }: { children: React.ReactNode }) {
  const token = window.__iris_access_token;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
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
          <Route path="friends" element={<ChatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
