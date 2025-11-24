import React, { useState } from "react";
import { updateProfile, changePassword } from "../features/profile/api/profile";
import { useSession } from "../features/auth/hooks/useSession";
// import { ProfileSettings } from "../features/profile/components/ProfileSettings";
import { LogOut, User as UserIcon, Mail, Lock, Camera } from "lucide-react";
import { clearAccessToken, getAccessToken } from "../lib/tokenStore";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "../store/uiStore";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  const { data: user } = useSession();
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const navigate = useNavigate();
  const { pushToast } = useUiStore();
  const queryClient = useQueryClient();

  // Placeholder local form state (could be replaced with form lib)
  const [usernameDraft, setUsernameDraft] = useState(user?.username || "");
  const [emailDraft, setEmailDraft] = useState(user?.email || "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
      }).catch(() => {
        // Ignore errors - we'll clear local state regardless
      });
    } catch {
      // Ignore network errors
    }

    // Clear local token
    clearAccessToken();

    // Clear React Query cache to immediately remove user data
    queryClient.clear();

    pushToast({ type: "info", message: "Logged out." });
    navigate("/login", { replace: true });
  };

  const avatarUrl = user?.profile_picture_url
    ? `${user.profile_picture_url}?t=${Date.now()}`
    : undefined;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ username: usernameDraft, email: emailDraft });
      pushToast({ type: "success", message: "Profile updated." });
      setEditingProfile(false);
      // Optionally: refetch session/user data here
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Profile update failed.";
      pushToast({ type: "error", message: msg });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      pushToast({ type: "error", message: "Passwords do not match." });
      return;
    }
    try {
      await changePassword({
        current_password: currentPw,
        new_password: newPw,
      });
      pushToast({ type: "success", message: "Password updated." });
      setChangingPassword(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Password update failed.";
      pushToast({ type: "error", message: msg });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950">
      <div className="px-6 py-8 flex flex-col items-center gap-10">
        {/* Avatar & Basic Info */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border border-gray-700 shadow-lg">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="profile avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-300">
                  {(user?.username?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>(
                  'input[type="file"][accept^="image/"]'
                );
                input?.click();
              }}
              aria-label="Change profile picture"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-600 text-gray-900 flex items-center justify-center shadow-md hover:bg-emerald-500 transition"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-white text-lg font-semibold">
              {user?.username || "Guest"}
            </h1>
            {user?.email && (
              <p className="text-sm text-gray-400 mt-1">{user.email}</p>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col gap-8">
          {/* Profile Information Section */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <UserIcon className="w-4 h-4 text-gray-400" /> Profile
                Information
              </div>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="text-emerald-400 text-xs px-3 py-1.5 rounded border border-gray-700 hover:bg-gray-800 hover:text-emerald-300 transition"
                >
                  Edit
                </button>
              )}
            </div>
            {editingProfile ? (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-gray-300 text-xs">Username</label>
                  <input
                    value={usernameDraft}
                    onChange={(e) => setUsernameDraft(e.target.value)}
                    className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="username"
                  />
                  <p className="text-[10px] text-gray-500">
                    Your unique username
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-gray-300 text-xs">Email</label>
                  <input
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-gray-900 font-medium text-xs rounded py-2 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="flex-1 border border-gray-700 text-gray-300 hover:bg-gray-800 text-xs rounded py-2 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 bg-gray-800/40 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500">Username</p>
                    <p className="text-sm text-white">{user?.username}</p>
                  </div>
                </div>
                <div className="h-px bg-gray-700" />
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500">Email</p>
                    <p className="text-sm text-white">{user?.email || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Security Section */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <Lock className="w-4 h-4 text-gray-400" /> Security
              </div>
              {!changingPassword && (
                <button
                  onClick={() => setChangingPassword(true)}
                  className="text-emerald-400 text-xs px-3 py-1.5 rounded border border-gray-700 hover:bg-gray-800 hover:text-emerald-300 transition"
                >
                  Change Password
                </button>
              )}
            </div>
            {changingPassword ? (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-gray-300 text-xs">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-300 text-xs">New Password</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-300 text-xs">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-gray-900 font-medium text-xs rounded py-2 transition"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setChangingPassword(false)}
                    className="flex-1 border border-gray-700 text-gray-300 hover:bg-gray-800 text-xs rounded py-2 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-gray-400">
                Change your password regularly to keep your account secure.
              </p>
            )}
          </section>
          {/* Logout Section */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded py-2 transition"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
