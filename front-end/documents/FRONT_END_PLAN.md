# Iris Messenger Frontend Implementation Plan

Date: 2025-11-19
Target Stack: React + TypeScript + Vite + TailwindCSS + TanStack Query + Zustand + Axios + React Router v6

This document is the authoritative blueprint for transforming the Figma-generated mock React components into a production-ready frontend integrated with the existing Laravel backend. Each section contains: purpose, decisions, rationale, step-by-step instructions, and acceptance criteria.

---
## 1. Core Principles
1. Keep server state (API data, caching, polling) in TanStack Query.
2. Keep ephemeral/UI state (modals, currently selected chat, theme toggles) in a lightweight Zustand store.
3. Avoid localStorage for access token (prefer memory) to reduce XSS risk; optionally fall back to sessionStorage if reload persistence is essential.
4. All API interactions flow through a single Axios instance with interceptors (auth header, error normalization, refresh on 401 if available).
5. Derive presence client-side from `last_online` timestamps rather than storing “status” from mock data.
6. Strong typing: Mirror backend JSON exactly; never trust unknown shape. Use validators (optional future Zod layer).
7. Progressive enhancement: Implement polling first, architect for future WebSocket upgrade without refactor.
8. Security: Sanitize user-entered message content before rendering.

---
## 2. Folder Structure (Target)
```
src/
	app/
		router.tsx                  # React Router configuration
		providers/QueryProvider.tsx # QueryClient + hydration (future SSR)
		layout/AppLayout.tsx        # Global layout (Sidebar + Outlet)
	features/
		auth/
			api/auth.ts
			hooks/useAuth.ts
			components/LoginForm.tsx
			components/RegisterForm.tsx
			components/AuthGate.tsx
		users/
			api/users.ts
			hooks/useUserSearch.ts
		friends/
			api/friends.ts
			hooks/useFriends.ts
			hooks/usePendingRequests.ts
			components/FriendList.tsx
			components/AddFriendModal.tsx
		messages/
			api/messages.ts
			hooks/useConversation.ts
			hooks/useSendMessage.ts
			components/ChatWindow.tsx
			components/MessageBubble.tsx
		profile/
			api/profile.ts
			hooks/useProfilePicture.ts
			components/ProfileSettings.tsx
		presence/
			hooks/usePresencePolling.ts
		ui/                        # Curated subset from figma-generated ui/*
			Avatar.tsx, Button.tsx, Dialog.tsx, Tabs.tsx, Input.tsx, Spinner.tsx, Toast.tsx, Skeleton.tsx
	types/
		api.ts                     # Shared interfaces
	lib/
		axios.ts                   # Configured Axios instance
		tokenStore.ts              # In-memory token access
		sanitize.ts                # Message content sanitizer
		constants.ts               # API constants, intervals
	store/
		uiStore.ts                 # Zustand store
	pages/
		LoginPage.tsx
		RegisterPage.tsx
		ChatsPage.tsx
		SettingsPage.tsx
		ProfilePage.tsx
		NotFoundPage.tsx
	hooks/                       # Generic reusable hooks (useDebounce, useCountdown)
	assets/                      # Images, logos
	test/                        # Vitest + RTL setup
```

Acceptance: `src/` reflects structure; unused Figma artifacts removed or migrated.

---
## 3. TypeScript Domain Models
Create `src/types/api.ts` containing:
```ts
export interface User {
	id: number;
	username: string;
	email: string | null;
	profile_picture_url: string | null;
	last_online: string | null;      // ISO timestamp
	created_at: string;              // ISO
}

export interface AuthResponse {
	message?: string;
	user: User;
	token: string;
}

export interface FriendListItem extends User {
	friendship_created_at: string; // not part of base User; append after fetch or represent separately
}

export interface PendingFriendRequest {
	id: number;                     // friendship record id
	user: User;                     // requesting user object
	created_at: string;
}

export interface MessageApi {
	id: number;
	sender_id: number;
	receiver_id: number;
	content: string | null;
	file_url: string | null;
	timestamp: string;             // ISO
	delete_after: number | null;   // seconds
	expires_at: string | null;     // ISO
	is_deleted: boolean;
}

// Client enriched message
export interface Message extends MessageApi {
	localStatus?: 'sending' | 'sent' | 'failed';
	remainingSeconds?: number;      // derived from expires_at
}

export interface ErrorResponse {
	error?: string;
	errors?: Record<string,string[]>;
	message?: string;
	status?: number;
}
```
Add helper mappers `mapMessageApiToMessage()`.

Acceptance: All API consuming code imports from a single source of truth.

---
## 4. Environment Configuration
Create `.env.example`:
```
VITE_API_URL=http://127.0.0.1:8000/api
VITE_PRESENCE_POLL_MS=30000
VITE_FRIENDS_POLL_MS=30000
VITE_CONVERSATION_REFETCH_ON_FOCUS=true
```
Load using `import.meta.env.VITE_API_URL`. Validate presence at app start (warn if missing).

---
## 5. Axios Instance & Auth Handling
File: `src/lib/axios.ts`
```ts
import axios from 'axios';
import { getAccessToken } from './tokenStore';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: false });

api.interceptors.request.use(cfg => {
	const token = getAccessToken();
	if (token) cfg.headers.Authorization = `Bearer ${token}`;
	return cfg;
});

api.interceptors.response.use(r => r, async (error) => {
	const status = error.response?.status;
	// Optionally implement refresh if backend provides refresh endpoint
	if (status === 401 && !error.config.__isRetry) {
		error.config.__isRetry = true;
		// attempt refresh
		try {
			const { data } = await api.post('/auth/refresh');
			setAccessToken(data.token);
			return api(error.config);
		} catch (e) {
			clearAccessToken();
			// dispatch logout event
		}
	}
	return Promise.reject(error);
});
```
Token storage `tokenStore.ts`:
```ts
let accessToken: string | null = null;
export const setAccessToken = (t: string) => { accessToken = t; };
export const getAccessToken = () => accessToken;
export const clearAccessToken = () => { accessToken = null; };
```
Acceptance: All feature API modules import `api` and never recreate axios.

---
## 6. TanStack Query Setup
Provider: `QueryProvider.tsx`
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const client = new QueryClient({
	defaultOptions: { queries: { retry: 1, staleTime: 1000 * 5, refetchOnWindowFocus: true } }
});
export const QueryProvider = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={client}>{children}</QueryClientProvider>
);
```
Acceptance: Root `main.tsx` wraps with `QueryProvider`.

---
## 7. Auth Feature Implementation
API (`auth.ts`): functions `login(username,password)`, `register(formData)`, `me()`, `refreshToken()` returning typed data.

Hook `useAuth.ts` responsibilities:
- Expose `login`, `logout`, `register`, `user`.
- Maintain user in TanStack Query via `useQuery(['me'], me)` once token set.
- On logout: clear token, invalidate queries.

Protected route component `AuthGate.tsx`:
```tsx
if (!token) return <Navigate to="/login" replace />;
```
Acceptance: Navigating to `/app/*` without auth redirects to login.

---
## 8. Routing
`router.tsx` example:
```tsx
<BrowserRouter>
	<Routes>
		<Route path="/login" element={<LoginPage/>} />
		<Route path="/register" element={<RegisterPage/>} />
		<Route path="/app" element={<AuthGate><AppLayout/></AuthGate>}>
			<Route index element={<ChatsPage/>} />
			<Route path="friends" element={<ChatsPage/>} />
			<Route path="settings" element={<SettingsPage/>} />
			<Route path="profile" element={<ProfilePage/>} />
		</Route>
		<Route path="*" element={<NotFoundPage/>} />
	</Routes>
</BrowserRouter>
```
Acceptance: Sidebar highlights active route; deep-links work.

---
## 9. Friends & Presence
Endpoints used: `/friends`, `/friends/pending`, `/friends/{id}`, `/friends/{id}/accept`, `/friends/{id}` (DELETE), `/users/{username}` for search.

Polling strategy:
- Friends list query key: `['friends']` with `refetchInterval: import.meta.env.VITE_PRESENCE_POLL_MS`.
- Pending requests: `['friends','pending']` same interval.
- Derive presence: function `deriveStatus(last_online)`:
```ts
export function deriveStatus(lastOnline: string | null): 'online'|'recent'|'away'|'offline' {
	if (!lastOnline) return 'offline';
	const diffMin = (Date.now() - new Date(lastOnline).getTime()) / 60000;
	if (diffMin < 5) return 'online';
	if (diffMin < 60) return 'recent';
	if (diffMin < 180) return 'away';
	return 'offline';
}
```
Acceptance: Avatars show live status colors based on derived status.

---
## 10. Messages
Fetching: `GET /messages/{friendId}` query key `['conversation', friendId]`.
Sending: `POST /messages/{friendId}` (multipart if file). On send:
1. Insert optimistic message with `localStatus='sending'`.
2. Await server response; replace with actual payload & `localStatus='sent'`.
3. On error: mark `failed` & show retry button.

Expiration countdown:
```ts
function computeRemaining(expires_at: string | null) {
	if (!expires_at) return null;
	return Math.max(0, Math.floor((new Date(expires_at).getTime() - Date.now()) / 1000));
}
```
Use a `useInterval` (1s) inside `MessageBubble` or parent list to update remainingSeconds only for messages with expires_at.

Acceptance: Expiring message visually shows remaining seconds; disappears (re-fetch or local removal) post-expiry.

---
## 11. Profile Picture
Upload: `POST /profile/picture` (multipart). Use hidden file input & preview.
Delete: `DELETE /profile/picture` then invalidate `['me']` and `['friends']` queries.
Cache bust: append `?t=${Date.now()}` to updated avatar URL when setting state.

Acceptance: Update reflects instantly without stale cached image.

---
## 12. UI Component Refinement
From `figma-generated-tsx/src/components/ui/*` choose minimal set. Remove unused heavy components (carousel, chart). Provide doc comments.
Guidelines:
- Button: variants (primary, ghost, destructive), loading state prop.
- Avatar: props `{src, alt, fallback}`; presence indicator handled externally.
- Dialog/Modal: accessible focus trap (reuse existing or small library if complexity grows).
- Skeleton: simple shimmer for loading lists.

Acceptance: No unused UI files left; components exported from central `ui/index.ts` barrel.

---
## 13. State (Zustand)
`uiStore.ts` sample:
```ts
import { create } from 'zustand';
interface UiState { addFriendOpen: boolean; setAddFriendOpen(v:boolean):void; toastQueue: ToastMsg[]; pushToast(m:ToastMsg):void; }
export const useUiStore = create<UiState>(set => ({
	addFriendOpen: false,
	setAddFriendOpen: v => set({ addFriendOpen: v }),
	toastQueue: [],
	pushToast: m => set(s => ({ toastQueue: [...s.toastQueue, m] }))
}));
```
Acceptance: Modal visibility controlled globally; toasts accumulate.

---
## 14. Error & Loading UX
- Axios errors normalized to `ErrorResponse`.
- Query error boundaries: show toast + retry button.
- Skeleton placeholders for friends list & chat messages.
- Global `<ErrorBoundary>` for catastrophic UI failures.
Acceptance: Network errors do not crash app; user gets actionable feedback.

---
## 15. Security Measures
Message content sanitation: `sanitize.ts` naive implementation:
```ts
export function sanitize(raw:string){ return raw.replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
```
Prevent oversized file upload: pre-check `file.size <= 5*1024*1024` before sending.
Never store access token in localStorage; ensure no `dangerouslySetInnerHTML` for messages.
Acceptance: Attempted HTML injection displays harmless escaped text.

---
## 16. Testing Setup
Install dev deps: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `msw`.
Add `test/setup.ts` for MSW handlers mocking backend endpoints.
Critical tests:
1. Login success -> dashboard visible.
2. Failed login shows error toast.
3. Friend list fetch renders skeleton then data.
4. Send message optimistic -> appears as sending -> updates to sent.
5. Profile picture upload triggers re-render avatar.
Acceptance: CI passes test suite locally.

---
## 17. Performance Considerations
- Memoize heavy lists with `React.memo`.
- Only animate countdown for messages with `expires_at`.
- Consider virtualization (>100 messages) using `@tanstack/react-virtual` or `react-virtual`. Defer until needed.
- Code-split pages via dynamic imports in router.
Acceptance: No perceptible lag with 200+ messages; bundle chunks for auth vs app separated.

---
## 18. Friend Search Flow
1. User enters username in AddFriendModal.
2. Call `GET /users/{username}`.
3. If found and not self, trigger `POST /friends/{id}`.
4. Invalidate pending requests + friends queries.
Edge cases: Already friend -> show message; 404 -> display “User not found”.
Acceptance: Search + add flow gives clear result states.

---
## 19. Presence Polling Abstraction
`usePresencePolling.ts`: internally calls `useQuery(['friends'], fetchFriends, { refetchInterval })`.
Expose derived list with status field appended.
Acceptance: Status updates every interval without manual refresh.

---
## 20. Migration of Figma Components
Mapping:
- `LoginScreen` -> split into `LoginForm` & page container.
- `Dashboard` -> removed; replaced by route-based layout.
- `FriendsList` -> integrate with real data (remove mock arrays).
- `ChatWindow` -> adapt props to use `Message` type; remove local auto-delete logic (use expires_at).
- `AddFriendModal` -> connect to search & friendRequest mutation hooks.
- Remove `SettingsScreen` insecure password change mock (backend has no password change endpoint currently); replace with profile picture + basic display.
Acceptance: No references to mock arrays remain.

---
## 21. Incremental Implementation Order (Sprint Checklist)
1. Scaffolding: env, axios, QueryProvider, router, uiStore.
2. Types and auth feature (login/register/me).
3. Layout + protected routes.
4. Friends & pending requests (list + derived presence).
5. Conversation fetch + sending messages.
6. Profile picture upload/delete.
7. Add friend modal + search workflow.
8. Expiration countdown logic.
9. Error/loading skeletons + toasts.
10. Sanitation + file validation.
11. Tests for core flows.
12. Performance enhancements (as needed).
13. Documentation & cleanup.

---
## 22. Acceptance Criteria Summary
| Feature | Criteria |
|---------|----------|
| Auth | Login/register persists token in memory; protected routes redirect unauthenticated users |
| Friends | List updates automatically; pending requests handled |
| Messages | Optimistic send + retry; attachments upload; expiration removal |
| Profile Picture | Upload/delete reflects immediately; cache bust works |
| Presence | Status updates based on `last_online` without manual refresh |
| Error Handling | Network/API errors produce toasts, not crashes |
| Security | Escaped content, controlled file types & sizes |
| Testing | Core flows covered by Vitest/RTL |
| Performance | No lag with moderate data; ready for virtualization |
| Documentation | This plan + frontend README present |

---
## 23. Future Extensions (Not in initial scope)
- WebSocket real-time updates (messages/presence).
- Message read receipts & delivery status (requires backend support).
- Dark mode theme toggling.
- Internationalization with `react-intl` or `lingui`.
- Advanced accessibility audit.

---
## 24. Reference Implementation Snippets
Message send hook skeleton:
```ts
export function useSendMessage(friendId: number) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (payload: { content?: string; file?: File; delete_after?: number }) => {
			const form = new FormData();
			if (payload.content) form.append('content', payload.content);
			if (payload.file) form.append('file', payload.file);
			if (payload.delete_after) form.append('delete_after', String(payload.delete_after));
			const { data } = await api.post(`/messages/${friendId}`, form);
			return data as MessageApi;
		},
		onMutate: async (vars) => {
			await qc.cancelQueries(['conversation', friendId]);
			const previous = qc.getQueryData<Message[]>(['conversation', friendId]) || [];
			const optimistic: Message = {
				id: Date.now(), sender_id: /* me */ 0, receiver_id: friendId,
				content: vars.content || (vars.file ? vars.file.name : ''), file_url: null,
				timestamp: new Date().toISOString(), delete_after: vars.delete_after || null,
				expires_at: vars.delete_after ? new Date(Date.now() + vars.delete_after*1000).toISOString() : null,
				is_deleted: false, localStatus: 'sending'
			};
			qc.setQueryData(['conversation', friendId], [...previous, optimistic]);
			return { previous };
		},
		onError: (err, _vars, ctx) => {
			if (ctx?.previous) qc.setQueryData(['conversation', friendId], ctx.previous);
		},
		onSuccess: (data) => {
			qc.setQueryData<Message[]>(['conversation', friendId], (msgs = []) =>
				msgs.map(m => m.localStatus === 'sending' ? { ...m, ...data, localStatus: 'sent' } : m)
			);
		}
	});
}
```

Presence derivation usage inside FriendList:
```ts
const { data: friends } = useFriends();
return friends.map(f => ({ ...f, status: deriveStatus(f.last_online) }));
```

---
## 25. Documentation Deliverables
- `FRONT_END_PLAN.md` (this file)
- `frontend/README.md` (setup + quick start + architecture summary)
- Possibly `ARCHITECTURE.md` later if scope grows

---
## 26. Metrics & Validation
Manual QA checklist before marking complete:
1. Login & navigate to chats.
2. Add friend workflow behaves correctly for existing/non-existing usernames.
3. Send message with file (<5MB). Appears and countdown works if expiring.
4. Profile picture updated & visible in friends list.
5. Status badges respond after `last_online` forced change (simulate via backend call refresh).
6. Page refresh keeps user? (If memory only, user must re-login — decide acceptability.)

---
## 27. Implementation Notes / Assumptions
- Backend does not yet expose file attachment retrieval beyond file_url; client trusts URL path.
- No password change endpoint; hide that UI for now to avoid inconsistency.
- Refresh token endpoint exists (`/auth/refresh`) returning new token; we treat it as short-term renewal.
- Message read receipts are not implemented backend-side; `localStatus` confined to client simulation.

---
## 28. Cutover Strategy from Figma Code
1. Create new structure in `src/` without deleting original figma folder (safe fallback).
2. Port components sequentially; after each feature migration, remove original counterpart.
3. After all features verified, delete `figma-generated-tsx` folder entirely.
4. Git commit phases: `feat(frontend): scaffold`, `feat(frontend): auth`, `feat(frontend): friends`, etc.

---
## 29. Risk Register & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Token lost on reload due to memory storage | Forced re-login | Consider sessionStorage fallback configurable |
| Large message lists degrade performance | Poor UX | Add virtualization after threshold |
| Polling overhead | Increased network usage | Backoff when tab hidden (listen visibilitychange) |
| Attachment upload failures | User frustration | Show progress + retry button |
| Stale presence due to polling interval | Perceived inaccuracy | Provide manual refresh button |

---
## 30. Completion Definition
Frontend considered MVP-complete when: all acceptance criteria pass, tests green, plan items closed, figma mock code removed, README published.

---
End of Plan

