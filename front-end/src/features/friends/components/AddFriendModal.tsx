import React, { useState } from "react";
import { useUserSearch, useSendFriendRequest } from "../hooks/useFriends";

interface Props {
  onClose: () => void;
}

export const AddFriendModal: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const search = useUserSearch(query);
  const sendReq = useSendFriendRequest();

  const handleSend = (username: string) => {
    sendReq.mutate({ username }, { onSuccess: () => setQuery("") });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-900 shadow p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Add Friend</h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search username"
          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
        />
        <div className="text-xs text-gray-500">
          Type at least 2 characters to search.
        </div>
        <div className="max-h-56 overflow-y-auto space-y-2">
          {search.isLoading && <div className="text-sm">Searching...</div>}
          {search.error && (
            <div className="text-sm text-red-600">Search failed.</div>
          )}
          {search.data && search.data.length === 0 && query.length > 1 && (
            <div className="text-sm text-gray-500">No users found.</div>
          )}
          {search.data?.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-2 rounded border border-gray-200 dark:border-gray-700"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                {user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.username}</p>
              </div>
              <button
                disabled={sendReq.isPending}
                onClick={() => handleSend(user.username)}
                className="text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {sendReq.isPending ? "..." : "Add"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
