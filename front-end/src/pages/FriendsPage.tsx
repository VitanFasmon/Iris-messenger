import React, { useState } from "react";
import { FriendList } from "../features/friends/components/FriendList";
import { AddFriendModal } from "../features/friends/components/AddFriendModal";
import {
  useFriendRequests,
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from "../features/friends/hooks/useFriends";

export const FriendsPage: React.FC = () => {
  const [showAdd, setShowAdd] = useState(false);
  const { data: requests } = useFriendRequests();
  const accept = useAcceptFriendRequest();
  const reject = useRejectFriendRequest();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Friends</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-500"
        >
          Add Friend
        </button>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Pending Requests
        </h2>
        <div className="space-y-2">
          {requests && requests.length === 0 && (
            <div className="text-xs text-gray-500">No pending requests.</div>
          )}
          {requests?.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 p-2 rounded border border-gray-200 dark:border-gray-700"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  {r.from_username || r.from_user_id} ➜{" "}
                  {r.to_username || r.to_user_id}
                </p>
                <p className="text-xs text-gray-500">{r.status}</p>
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => accept.mutate(r.id)}
                    disabled={accept.isPending}
                    className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-500 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => reject.mutate(r.id)}
                    disabled={reject.isPending}
                    className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">
          All Friends
        </h2>
        <FriendList />
      </section>

      {showAdd && <AddFriendModal onClose={() => setShowAdd(false)} />}
    </div>
  );
};

export default FriendsPage;
