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
import { useTheme } from "../../../hooks/useTheme";

interface Props {
  onClose: () => void;
}

export const AddFriendModal: React.FC<Props> = ({ onClose }) => {
  const { colors, theme } = useTheme();
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
      <div
        className={`w-full max-w-md lg:max-w-lg max-h-[90vh] ${colors.bg.primary} border ${colors.border.primary} rounded-xl shadow-2xl overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${colors.border.primary} ${colors.bg.primary}`}
        >
          <h2
            className={`text-base ${colors.text.primary} font-semibold tracking-wide`}
          >
            Add Friend
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
              theme === "light"
                ? `${colors.text.tertiary} ${colors.bg.hover} hover:bg-gray-200`
                : `${colors.text.tertiary} ${colors.bg.hover} hover:text-white`
            }`}
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Search Section */}
          <div className="space-y-3">
            <label
              className={`${colors.text.secondary} text-xs uppercase tracking-wide`}
            >
              Search by username
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username..."
              className={`w-full rounded-lg ${colors.input.bg} border ${colors.input.border} ${colors.input.text} ${colors.input.placeholder} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            />
            <div className="space-y-2">
              {lookup.isLoading && (
                <div className={`text-sm ${colors.text.tertiary}`}>
                  Searching…
                </div>
              )}
              {lookup.error && (
                <div className="text-sm text-red-400">Search failed.</div>
              )}
              {lookup.data === null &&
                query.length > 1 &&
                !lookup.isLoading && (
                  <div className={`text-sm ${colors.text.tertiary}`}>
                    No user found.
                  </div>
                )}
              {lookup.data && (
                <div
                  className={`flex flex-wrap items-center gap-3 p-4 rounded-lg ${colors.card.bg} border ${colors.border.secondary}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full ${colors.avatar.bg} overflow-hidden shrink-0`}
                  >
                    {lookup.data.profile_picture_url ? (
                      <img
                        src={lookup.data.profile_picture_url}
                        alt={`${lookup.data.username}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className={`w-full h-full flex items-center justify-center text-xs font-medium ${colors.avatar.text}`}
                      >
                        {lookup.data.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${colors.text.primary}`}
                    >
                      {lookup.data.username}
                    </p>
                    {lookup.data.last_online && (
                      <p className={`text-[10px] ${colors.text.tertiary}`}>
                        Last online:{" "}
                        {timeAgo(new Date(lookup.data.last_online).getTime())}{" "}
                        ago
                      </p>
                    )}
                  </div>
                  {incomingForUser ? (
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
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
                        className={`bg-transparent border ${colors.border.secondary} ${colors.text.secondary} ${colors.bg.hover} px-3 py-1.5 text-xs rounded-lg disabled:opacity-50`}
                      >
                        Reject
                      </button>
                    </div>
                  ) : outgoing?.some(
                      (o) => String(o.user.id) === String(lookup.data!.id)
                    ) ? (
                    <button
                      disabled
                      className={`bg-gray-700 ${colors.text.secondary} px-3 py-1.5 text-xs rounded-lg cursor-not-allowed`}
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
                  <h3
                    className={`${colors.text.secondary} text-xs uppercase tracking-wide font-medium`}
                  >
                    Incoming Requests{" "}
                    <span className={`${colors.text.muted}`}>
                      ({incoming.length})
                    </span>
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {incoming.map((r) => (
                      <div
                        key={r.id}
                        className={`flex flex-wrap items-center gap-3 p-3 rounded-lg ${colors.card.bg} border ${colors.border.secondary}`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full ${colors.avatar.bg} overflow-hidden shrink-0`}
                        >
                          {r.user.profile_picture_url ? (
                            <img
                              src={r.user.profile_picture_url}
                              alt={`${r.user.username}'s avatar`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span
                              className={`w-full h-full flex items-center justify-center text-xs font-medium ${colors.avatar.text}`}
                            >
                              {r.user.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${colors.text.primary}`}
                          >
                            {r.user.username}
                          </p>
                          <p className={`text-[10px] ${colors.text.tertiary}`}>
                            Sent {timeAgo(new Date(r.created_at).getTime())} ago
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
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
                            className={`bg-transparent border ${colors.border.secondary} ${colors.text.secondary} ${colors.bg.hover} text-xs h-8 px-3 rounded`}
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
                  <h3
                    className={`${colors.text.secondary} text-xs uppercase tracking-wide font-medium`}
                  >
                    Sent Requests{" "}
                    <span className={`${colors.text.muted}`}>
                      ({outgoing.length})
                    </span>
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {outgoing.map((o) => (
                      <div
                        key={o.id}
                        className={`flex flex-wrap items-center gap-3 p-3 rounded-lg ${colors.card.bg} border ${colors.border.secondary}`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full ${colors.avatar.bg} overflow-hidden shrink-0`}
                        >
                          {o.user.profile_picture_url ? (
                            <img
                              src={o.user.profile_picture_url}
                              alt={`${o.user.username}'s avatar`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span
                              className={`w-full h-full flex items-center justify-center text-xs font-medium ${colors.avatar.text}`}
                            >
                              {o.user.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${colors.text.primary}`}
                          >
                            {o.user.username}
                          </p>
                          <p className={`text-[10px] ${colors.text.tertiary}`}>
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
