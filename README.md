# Iris Messenger Monorepo

Unified repository for the Iris Messenger application consisting of a Laravel backend (ephemeral, friend‑based direct messaging) and a React + TypeScript frontend.

## Contents

| Folder | Purpose |
|--------|---------|
| `back-end/` | Laravel 12 REST API: auth, friends, messages, expiry, profile, presence |
| `front-end/` | React 19 SPA (Vite) with TanStack Query, Zustand, Tailwind, secure token handling |
| `docs/` | Project level documentation (discrepancy matrix, architecture) |

## High‑Level Architecture

Direct user‑to‑user messaging (no group abstraction) backed by a `messages` table storing optional `delete_after` (seconds) or `expires_at` timestamps. The frontend requests aggregated last messages for friend list performance and polls presence indirectly (derived from `last_online`).

### Backend Key Concepts
- JWT authentication (`/api/auth/*`)
- Friend lifecycle (send, accept, remove, incoming + outgoing listing)
- Ephemeral messages (auto cleanup via scheduled command every minute)
- Attachments (stored on public disk with `storage:link`)
- Presence: middleware updates `last_online` (5‑minute write limit)

### Frontend Key Concepts
- In‑memory access token (sessionStorage fallback) – no localStorage
- React Query for server state (friends, messages, last messages, requests)
- Expiry countdown rendered client‑side; expired messages disappear automatically
- Sanitization at render (`sanitize.ts`) for message text and previews
- Accessibility: buttons labeled (emoji picker, timer selection)

## Updated Endpoint Summary (Nov 2025)

| Category | Endpoint | Notes |
|----------|----------|-------|
| Auth | `POST /api/auth/register` | Optional profile picture |
| Auth | `POST /api/auth/login` | Returns token + user |
| Auth | `POST /api/auth/logout` | Invalidates token |
| Auth | `POST /api/auth/refresh` | Refresh JWT, updates `last_online` |
| Auth | `POST /api/auth/password` | Change password (current + new) |
| User | `GET /api/me` | Authenticated user info |
| User | `GET /api/users/{username}` | Search by username |
| User | `GET /api/users/id/{id}` | Fetch by id |
| Profile | `PATCH /api/profile` | Update username/email |
| Profile | `POST /api/profile/picture` | Upload / replace picture |
| Profile | `DELETE /api/profile/picture` | Remove picture |
| Friends | `GET /api/friends` | Accepted friends |
| Friends | `GET /api/friends/pending` | Incoming pending requests |
| Friends | `GET /api/friends/outgoing` | Outgoing pending requests |
| Friends | `POST /api/friends/{id}` | Send friend request |
| Friends | `POST /api/friends/{id}/accept` | Accept pending request |
| Friends | `DELETE /api/friends/{id}` | Reject or remove friendship |
| Messages | `GET /api/messages/last` | Aggregated last message per friend |
| Messages | `GET /api/messages/{receiver_id}` | Bidirectional thread |
| Messages | `POST /api/messages/{receiver_id}` | Send message/file (optional `delete_after`) |
| Messages | `DELETE /api/messages/{id}` | Sender delete |

## Installation

### Backend
```bash
cd back-end
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Frontend
```bash
cd front-end
npm install
npm run dev
```
Frontend dev server defaults to `http://localhost:5173` (Vite). Configure CORS via `FRONTEND_URL` in backend `.env`.

## Message Expiry
- Server sets `expires_at` based on `delete_after` seconds.
- Scheduled command (`messages:delete-expired`) runs every minute.
- Frontend hides bubbles once countdown hits zero without waiting for refetch.

## Security
- Access token kept only in memory + sessionStorage fallback (no persistent XSS surface).
- Server rate‑limits message posting (`throttle:30,1`).
- Sanitization applied on render for message content and last message previews.
- File uploads validated (size/type) by Laravel.

## Presence Model
Derived client‑side from `last_online`:
- online < 5m
- recent < 60m
- offline otherwise (future: away tier refinement).

## Testing (Planned Frontend)
Vitest + Testing Library + MSW. Initial suite will cover: auth flow, friend list skeleton -> data, optimistic message send, expiry countdown behaviour.

## Development Scripts
- Backend tests: `php artisan test`
- Frontend tests: `npm test`
- Frontend type check: `tsc -b`
- Lint: `npm run lint`

## Discrepancy Matrix
See `docs/DISCREPANCY_MATRIX.md` for remaining gaps vs plan & Figma.

## Next Steps
1. Refine AddFriendModal (use backend outgoing requests; improved layout)
2. Profile/password form wiring in frontend
3. Presence status refinement (add 'away')
4. Deprecated types cleanup
5. Test suite + coverage
6. Websocket/real‑time phase (future)

## License
Academic project – all rights reserved.

_Last updated: 2025-11-23_
