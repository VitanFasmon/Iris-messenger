import React, { useState, useRef } from "react";
import { updateProfile, changePassword } from "../features/profile/api/profile";
import { useSession } from "../features/auth/hooks/useSession";
import { useProfilePicture } from "../features/profile/hooks/useProfilePicture";
// import { ProfileSettings } from "../features/profile/components/ProfileSettings";
import {
  LogOut,
  User as UserIcon,
  Mail,
  Lock,
  Camera,
  Palette,
  Sun,
  Moon,
} from "lucide-react";
import { clearAccessToken, getAccessToken } from "../lib/tokenStore";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "../store/uiStore";
import { useQueryClient } from "@tanstack/react-query";
import { getFullUrl } from "../lib/urls";
import { useTheme } from "../hooks/useTheme";

export default function SettingsPage() {
  const { data: user } = useSession();
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const navigate = useNavigate();
  const { pushToast } = useUiStore();
  const queryClient = useQueryClient();
  const { upload } = useProfilePicture();
  const fileRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme, colors } = useTheme();

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
    ? `${getFullUrl(user.profile_picture_url)}?t=${Date.now()}`
    : undefined;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Client-side validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!file.type.startsWith("image/")) {
        pushToast({
          type: "error",
          message: "Please select a valid image file.",
        });
        return;
      }
      if (file.size > maxSize) {
        pushToast({
          type: "error",
          message: "Image too large. Max size is 5MB.",
        });
        return;
      }
      const formData = new FormData();
      formData.append("profile_picture", file);
      upload.mutate(formData, {
        onSuccess: () => {
          pushToast({ type: "success", message: "Profile picture updated." });
          queryClient.invalidateQueries({ queryKey: ["session"] });
        },
        onError: (err: any) => {
          const serverMsg = err?.response?.data?.message;
          const firstFieldError = (() => {
            const errors = err?.response?.data?.errors;
            if (errors && typeof errors === "object") {
              const first = Object.values(errors)[0] as string[] | undefined;
              return first?.[0];
            }
            return undefined;
          })();
          pushToast({
            type: "error",
            message:
              serverMsg || firstFieldError || err?.message || "Upload failed.",
          });
        },
      });
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ username: usernameDraft, email: emailDraft });
      pushToast({ type: "success", message: "Profile updated." });
      setEditingProfile(false);
      // Refetch session data to update the UI immediately
      await queryClient.invalidateQueries({ queryKey: ["session"] });
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
    <div className={`flex-1 overflow-y-auto ${colors.bg.primary}`}>
      <div className="flex items-center justify-start w-full p-4 lg:p-6">
        <h2 className={`text-lg font-semibold ${colors.text.primary}`}>
          Settings & Profile
        </h2>
      </div>
      <div className="pb-8 flex flex-col items-center gap-10 lg:px-6">
        {/* Avatar & Basic Info */}
        <div
          className={`flex flex-col items-center gap-4 ${colors.card.bg} border-t ${colors.border.primary} p-5 w-full lg:max-w-2xl lg:rounded-xl lg:border lg:shadow-lg`}
        >
          <div className="relative p-4">
            <div
              className={`w-24 h-24 rounded-full overflow-hidden ${colors.avatar.bg} border ${colors.avatar.border} shadow-lg`}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="profile avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-2xl font-semibold ${colors.avatar.text}`}
                >
                  {(user?.username?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              style={{ display: "none" }}
              onChange={handleAvatarUpload}
              aria-label="Upload profile picture file"
            />
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Change profile picture"
              disabled={upload.status === "pending"}
              className={`absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shadow-md hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === "light" ? "text-white" : "text-gray-900"
              }`}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center">
            <h1 className={`${colors.text.primary} text-lg font-semibold`}>
              {user?.username || "Guest"}
            </h1>
            {user?.email && (
              <p className={`text-sm ${colors.text.tertiary} mt-1`}>
                {user.email}
              </p>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col gap-8 lg:max-w-2xl">
          {/* Profile Information Section */}
          <section
            className={`${colors.card.bg} border-l-0 border-r-0 border ${colors.border.primary} p-5 shadow-lg lg:rounded-xl lg:border-l lg:border-r`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`flex items-center gap-2 ${colors.text.primary} text-sm font-medium`}
              >
                <UserIcon className={`w-4 h-4 ${colors.text.tertiary}`} />{" "}
                Profile Information
              </div>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className={`text-emerald-400 text-xs px-3 py-1.5 rounded border ${colors.border.secondary} ${colors.card.hover} hover:text-emerald-300 transition`}
                >
                  Edit
                </button>
              )}
            </div>
            {editingProfile ? (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="space-y-2">
                  <label className={`${colors.text.secondary} text-xs`}>
                    Username
                  </label>
                  <input
                    value={usernameDraft}
                    onChange={(e) => setUsernameDraft(e.target.value)}
                    className={`w-full rounded ${colors.input.bg} border ${colors.input.border} px-3 py-2 text-sm ${colors.input.text} ${colors.input.placeholder} focus:outline-none focus:ring-2 focus:ring-emerald-600`}
                    placeholder="username"
                  />
                  <p className={`text-[10px] ${colors.text.muted}`}>
                    Your unique username
                  </p>
                </div>
                <div className="space-y-2">
                  <label className={`${colors.text.secondary} text-xs`}>
                    Email
                  </label>
                  <input
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    className={`w-full rounded ${colors.input.bg} border ${colors.input.border} px-3 py-2 text-sm ${colors.input.text} ${colors.input.placeholder} focus:outline-none focus:ring-2 focus:ring-emerald-600`}
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
                    className={`flex-1 border ${colors.border.secondary} ${colors.text.secondary} ${colors.card.hover} text-xs rounded py-2 transition`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div
                className={`space-y-3 ${colors.bg.secondary} border ${colors.border.secondary} rounded-lg p-4`}
              >
                <div className="flex items-center gap-3">
                  <UserIcon className={`w-4 h-4 ${colors.text.tertiary}`} />
                  <div>
                    <p className={`text-[10px] ${colors.text.muted}`}>
                      Username
                    </p>
                    <p className={`text-sm ${colors.text.primary}`}>
                      {user?.username}
                    </p>
                  </div>
                </div>
                <div className={`h-px ${colors.border.secondary}`} />
                <div className="flex items-center gap-3">
                  <Mail className={`w-4 h-4 ${colors.text.tertiary}`} />
                  <div>
                    <p className={`text-[10px] ${colors.text.muted}`}>Email</p>
                    <p className={`text-sm ${colors.text.primary}`}>
                      {user?.email || "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Appearance Section */}
          <section
            className={`${colors.card.bg} p-5 border-l-0 border-r-0 border-t border-b ${colors.border.primary} lg:rounded-xl lg:border-l lg:border-r lg:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`flex items-center gap-2 ${colors.text.primary} text-sm font-medium`}
              >
                <Palette className={`w-4 h-4 ${colors.text.tertiary}`} />{" "}
                Appearance
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  className={`${colors.text.secondary} text-xs mb-2 block`}
                >
                  Theme
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                      theme === "light"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : `${colors.border.secondary} ${colors.card.bg} ${colors.text.secondary} hover:border-emerald-400`
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                      theme === "dark"
                        ? "border-emerald-500 bg-emerald-950/50 text-emerald-400"
                        : `${colors.border.secondary} ${colors.card.bg} ${colors.text.secondary} hover:border-emerald-400`
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                </div>
              </div>
              <p className={`text-xs ${colors.text.tertiary}`}>
                Choose your preferred theme. Your selection will be saved
                automatically.
              </p>
            </div>
          </section>

          {/* Security Section */}
          <section
            className={`${colors.card.bg} p-5 border-l-0 border-r-0 border-t border-b ${colors.border.primary} lg:rounded-xl lg:border-l lg:border-r lg:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`flex items-center gap-2 ${colors.text.primary} text-sm font-medium`}
              >
                <Lock className={`w-4 h-4 ${colors.text.tertiary}`} /> Security
              </div>
              {!changingPassword && (
                <button
                  onClick={() => setChangingPassword(true)}
                  className={`text-emerald-400 text-xs px-3 py-1.5 rounded border ${colors.border.secondary} ${colors.card.hover} hover:text-emerald-300 transition`}
                >
                  Change Password
                </button>
              )}
            </div>
            {changingPassword ? (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className={`${colors.text.secondary} text-xs`}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className={`w-full rounded ${colors.input.bg} border ${colors.input.border} px-3 py-2 text-sm ${colors.input.text} focus:outline-none focus:ring-2 focus:ring-emerald-600`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`${colors.text.secondary} text-xs`}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className={`w-full rounded ${colors.input.bg} border ${colors.input.border} px-3 py-2 text-sm ${colors.input.text} focus:outline-none focus:ring-2 focus:ring-emerald-600`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`${colors.text.secondary} text-xs`}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className={`w-full rounded ${colors.input.bg} border ${colors.input.border} px-3 py-2 text-sm ${colors.input.text} focus:outline-none focus:ring-2 focus:ring-emerald-600`}
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
                    className={`flex-1 border ${colors.border.secondary} ${colors.text.secondary} ${colors.card.hover} text-xs rounded py-2 transition`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className={`text-xs ${colors.text.tertiary}`}>
                Change your password regularly to keep your account secure.
              </p>
            )}
          </section>
          {/* Logout Section */}
          <section
            className={`${colors.card.bg} border-l-0 border-r-0 border ${colors.border.primary} p-5 shadow-lg lg:rounded-xl lg:border-l lg:border-r`}
          >
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
