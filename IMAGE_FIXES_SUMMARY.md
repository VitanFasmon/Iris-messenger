# Image and Profile Update Fixes

## Issues Fixed

### 1. Image Message Preview and Display
**Problem:** 
- Users couldn't see selected images before sending
- Sent images showed "attachment preview" text instead of thumbnails
- Images couldn't be viewed (404 errors)

**Root Cause:**
Backend returns relative URLs like `/storage/uploads/image.jpg` but frontend tried to access them on `http://localhost:5173/storage/...` instead of `http://127.0.0.1:8000/storage/...`

**Solution:**
- Created `lib/urls.ts` with `getFullUrl()` helper that converts relative backend URLs to absolute URLs
- Updated `SendMessageForm` to show image preview before sending with remove button
- Enhanced `MessageBubble` to display image thumbnails and click-to-enlarge modal
- Applied URL helper to all profile picture displays across the app

**Files Modified:**
- `front-end/src/lib/urls.ts` (created)
- `front-end/src/features/messages/components/MessageBubble.tsx`
- `front-end/src/features/messages/components/SendMessageForm.tsx`
- `front-end/src/pages/ChatsPage.tsx`
- `front-end/src/pages/SettingsPage.tsx`
- `front-end/src/pages/ProfilePage.tsx`
- `front-end/src/app/layout/AppLayout.tsx`
- `front-end/src/features/friends/components/FriendList.tsx`
- `front-end/src/features/profile/components/ProfileSettings.tsx`

### 2. Username Change Not Refreshing UI
**Problem:**
After changing username in settings, the UI didn't update without page refresh

**Solution:**
Added `queryClient.invalidateQueries({ queryKey: ["session"] })` after successful profile update to refetch and display new data immediately

**Files Modified:**
- `front-end/src/pages/SettingsPage.tsx`

## Testing Checklist

✅ **Image Upload & Display:**
- [ ] Select image via paperclip or image button
- [ ] See image preview in message input area
- [ ] Remove/change selected image before sending
- [ ] Send image and see it as thumbnail in chat
- [ ] Click thumbnail to see full-size image in modal
- [ ] Close modal by clicking X or background

✅ **Profile Pictures:**
- [ ] Profile pictures display correctly in sidebar
- [ ] Profile pictures display correctly in friends list
- [ ] Profile pictures display correctly in chat header
- [ ] Profile pictures display correctly in settings page

✅ **Username Update:**
- [ ] Change username in settings
- [ ] Verify UI updates immediately in sidebar
- [ ] Verify UI updates in settings page
- [ ] No page refresh required

✅ **Non-Image Files:**
- [ ] Attach non-image file (PDF, DOC, etc.)
- [ ] See file name with remove button before sending
- [ ] Send file and see "Attachment" link in message
- [ ] Click link to download file

## Technical Details

### URL Helper Function
```typescript
export function getFullUrl(relativeUrl: string | null | undefined): string | null {
  if (!relativeUrl) return null;
  
  // If already absolute, return as-is
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  // Get base API URL and remove /api suffix
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  
  // Remove leading slash from relative URL if present
  const path = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
  
  return `${baseUrl}${path}`;
}
```

### Image Preview Logic
- File selected → Check if image type
- If image → Create FileReader and generate preview URL
- If not image → Show file name with paperclip icon
- User can remove file before sending via X button
- On submit → Clear preview and file state

### Image Modal
- Clicking image thumbnail opens full-screen modal
- Dark overlay with centered image
- Close button (X) in top-right corner
- Click outside image to close
- ESC key support (browser default)

## Environment Variables
Ensure `VITE_API_URL` is set correctly in `front-end/.env`:
```
VITE_API_URL=http://127.0.0.1:8000/api
```

Backend `APP_URL` in `back-end/.env`:
```
APP_URL=http://127.0.0.1:8000
```

## Storage Configuration
Laravel storage link must be created:
```bash
cd back-end
php artisan storage:link
```

This creates a symlink from `public/storage` → `storage/app/public`

**Verification Complete:**
✅ Storage link exists
✅ Profile pictures directory exists with 2 images
✅ Uploads directory exists with 4 images
✅ Backend serves storage files correctly (tested with curl)
✅ Both frontend (port 5173) and backend (port 8000) are running

## Quick Test

Open the app at http://localhost:5173 and:
1. Login to your account
2. Go to a chat with a friend
3. Click the image button and select a photo
4. You should see the preview before sending
5. Send the message
6. The image should appear as a thumbnail in the chat
7. Click the thumbnail to see full-size image

For username update:
1. Go to Settings
2. Edit your username
3. Save
4. Notice the sidebar updates immediately without refresh
