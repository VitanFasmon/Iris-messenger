import React from "react";
import { ProfileSettings } from "../features/profile/components/ProfileSettings";
import { useSession } from "../features/auth/hooks/useSession";
import { getFullUrl } from "../lib/urls";
import { useTheme } from "../hooks/useTheme";

const ProfilePage: React.FC = () => {
  const { colors } = useTheme();
  const { data: user } = useSession();
  return (
    <div className={`flex-1 overflow-y-auto ${colors.bg.primary}`}>
      <div className="px-4 lg:px-6 py-8 flex flex-col items-center gap-8">
        {/* Avatar Cluster */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className={`w-28 h-28 rounded-full overflow-hidden ${colors.avatar.bg} border ${colors.avatar.border} shadow-lg`}
            >
              {user?.profile_picture_url ? (
                <img
                  src={`${getFullUrl(
                    user.profile_picture_url
                  )}?t=${Date.now()}`}
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
            {/* Camera overlay button */}
            <button
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>(
                  'input[type="file"][accept^="image/"]'
                );
                input?.click();
              }}
              aria-label="Change profile picture"
              className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-emerald-600 text-gray-900 flex items-center justify-center shadow-md hover:bg-emerald-500 transition"
            >
              <span className="text-sm font-bold">📷</span>
            </button>
          </div>
          <div className="text-center">
            <h1 className={`text-xl font-semibold ${colors.text.primary}`}>
              {user?.username || "Guest"}
            </h1>
            {user?.email && (
              <p className={`text-sm ${colors.text.tertiary} mt-1`}>
                {user.email}
              </p>
            )}
          </div>
        </div>
        {/* Profile Settings Card */}
        <div
          className={`w-full ${colors.card.bg} border ${colors.border.primary} rounded-xl p-6 max-w-md lg:max-w-2xl shadow-lg`}
        >
          <h2 className="text-sm font-semibold text-emerald-400 mb-4 tracking-wide">
            Profile Information
          </h2>
          <ProfileSettings />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
