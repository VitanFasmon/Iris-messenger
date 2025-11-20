import React from "react";
import { useFriends } from "../../friends/hooks/useFriends";

interface Props {
  activeId: string | number | null;
  onSelect: (id: string | number) => void;
}

// Replaces old ConversationList by listing friends. Selecting a friend sets receiverId.
export const ConversationList: React.FC<Props> = ({ activeId, onSelect }) => {
  const { data: friends, isLoading, error } = useFriends();

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
      {friends.map((f) => (
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
            <p className="text-sm font-medium truncate">{f.username}</p>
            {f.last_online && (
              <p className="text-xs text-gray-500 truncate">
                Last online: {new Date(f.last_online).toLocaleDateString()}
              </p>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};
