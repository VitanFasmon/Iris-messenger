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
  app/          - Router, providers, global layout
  features/     - Domain features (auth, friends, messages, profile)
  ui/           - Reusable primitives (Button, Input, Dialog, etc.)
  lib/          - Utilities (axios, tokenStore, sanitize)
  store/        - Zustand stores (uiStore for toasts)
  types/        - TypeScript types mirroring backend API
  pages/        - Top-level page components
  test/         - Unit tests
```

See `documents/FRONT_END_PLAN.md` for detailed architecture and implementation plan.
