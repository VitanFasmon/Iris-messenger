# Discrepancy Matrix (Front-End Plan vs Current Implementation)

**Date:** 2025-11-23

| Area | Plan Expectation | Current State | Gap / Action |
|------|------------------|---------------|--------------|
| Auth Storage | Memory + session fallback (no localStorage) | Implemented | None |
| Friend List Performance | Aggregated last message endpoint to avoid N+1 | Implemented (`/messages/last`) | None |
| Outgoing Friend Requests | Surface outgoing pending requests | Implemented (`/friends/outgoing`) & consumed in ChatsPage; AddFriendModal still uses local map | Refactor AddFriendModal to use hook + show usernames |
| Message Expiry | Show countdown; hide expired; backend cleanup | Countdown + hide implemented; cleanup scheduled | None (add tests) |
| Unread Indicator | Basic heuristic pre-read receipts | Pulse badge implemented | Enhance once read receipts exist |
| Presence | online/recent/offline + later 'away' tier | online/recent/offline implemented | Add 'away' + tooltip |
| Sanitization | Sanitize content + previews | Implemented via `sanitize()` | Consider richer HTML sanitization if formatting added |
| Input Toolbar | Emoji + timer + accessibility | Implemented (emoji grid, timer) | Consider full emoji picker lib later |
| AddFriendModal | Use backend outgoing + improved UI sections | Local outgoing map; UI basic | Replace map with backend data; add sections styling |
| Profile Update | Patch username/email + password change | Backend complete; frontend forms not wired | Implement forms + optimistic UI |
| Deprecated Types | Clean old conversation abstractions | Some legacy in `types/api.ts` | Remove unused types + align message model |
| Testing | Vitest + RTL + MSW coverage for core flows | Test infra dependencies present; tests absent | Implement initial suite (auth, friend list, send message, expiry) |
| README / Docs | Unified monorepo + updated endpoint docs | Added root + updated back/front readmes | None (keep versioning) |
| Presence Polling Interval | Configurable polling | Hardcoded in hook (20s) | Move to env + doc update |
| Security Hardening | Rate limiting, token scope, sanitized rendering | Basic rate limiting & sanitize done | Add CSRF note (if web forms) & audit attachments validation |
| Accessibility | ARIA labels, focus states | Labels added to interactive buttons | Add keyboard trap prevention in modals |
| Future Real-Time | WebSocket/Echo integration | Not started | Plan architecture phase |

## Immediate Action Queue

1. Refactor AddFriendModal to consume outgoing requests hook directly.
2. Implement profile & password update forms (frontend).
3. Introduce 'away' presence tier (15–60m) and tooltip with relative time.
4. Clean up deprecated types in `types/api.ts`.
5. Create initial Vitest test suite (auth, friend list, send message, expiry countdown, sanitization).
6. Move presence poll interval to env variable.

## Completed Items

- Token storage refactor
- Aggregated last messages endpoint integration
- Outgoing friend requests endpoint & basic usage
- Expiry countdown + cleanup
- Unread badge heuristic
- Sanitization pipeline
- Input toolbar enhancements
- Documentation overhaul

## Notes

This matrix should be regenerated after the next milestone (tests + profile integration). Keep version tags in readmes synchronized with backend tag (1.1.0) and increment when public contract changes.
