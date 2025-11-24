# Iris Messenger Frontend

React + TypeScript + Vite client for Iris Messenger.

> Updated November 2025: In‑memory token store (sessionStorage fallback), aggregated last message previews (`/messages/last`), outgoing friend requests (`/friends/outgoing`), password change endpoint, sanitized rendering, expiry countdown and unread badge heuristics.

## Quick Start

```bash
# from front-end/

npm run dev
```

Set environment variables in `.env` (copy from `.env.example`):

```
VITE_API_URL=http://127.0.0.1:8000/api
VITE_PRESENCE_POLL_MS=30000
VITE_FRIENDS_POLL_MS=30000
VITE_CONVERSATION_REFETCH_ON_FOCUS=true
```

Backend should be running at the host defined by `VITE_API_URL`.

## Authentication
- Register at /register or login at /login.
- App routes live under /app/* and are protected.

## Profile Picture

- Navigate to /app/profile.
- Use "Upload New Picture" to pick an image. Constraints: image/* and <= 5MB.
- Use "Delete Picture" to remove your avatar.
- The avatar updates instantly; cache-busting is applied so you always see the latest image.

### Notes
- Client-side validation prevents non-image uploads and files larger than 5MB.
- Success and error toasts appear in the top-right.

## Troubleshooting
- If uploads fail, ensure backend supports:
  - POST /api/profile/picture (multipart form data, field name: `picture`)
  - DELETE /api/profile/picture
- Check your CORS configuration if requests are blocked.

## Tech Overview
- React Router v6 for routing
- TanStack Query v5 for server state (caching, polling, mutations)
- Zustand for UI state (toasts, modals)
- TailwindCSS for styling
- Axios for HTTP with auth interceptors
- Vitest + React Testing Library for unit testing

## Testing

Run tests with:

```bash
npm test           # Watch mode
npm run test:ui    # Vitest UI
npm run test:coverage  # With coverage report
```

Test files live in `src/test/` mirroring the feature structure.

## Accessibility

This app follows WCAG 2.1 AA guidelines:
- All interactive elements are keyboard accessible
- Proper ARIA labels and roles throughout
- Focus indicators visible on all interactive elements
- Form inputs properly associated with labels
- Screen reader friendly navigation and status updates

## Architecture

```
src/
  app/          - Router, providers, global layout (top navbar + mobile frame)
  features/     - Domain features (auth, friends, messages, profile)
  ui/           - Reusable primitives (Button, Input, Dialog, etc.)
  lib/          - Utilities (axios, tokenStore, sanitize)
  store/        - Zustand stores (uiStore for toasts)
  types/        - TypeScript types mirroring backend API
  pages/        - Top-level page components
  test/         - Unit tests
```

See `documents/FRONT_END_PLAN.md` for detailed architecture and implementation plan.

## Backend Endpoint Map (Current)

| Category | Endpoint | Notes |
|----------|----------|-------|
| Auth | `POST /api/auth/register` | Register + optional picture |
| Auth | `POST /api/auth/login` | Login (username + password) |
| Auth | `POST /api/auth/logout` | Invalidate token |
| Auth | `POST /api/auth/refresh` | Refresh JWT, updates presence |
| Auth | `POST /api/auth/password` | Change password (current,new) |
| User | `GET /api/me` | Current user profile |
| User | `GET /api/users/{username}` | Exact username lookup |
| User | `GET /api/users/id/{id}` | By numeric id |
| Profile | `PATCH /api/profile` | Update username/email |
| Profile | `POST /api/profile/picture` | Upload/replace picture (field: `profile_picture`) |
| Profile | `DELETE /api/profile/picture` | Remove picture |
| Friends | `GET /api/friends` | Accepted friends |
| Friends | `GET /api/friends/pending` | Incoming pending requests |
| Friends | `GET /api/friends/outgoing` | Outgoing requests you sent |
| Friends | `POST /api/friends/{id}` | Send request to user id |
| Friends | `POST /api/friends/{id}/accept` | Accept pending request |
| Friends | `DELETE /api/friends/{id}` | Reject/remove friendship |
| Messages | `GET /api/messages/last` | Aggregated last message per friend |
| Messages | `GET /api/messages/{receiver_id}` | Full thread (both directions) |
| Messages | `POST /api/messages/{receiver_id}` | Send (content/file/delete_after) |
| Messages | `DELETE /api/messages/{id}` | Sender delete |

All protected endpoints require `Authorization: Bearer <token>` header.

## Messaging Model & Ephemeral Logic

- Direct peer to peer; no conversation documents.
- Friend list previews built from `/messages/last` (eliminates N+1 queries).
- Optimistic send: bubble enters `sending` state, then `sent` or `failed`.
- Expiry: backend sets `expires_at` (from `delete_after` seconds). Frontend runs per‑message countdown and hides bubble instantly at zero.
- Unread heuristic (placeholder): pulse badge if last message sender != me and chat not active.

## Layout Overview

- Top navbar: avatar, brand, navigation, logout.
- Mobile-first frame (`max-w-[28rem]`) with dark emerald gradient.
- Friend list → active chat view; modal for adding friends.
- Accessible buttons with aria labels (timer, emoji, send).

## Security & Sanitization
- Token kept out of localStorage (memory + optional sessionStorage).
- `sanitize()` escapes `< >` on message content & previews at render.
- Rate limiting on send: `throttle:30,1` (backend route middleware).
- Attachments rendered only after successful upload.

## Presence & Status
- Derived from `last_online` timestamps: `online <5m`, `recent <60m`, `offline` else.
- Future: add `away (15-60m)` tier + tooltip with exact relative time.

## Planned Enhancements
- AddFriendModal UI overhaul (use backend outgoing list; richer tiles).
- Profile/password forms wired to `PATCH /api/profile` & `POST /api/auth/password`.
- Presence refinement & tooltip.
- Deprecated type cleanup (`types/api.ts`).
- Vitest + MSW test suite build‑out.
- Potential real‑time upgrade (WebSockets) for live updates.
