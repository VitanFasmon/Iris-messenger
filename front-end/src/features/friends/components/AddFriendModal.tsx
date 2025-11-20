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

  // Track an outgoing pending request discovered via API response
  const [outgoingPendingId, setOutgoingPendingId] = useState<
    string | number | null
  >(null);

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
        // If backend returns friendship object, detect pending and store id
        const fid = res?.friendship?.id ?? res?.id ?? null;
        const status = res?.friendship?.status ?? res?.status ?? null;
        if (status === "pending" && fid) {
          setOutgoingPendingId(fid);
        } else {
          setQuery("");
        }
      },
      onError: (err: any) => {
        // Handle case: Friend request already exists with status pending
        const data = err?.response?.data;
        const status = data?.status;
        const fid =
          data?.friendship?.id ?? data?.id ?? data?.friendship_id ?? null;
        if (status === "pending" && fid) {
          setOutgoingPendingId(fid);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-card text-card-foreground border border-border shadow-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Add Friend</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-muted-foreground hover:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded"
          >
            ✕
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter username"
          className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="text-xs text-muted-foreground">
          Type at least 2 characters.
        </div>
        <div className="space-y-3">
          {lookup.isLoading && (
            <div className="text-sm text-muted-foreground">Searching…</div>
          )}
          {lookup.error && (
            <div className="text-sm text-destructive">Search failed.</div>
          )}
          {lookup.data === null && query.length > 1 && !lookup.isLoading && (
            <div className="text-sm text-muted-foreground">No user found.</div>
          )}
          {lookup.data && (
            <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-background shadow-sm">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                {lookup.data.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {lookup.data.username}
                </p>
                {lookup.data.last_online && (
                  <p className="text-[10px] text-muted-foreground">
                    Last online:{" "}
                    {new Date(lookup.data.last_online).toLocaleString()}
                  </p>
                )}
              </div>
              {/* If there's an incoming pending from this user, offer Accept/Reject */}
              {incomingForUser ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => accept.mutate(incomingForUser.id)}
                    disabled={accept.isPending}
                    className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => cancel.mutate(incomingForUser.id)}
                    disabled={cancel.isPending}
                    className="inline-flex items-center justify-center rounded-md bg-destructive text-white hover:bg-destructive/90 px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Reject
                  </button>
                </div>
              ) : outgoingPendingId ? (
                <button
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate(outgoingPendingId)}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-muted text-foreground hover:bg-muted/80 px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {cancel.isPending ? "..." : "Cancel"}
                </button>
              ) : (
                <button
                  disabled={sendReq.isPending}
                  onClick={handleSend}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {sendReq.isPending ? "..." : "Add"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
