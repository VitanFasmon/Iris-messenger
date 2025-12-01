// Centralized query key factories
export const queryKeys = {
  user: ["user"],
  friends: ["friends"],
  friendRequests: ["friendRequests"],
  friendRequestsOutgoing: ["friendRequestsOutgoing"],
  lastMessages: ["lastMessages"],
  presence: ["presence"],
  directMessages: (id: string | number) => ["directMessages", id],
  directMessagesInfinite: (id: string | number) => [
    "directMessagesInfinite",
    id,
  ],
};
