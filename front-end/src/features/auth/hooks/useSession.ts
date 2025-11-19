import { useQuery } from "@tanstack/react-query";
import { meApi } from "../api/auth";
import { getAccessToken } from "../../../lib/tokenStore";
import type { User } from "../../../types/api";

// Provides persisted user session info if token exists.
export function useSession() {
  const token = getAccessToken();
  const query = useQuery<User | null>({
    queryKey: ["me"],
    queryFn: async () => {
      if (!token) return null;
      try {
        return await meApi();
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
    enabled: !!token,
  });
  return query;
}
