import { useQuery } from "@tanstack/react-query";
import { fetchLastMessages, type LastMessageEntry } from "../api/messages";

const LAST_MESSAGES_KEY = ["lastMessages"];

export function useLastMessages() {
  return useQuery<LastMessageEntry[]>({
    queryKey: LAST_MESSAGES_KEY,
    queryFn: fetchLastMessages,
    staleTime: 15_000,
    refetchInterval: 45_000,
  });
}
