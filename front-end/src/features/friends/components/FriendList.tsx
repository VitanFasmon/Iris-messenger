import React from "react";
import { useFriends } from "../hooks/useFriends";
import { usePresencePolling } from "../../presence/hooks/usePresencePolling";
import { useNavigate } from "react-router-dom";

interface Props {
  compact?: boolean;
}

export const FriendList: React.FC<Props> = ({ compact }) => {
  const { data: friends, isLoading, error } = useFriends();
  const { data: presence } = usePresencePolling(20_000);
  const navigate = useNavigate();

  if (isLoading)
    return <div className="p-4 text-sm text-gray-500">Loading friends...</div>;
  if (error)
    return (
      <div className="p-4 text-sm text-red-600">Failed to load friends.</div>
    );
  if (!friends || friends.length === 0)
    return <div className="p-4 text-sm text-gray-500">No friends yet.</div>;

  // Merge presence onto friends list by id
  const presenceMap = new Map(presence?.map((p) => [p.id, p.status]));

  return (
    <ul
      className={compact ? "space-y-1" : "space-y-2"}
      role="list"
      aria-label="Friends list"
    >
      {friends.map((f) => {
        const status = presenceMap.get(f.id) || "offline";
        return (
          <li
            key={f.id}
            className="flex items-center gap-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 p-2 cursor-pointer"
            onClick={() => navigate(`/app/chat/${f.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/app/chat/${f.id}`);
              }
            }}
            tabIndex={0}
          >
            <div className="relative w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              {f.profile_picture_url ? (
                <img
                  src={f.profile_picture_url}
                  alt={`${f.username}'s profile picture`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="w-full h-full flex items-center justify-center text-xs text-gray-600"
                  aria-hidden="true"
                >
                  {f.username[0].toUpperCase()}
                </span>
              )}
              <span
                className={
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white dark:border-gray-900 " +
                  (status === "online"
                    ? "bg-green-500"
                    : status === "recent"
                    ? "bg-yellow-500"
                    : "bg-gray-400")
                }
                aria-label={`Status: ${status}`}
                role="status"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{f.username}</p>
              {status !== "offline" && (
                <p className="text-xs text-gray-500">
                  {status === "online" ? "Online now" : "Recently active"}
                </p>
              )}
            </div>
            {/* Future: context menu / actions */}
          </li>
        );
      })}
    </ul>
  );
};
