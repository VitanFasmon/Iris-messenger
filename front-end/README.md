# Iris Messenger Frontend

React + TypeScript + Vite client for Iris Messenger.

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

## Backend Endpoints

**Auth**
- `POST /api/register` – Register new user (username, email, password)
- `POST /api/login` – Login (username/email + password) → returns JWT token
- `POST /api/logout` – Logout (invalidates token if applicable)
- `POST /api/refresh` – Refresh JWT token

**Users**
- `GET /api/users/{username}` – Lookup single user by exact username

**Friends**
- `GET /api/friends` – List accepted friends
- `GET /api/friends/pending` – List incoming pending requests
- `POST /api/friends/{userId}` – Send friend request to user by ID
- `POST /api/friends/{friendshipId}/accept` – Accept pending request
- `DELETE /api/friends/{friendshipId}` – Reject pending request or remove friendship

**Messages** (direct user-to-user)
- `GET /api/messages/{receiverId}` – Fetch all messages exchanged with given user
- `POST /api/messages/{receiverId}` – Send message to user (content, file, delete_after)
- `DELETE /api/messages/{messageId}` – Delete message by id

**Profile**
- `GET /api/profile/me` – Current user profile
- `PUT /api/profile` – Update username/email
- `POST /api/profile/picture` – Upload profile picture (multipart, field: `picture`)
- `DELETE /api/profile/picture` – Remove profile picture

All endpoints (except auth) require `Authorization: Bearer <token>` header.

## Messaging Model

- No backend conversation abstraction; messages are direct peer-to-peer between users.
- Frontend derives "conversations" from friends list and displays messages for selected receiverId.
- Optimistic sending: message appears immediately with `localStatus: "sending"`, updates on success/failure.
- Messages support ephemeral timers (optional `delete_after` and `expires_at` fields) for auto-delete.

## Layout

- Top navbar: Avatar (user icon), brand name, chat/friends/settings nav buttons, logout.
- Mobile-first frame: max-width 28rem, centered viewport, dark emerald gradient theme.
- Lucide-react icons (MessageCircle, Users, Settings, LogOut) replace emoji for consistency.
