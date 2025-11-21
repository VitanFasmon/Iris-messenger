import React, { useMemo, useState } from "react";
import {
  useUserLookup,
  useSendFriendRequest,
  useFriendRequests,
  useAcceptFriendRequest,
  useRejectOrRemoveFriendship,
} from "../hooks/useFriends";

interface Props {
  onClose: () => void;
}

export const AddFriendModal: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const lookup = useUserLookup(query);
  const sendReq = useSendFriendRequest();
  const { data: incoming } = useFriendRequests();
  const accept = useAcceptFriendRequest();
  const cancel = useRejectOrRemoveFriendship();

  // Track outgoing requests (local accumulation). Backend returns only incoming; we infer outgoing from send responses & duplicates.
  const [outgoingMap, setOutgoingMap] = useState<
    Record<string | number, number | string>
  >({});
  const outgoingList = Object.entries(outgoingMap).map(
    ([userId, friendshipId]) => ({ userId, friendshipId })
  );

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
      onSuccess: (res: any) => {
        const fid = res?.friendship?.id ?? res?.id ?? null;
        const status = res?.friendship?.status ?? res?.status ?? null;
        if (status === "pending" && fid) {
          setOutgoingMap((m) => ({ ...m, [lookup.data!.id]: fid }));
        } else {
          setQuery("");
        }
      },
      onError: (err: any) => {
        const data = err?.response?.data;
        const status = data?.status;
        const fid =
          data?.friendship?.id ?? data?.id ?? data?.friendship_id ?? null;
        if (status === "pending" && fid) {
          setOutgoingMap((m) => ({ ...m, [lookup.data!.id]: fid }));
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md max-h-[90vh] bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg text-white font-semibold">Add Friend</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <label className="text-gray-300 text-sm">Search by username</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username..."
              className="w-full rounded bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700">
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
                        {new Date(lookup.data.last_online).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {incomingForUser ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => accept.mutate(incomingForUser.id)}
                        disabled={accept.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs rounded disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => cancel.mutate(incomingForUser.id)}
                        disabled={cancel.isPending}
                        className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 px-3 py-1.5 text-xs rounded disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : outgoingMap[lookup.data.id] ? (
                    <button
                      disabled={cancel.isPending}
                      onClick={() => {
                        const fid = outgoingMap[lookup.data!.id];
                        cancel.mutate(fid as any, {
                          onSuccess: () =>
                            setOutgoingMap((m) => {
                              const copy = { ...m };
                              delete copy[lookup.data!.id];
                              return copy;
                            }),
                        });
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 text-xs rounded disabled:opacity-50"
                    >
                      {cancel.isPending ? "..." : "Cancel"}
                    </button>
                  ) : (
                    <button
                      disabled={sendReq.isPending}
                      onClick={handleSend}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs rounded disabled:opacity-50"
                    >
                      {sendReq.isPending ? "..." : "Add"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pending Requests */}
          {(incoming && incoming.length > 0) || outgoingList.length > 0 ? (
            <div className="space-y-6">
              {incoming && incoming.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-gray-300 text-sm font-medium">
                    Incoming Requests ({incoming.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {incoming.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300">
                          {r.user.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">
                            {r.user.username}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Sent {new Date(r.created_at).toLocaleDateString()}
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
              {outgoingList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-gray-300 text-sm font-medium">
                    Sent Requests ({outgoingList.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {outgoingList.map((o) => (
                      <div
                        key={o.friendshipId}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300">
                          {String(o.userId)[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">
                            User ID {o.userId}
                          </p>
                          <p className="text-[10px] text-gray-400">Pending</p>
                        </div>
                        <button
                          disabled={cancel.isPending}
                          onClick={() => {
                            cancel.mutate(o.friendshipId as any, {
                              onSuccess: () =>
                                setOutgoingMap((m) => {
                                  const copy = { ...m };
                                  delete copy[o.userId];
                                  return copy;
                                }),
                            });
                          }}
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
