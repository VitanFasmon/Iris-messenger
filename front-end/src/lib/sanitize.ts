export function sanitize(raw: string) {
  return raw.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
