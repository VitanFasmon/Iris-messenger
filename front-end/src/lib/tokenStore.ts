// Token storage strategy:
// 1. Keep token in memory for runtime safety against XSS.
// 2. Optional persistence using sessionStorage (opt-in) so a single tab reload preserves auth.
//    This avoids long-lived localStorage exposure while giving better UX than pure memory.
// 3. Never write to localStorage (plan recommendation).

const MEMORY: { token: string | null } = { token: null };
const SESSION_KEY = "iris_access_token";

let useSessionPersistence = true; // could be toggled via env or config later

export function setAccessToken(t: string) {
  MEMORY.token = t;
  if (useSessionPersistence) {
    try {
      sessionStorage.setItem(SESSION_KEY, t);
    } catch (_) {
      // ignore (private mode or disabled)
    }
  }
}

export function getAccessToken(): string | null {
  if (MEMORY.token) return MEMORY.token;
  if (useSessionPersistence) {
    try {
      const s = sessionStorage.getItem(SESSION_KEY);
      if (s) {
        MEMORY.token = s; // hydrate memory once
        return s;
      }
    } catch (_) {
      return null;
    }
  }
  return null;
}

export function clearAccessToken() {
  MEMORY.token = null;
  if (useSessionPersistence) {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {
      // ignore
    }
  }
}

// Optional helper to disable persistence (future feature)
export function setSessionPersistence(enabled: boolean) {
  useSessionPersistence = enabled;
  if (!enabled) {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
  }
}
