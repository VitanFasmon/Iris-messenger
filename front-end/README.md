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
- TanStack Query for server state
- Zustand for UI state (toasts)
- TailwindCSS for styling
- Axios for HTTP with auth interceptors
import reactDom from 'eslint-plugin-react-dom'
