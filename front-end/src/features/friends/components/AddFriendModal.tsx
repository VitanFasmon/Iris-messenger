import React, { useMemo, useState } from "react";
import {
  useUserLookup,
  useSendFriendRequest,
  useFriendRequests,
  useAcceptFriendRequest,
  useRejectOrRemoveFriendship,
  useOutgoingFriendRequests,
} from "../hooks/useFriends";
import { timeAgo } from "../../../lib/time";

interface Props {
  onClose: () => void;
}

export const AddFriendModal: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const lookup = useUserLookup(query);
  const sendReq = useSendFriendRequest();
  const { data: incoming } = useFriendRequests();
  const { data: outgoing } = useOutgoingFriendRequests();
  const accept = useAcceptFriendRequest();
  const cancel = useRejectOrRemoveFriendship();

  // Remove local outgoing map; rely on backend outgoing list for accuracy.

  // If there's an incoming pending from this user, prefer that flow
  const incomingForUser = useMemo(() => {
    if (!lookup.data || !incoming) return null;
    return (
      incoming.find((r) => String(r.user.id) === String(lookup.data!.id)) ||
      null
    );
  }, [lookup.data, incoming]);

  const handleSend = () => {
    if (!lookup.data) return;
    sendReq.mutate(lookup.data.id, {
      onSuccess: () => {
        setQuery("");
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md lg:max-w-lg max-h-[90vh] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/60">
          <h2 className="text-base text-white font-semibold tracking-wide">
            Add Friend
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Search Section */}
          <div className="space-y-3">
            <label className="text-gray-300 text-xs uppercase tracking-wide">
              Search by username
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username..."
              className="w-full rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder:text-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="space-y-2">
              {lookup.isLoading && (
                <div className="text-sm text-gray-400">Searching…</div>
              )}
              {lookup.error && (
                <div className="text-sm text-red-400">Search failed.</div>
              )}
              {lookup.data === null &&
                query.length > 1 &&
                !lookup.isLoading && (
                  <div className="text-sm text-gray-400">No user found.</div>
                )}
              {lookup.data && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/70 border border-gray-700">
                  <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300">
                    {lookup.data.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white">
                      {lookup.data.username}
                    </p>
                    {lookup.data.last_online && (
                      <p className="text-[10px] text-gray-400">
                        Last online:{" "}
                        {timeAgo(new Date(lookup.data.last_online).getTime())}{" "}
                        ago
                      </p>
                    )}
                  </div>
                  {incomingForUser ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => accept.mutate(incomingForUser.id)}
                        disabled={accept.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs rounded-lg disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => cancel.mutate(incomingForUser.id)}
                        disabled={cancel.isPending}
                        className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 px-3 py-1.5 text-xs rounded-lg disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : outgoing?.some(
                      (o) => String(o.user.id) === String(lookup.data!.id)
                    ) ? (
                    <button
                      disabled
                      className="bg-gray-700 text-gray-300 px-3 py-1.5 text-xs rounded-lg cursor-not-allowed"
                    >
                      Pending
                    </button>
                  ) : (
                    <button
                      disabled={sendReq.isPending}
                      onClick={handleSend}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs rounded-lg disabled:opacity-50 w-24"
                    >
                      {sendReq.isPending ? "..." : "Add"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pending Requests */}
          {(incoming && incoming.length > 0) ||
          (outgoing && outgoing.length > 0) ? (
            <div className="space-y-6">
              {incoming && incoming.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-gray-300 text-xs uppercase tracking-wide font-medium">
                    Incoming Requests{" "}
                    <span className="text-gray-500">({incoming.length})</span>
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {incoming.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/60 border border-gray-700"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300">
                          {r.user.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">
                            {r.user.username}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Sent {timeAgo(new Date(r.created_at).getTime())} ago
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => accept.mutate(r.id)}
                            disabled={accept.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 rounded"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => cancel.mutate(r.id)}
                            disabled={cancel.isPending}
                            className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 text-xs h-8 px-3 rounded"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {outgoing && outgoing.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-gray-300 text-xs uppercase tracking-wide font-medium">
                    Sent Requests{" "}
                    <span className="text-gray-500">({outgoing.length})</span>
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {outgoing.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/60 border border-gray-700"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300">
                          {o.user.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">
                            {o.user.username}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Sent {timeAgo(new Date(o.created_at).getTime())} ago
                          </p>
                        </div>
                        <button
                          disabled={cancel.isPending}
                          onClick={() => cancel.mutate(o.id)}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 text-xs rounded disabled:opacity-50"
                        >
                          {cancel.isPending ? "..." : "Cancel"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
