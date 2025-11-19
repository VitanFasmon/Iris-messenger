import { create } from "zustand";

export interface ToastMsg {
  id: string;
  type: "info" | "success" | "error";
  message: string;
}

interface UiState {
  addFriendOpen: boolean;
  setAddFriendOpen: (v: boolean) => void;
  toastQueue: ToastMsg[];
  pushToast: (m: Omit<ToastMsg, "id">) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  addFriendOpen: false,
  setAddFriendOpen: (v) => set({ addFriendOpen: v }),
  toastQueue: [],
  pushToast: (m) =>
    set((s) => ({
      toastQueue: [...s.toastQueue, { ...m, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((s) => ({ toastQueue: s.toastQueue.filter((t) => t.id !== id) })),
}));
