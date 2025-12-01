import React from "react";
import { useFriends } from "../../friends/hooks/useFriends";
import { useUnreadCounts } from "../hooks/useUnreadCounts";

interface Props {
  activeId: string | number | null;
  onSelect: (id: string | number) => void;
}

// Replaces old ConversationList by listing friends. Selecting a friend sets receiverId.
export const ConversationList: React.FC<Props> = ({ activeId, onSelect }) => {
  const { data: friends, isLoading, error } = useFriends();
  const { data: unreadCounts } = useUnreadCounts();

  if (isLoading)
    return <div className="p-2 text-xs text-gray-500">Loading friends...</div>;
  if (error)
    return (
      <div className="p-2 text-xs text-red-600">Failed to load friends.</div>
    );
  if (!friends || friends.length === 0)
    return <div className="p-2 text-xs text-gray-500">No friends yet.</div>;

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-800" role="list">
      {friends.map((f) => {
        const unreadCount = unreadCounts?.[String(f.id)] || 0;
        return (
          <li key={f.id}>
            <button
              onClick={() => onSelect(f.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(f.id);
                }
              }}
              aria-current={activeId === f.id ? "true" : undefined}
              className={`w-full text-left p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                activeId === f.id ? "bg-indigo-50 dark:bg-indigo-900/30" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.username}</p>
                  {f.last_online && (
                    <p className="text-xs text-gray-500 truncate">
                      Last online:{" "}
                      {new Date(f.last_online).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
