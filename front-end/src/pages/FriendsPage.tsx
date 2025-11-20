import React, { useState } from "react";
import { FriendList } from "../features/friends/components/FriendList";
import { AddFriendModal } from "../features/friends/components/AddFriendModal";
import {
  useFriendRequests,
  useAcceptFriendRequest,
  useRejectOrRemoveFriendship,
} from "../features/friends/hooks/useFriends";

export const FriendsPage: React.FC = () => {
  const [showAdd, setShowAdd] = useState(false);
  const { data: requests } = useFriendRequests();
  const accept = useAcceptFriendRequest();
  const reject = useRejectOrRemoveFriendship();

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Friends</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Add Friend
          </button>
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Pending Requests
          </h2>
          <div className="space-y-3">
            {requests && requests.length === 0 && (
              <div className="text-sm text-muted-foreground bg-muted rounded-md p-4">
                No pending requests.
              </div>
            )}
            {requests?.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-4 p-4 rounded-md border border-border bg-card shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Incoming request from {r.user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sent {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => accept.mutate(r.id)}
                    disabled={accept.isPending}
                    className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => reject.mutate(r.id)}
                    disabled={reject.isPending}
                    className="inline-flex items-center justify-center rounded-md bg-destructive text-white hover:bg-destructive/90 px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            All Friends
          </h2>
          <FriendList />
        </section>

        {showAdd && <AddFriendModal onClose={() => setShowAdd(false)} />}
      </div>
    </div>
  );
};

export default FriendsPage;
