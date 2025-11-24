// Relative time utility (e.g., 2m, 5h, 3d)
export function timeAgo(ts: string | number | Date): string {
  const date = ts instanceof Date ? ts : new Date(ts);
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "now";
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return sec + "s";
  const min = Math.floor(sec / 60);
  if (min < 60) return min + "m";
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + "h";
  const day = Math.floor(hr / 24);
  if (day < 7) return day + "d";
  const wk = Math.floor(day / 7);
  if (wk < 4) return wk + "w";
  const mo = Math.floor(day / 30);
  if (mo < 12) return mo + "mo";
  const yr = Math.floor(day / 365);
  return yr + "y";
}

export function formatPresenceStatus(lastOnline: string | null): string {
  if (!lastOnline) return "Offline";
  const diffMs = Date.now() - new Date(lastOnline).getTime();
  const min = diffMs / 60000;
  if (min < 5) return "Active now";
  if (min < 60) return "Active " + Math.floor(min) + "m ago";
  if (min < 60 * 24) return "Active " + Math.floor(min / 60) + "h ago";
  return "Active " + Math.floor(min / 60 / 24) + "d ago";
}
