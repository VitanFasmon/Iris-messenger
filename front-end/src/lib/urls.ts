/**
 * Convert relative storage URLs from backend to absolute URLs
 * Backend returns URLs like "/storage/uploads/..." which need to be prefixed with backend URL
 */
export function getFullUrl(
  relativeUrl: string | null | undefined
): string | null {
  if (!relativeUrl) return null;

  // If already absolute, return as-is
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }

  // Get base API URL and remove /api suffix
  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  const baseUrl = apiUrl.replace(/\/api\/?$/, "");

  // Remove leading slash from relative URL if present
  const path = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;

  return `${baseUrl}${path}`;
}
