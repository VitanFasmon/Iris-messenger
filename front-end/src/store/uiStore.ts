import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ToastMsg {
  id: string;
  type: "info" | "success" | "error";
  message: string;
}

export type Theme = "light" | "dark";

interface UiState {
  addFriendOpen: boolean;
  setAddFriendOpen: (v: boolean) => void;
  toastQueue: ToastMsg[];
  pushToast: (m: Omit<ToastMsg, "id">) => void;
  removeToast: (id: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      addFriendOpen: false,
      setAddFriendOpen: (v) => set({ addFriendOpen: v }),
      toastQueue: [],
      pushToast: (m) =>
        set((s) => ({
          toastQueue: [...s.toastQueue, { ...m, id: crypto.randomUUID() }],
        })),
      removeToast: (id) =>
        set((s) => ({ toastQueue: s.toastQueue.filter((t) => t.id !== id) })),
      theme: "dark",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "iris-ui-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
