import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import AuthGate from "../features/auth/components/AuthGate";
// Placeholder page components (replace with real implementations later)
const ChatsPage = () => <div>Chats</div>;
const SettingsPage = () => <div>Settings</div>;
const ProfilePage = () => <div>Profile</div>;
const NotFoundPage = () => <div>404 Not Found</div>;

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
