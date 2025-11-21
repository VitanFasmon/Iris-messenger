import React, { useEffect, useState } from "react";
import { MessageList } from "../features/messages/components/MessageList";
import { SendMessageForm } from "../features/messages/components/SendMessageForm";
import { useParams, useNavigate } from "react-router-dom";
import {
  useFriends,
  useFriendRequests,
  useAcceptFriendRequest,
  useRejectOrRemoveFriendship,
} from "../features/friends/hooks/useFriends";
import { usePresencePolling } from "../features/presence/hooks/usePresencePolling";
import { Search, UserPlus, ArrowLeft, Clock, MoreVertical } from "lucide-react";
import { AddFriendModal } from "../features/friends/components/AddFriendModal";
import { useDirectMessages } from "../features/messages/hooks/useMessages";

const ChatsPage: React.FC = () => {
  const [activeReceiverId, setActiveReceiverId] = useState<
    string | number | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: friends } = useFriends();
  const { data: presence } = usePresencePolling(20_000);
  const { data: requests } = useFriendRequests();
  const accept = useAcceptFriendRequest();
  const removeOrReject = useRejectOrRemoveFriendship();
  const [showMenu, setShowMenu] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    if (id) setActiveReceiverId(id);
    else setActiveReceiverId(null);
  }, [id]);

  const presenceMap = new Map(presence?.map((p) => [p.id, p.status]));

  // Build enhanced & sorted friend list with last message preview.
  const enhancedFriends = (friends || []).map((f) => {
    const { data: msgs } = useDirectMessages(f.id);
    const last = msgs?.[msgs.length - 1];
    return {
      ...f,
      lastMessageText: last?.content || null,
      lastMessageAt: last?.timestamp
        ? new Date(last.timestamp).getTime()
        : f.last_online
        ? new Date(f.last_online).getTime()
        : 0,
    };
  });

  const filteredFriends = enhancedFriends
    .filter((f) => f.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.lastMessageAt - a.lastMessageAt);

  const handleSelectFriend = (friendId: string | number) => {
    navigate(`/app/chat/${friendId}`);
  };

  const activeFriend =
    activeReceiverId != null
      ? friends?.find((f) => String(f.id) === String(activeReceiverId))
      : null;

  const activeStatus = activeFriend
    ? presenceMap.get(activeFriend.id) || "offline"
    : "offline";

  const handleBackToList = () => {
    navigate("/app");
    setShowMenu(false);
  };

  if (activeFriend && activeReceiverId) {
    return (
      <div className="flex flex-col h-full bg-gray-950">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 relative">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="w-10 h-10 flex items-center justify-center rounded-full text-emerald-400 hover:text-emerald-300 hover:bg-gray-800"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative w-10 h-10 rounded-full bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
              {activeFriend.profile_picture_url ? (
                <img
                  src={activeFriend.profile_picture_url}
                  alt={`${activeFriend.username}'s avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  {activeFriend.username[0].toUpperCase()}
                </span>
              )}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-950 ${
                  activeStatus === "online"
                    ? "bg-green-500"
                    : activeStatus === "recent"
                    ? "bg-yellow-500"
                    : "bg-gray-500"
                }`}
              />
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {activeFriend.username}
              </p>
              <p className="text-xs text-gray-400">
                {activeStatus === "online"
                  ? "Active now"
                  : activeStatus === "recent"
                  ? "Away"
                  : "Offline"}
              </p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu((m) => !m)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
              aria-label="Chat menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-12 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-40 text-sm z-20">
                <button
                  onClick={() => {
                    setConfirmRemove(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 text-red-300"
                >
                  Remove friend
                </button>
              </div>
            )}
          </div>
          {confirmRemove && (
            <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-30">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-64 space-y-4">
                <p className="text-sm text-white">
                  Remove{" "}
                  <span className="font-semibold">{activeFriend.username}</span>
                  ? This will delete them from your list.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setConfirmRemove(false)}
                    className="px-3 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      removeOrReject.mutate(activeFriend.id);
                      setConfirmRemove(false);
                      navigate("/app");
                    }}
                    disabled={removeOrReject.isPending}
                    className="px-3 py-1 rounded text-xs bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
                  >
                    {removeOrReject.isPending ? "Removing" : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <MessageList receiverId={activeReceiverId} />
        </div>
        {/* Input Area */}
        <div className="border-t border-gray-800">
          <SendMessageForm receiverId={activeReceiverId} />
        </div>
      </div>
    );
  }

  // Otherwise show friends list view
  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header with search and Add Friend */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <button
            onClick={() => setShowAddFriend(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-emerald-400 hover:text-emerald-300 hover:bg-gray-800"
            aria-label="Add friend"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full rounded-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Pending Requests Section */}
      {requests && requests.length > 0 && (
        <div className="border-b border-gray-800 bg-emerald-950/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm text-emerald-400">
              Pending Requests ({requests.length})
            </h3>
          </div>
          <div className="space-y-2">
            {requests.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-3"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                  {r.user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{r.user.username}</p>
                  <p className="text-xs text-gray-400">Friend request</p>
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
                    onClick={() => removeOrReject.mutate(r.id)}
                    disabled={removeOrReject.isPending}
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

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto">
        {filteredFriends.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No friends yet.</div>
        ) : (
          <ul>
            {filteredFriends.map((f) => {
              const status = presenceMap.get(f.id) || "offline";
              return (
                <li key={f.id}>
                  <button
                    onClick={() => handleSelectFriend(f.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-800 border-b border-gray-800"
                  >
                    <div className="relative w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                      {f.profile_picture_url ? (
                        <img
                          src={f.profile_picture_url}
                          alt={`${f.username}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                          {f.username[0].toUpperCase()}
                        </span>
                      )}
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${
                          status === "online"
                            ? "bg-green-500"
                            : status === "recent"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white truncate">{f.username}</p>
                        {f.lastMessageAt > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(f.lastMessageAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {f.lastMessageText || "No messages yet"}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showAddFriend && (
        <AddFriendModal onClose={() => setShowAddFriend(false)} />
      )}
    </div>
  );
};

export default ChatsPage;
