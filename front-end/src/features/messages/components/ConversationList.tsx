import React from "react";
import { useConversations } from "../hooks/useMessages";

interface Props {
  activeId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<Props> = ({ activeId, onSelect }) => {
  const { data, isLoading, error } = useConversations();

  if (isLoading)
    return (
      <div className="p-2 text-xs text-gray-500">Loading conversations...</div>
    );
  if (error)
    return (
      <div className="p-2 text-xs text-red-600">
        Failed to load conversations.
      </div>
    );
  if (!data || data.length === 0)
    return (
      <div className="p-2 text-xs text-gray-500">No conversations yet.</div>
    );

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-800">
      {data.map((c) => (
        <li
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
            activeId === c.id ? "bg-indigo-50 dark:bg-indigo-900/30" : ""
          }`}
        >
          <p className="text-sm font-medium truncate">
            {c.title || "Conversation"}
          </p>
          {c.last_message_preview && (
            <p className="text-xs text-gray-500 truncate">
              {c.last_message_preview}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};
