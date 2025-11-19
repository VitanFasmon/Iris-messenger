# Profile Picture and Last Online Features - Implementation Summary

## Overview
Added profile picture upload functionality and last online time tracking for users in the Iris Messenger backend.

## Changes Made

### 1. Database Schema
**Migration:** `2025_11_19_154000_add_profile_picture_and_last_online_to_users_table.php`
- Added `profile_picture_url` (nullable string) column to store profile picture URLs
- Added `last_online` (nullable timestamp) column to track user's last activity

### 2. User Model (`app/Models/User.php`)
- Added `profile_picture_url` and `last_online` to `$fillable` array
- Added `last_online` to casts as datetime
- Created `updateLastOnline()` method to update the timestamp

### 3. Controllers

#### AuthController (`app/Http/Controllers/Api/AuthController.php`)
**Registration:**
- Accepts optional `profile_picture` file upload (max 5MB, image only)
- Stores profile picture in `storage/app/public/profile_pictures/`
- Sets `last_online` to current time on registration
- Returns `profile_picture_url` and `last_online` in response

**Login:**
- Updates `last_online` timestamp when user logs in
- Returns `profile_picture_url` and `last_online` in response

**Token Refresh:**
- Updates `last_online` timestamp when token is refreshed

**Me Endpoint:**
- Includes `profile_picture_url` and `last_online` in user profile response

#### ProfileController (NEW: `app/Http/Controllers/Api/ProfileController.php`)
**Update Profile Picture:**
- `POST /api/profile/picture`
- Accepts `profile_picture` file upload
- Deletes old profile picture if exists
- Validates image type and size (max 5MB)
- Returns updated profile picture URL

**Delete Profile Picture:**
- `DELETE /api/profile/picture`
- Removes profile picture file from storage
- Sets `profile_picture_url` to null

#### UserController (`app/Http/Controllers/Api/UserController.php`)
- Updated `search()` to include `profile_picture_url` and `last_online`
- Updated `show()` to include `profile_picture_url` and `last_online`

#### FriendController (`app/Http/Controllers/Api/FriendController.php`)
- Updated `index()` to include `profile_picture_url` and `last_online` in friend list
- Updated `pending()` to include `profile_picture_url` and `last_online` in pending requests

### 4. Middleware
**UpdateLastOnline** (NEW: `app/Http/Middleware/UpdateLastOnline.php`)
- Automatically updates `last_online` timestamp on authenticated API requests
- Rate-limited to update only once every 5 minutes to reduce database writes
- Registered as API middleware in `bootstrap/app.php`

### 5. Routes (`routes/api.php`)
Added two new protected routes:
- `POST /api/profile/picture` - Upload/update profile picture
- `DELETE /api/profile/picture` - Delete profile picture

### 6. Database Seeder
Updated test users with:
- Profile pictures from https://i.pravatar.cc (avatar placeholder service)
- Realistic last_online timestamps:
  - Alice: 10 minutes ago
  - Bob: 5 minutes ago
  - Charlie: 2 hours ago

### 7. Tests
**New Test Suite:** `tests/Feature/ProfileTest.php` (16 tests)

**Profile Picture Tests:**
- ✅ User can register with profile picture
- ✅ User can register without profile picture
- ✅ Profile picture must be valid image
- ✅ Profile picture size is limited to 5MB
- ✅ Authenticated user can update profile picture
- ✅ Updating profile picture deletes old one
- ✅ Authenticated user can delete profile picture
- ✅ Cannot delete profile picture if none exists
- ✅ Unauthenticated user cannot update profile picture

**Last Online Tests:**
- ✅ Last online is set on registration
- ✅ Last online is updated on login
- ✅ Last online is updated on token refresh
- ✅ Last online is included in user responses
- ✅ Last online is included in friend list
- ✅ Last online is included in user search
- ✅ Profile picture is included in all user responses

## Test Results
**All 65 tests pass successfully!**
- 49 existing tests (unchanged)
- 16 new profile feature tests

## How Last Online Works

### Update Triggers:
1. **Registration** - Set to current time when user registers
2. **Login** - Updated when user logs in
3. **Token Refresh** - Updated when JWT token is refreshed
4. **API Requests** - Automatically updated via middleware (every 5 minutes)

### Rate Limiting:
The middleware only updates `last_online` if:
- User is authenticated AND
- Last update was more than 5 minutes ago

This prevents excessive database writes while still providing accurate online status.

## API Response Examples

### Registration with Profile Picture
```json
POST /api/auth/register
Content-Type: multipart/form-data

{
  "username": "alice",
  "email": "alice@example.com",
  "password": "password123",
  "profile_picture": <file>
}

Response:
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com",
    "profile_picture_url": "/storage/profile_pictures/abc123.jpg",
    "last_online": "2025-11-19T15:45:30.000000Z",
    "created_at": "2025-11-19T15:45:30.000000Z"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Get Friend List (with Profile Pictures and Last Online)
```json
GET /api/friends
Authorization: Bearer <token>

Response:
[
  {
    "id": 2,
    "username": "bob",
    "email": "bob@example.com",
    "profile_picture_url": "https://i.pravatar.cc/150?img=2",
    "last_online": "2025-11-19T15:40:30.000000Z",
    "friendship_created_at": "2025-11-19T10:00:00.000000Z"
  }
]
```

### Update Profile Picture
```json
POST /api/profile/picture
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "profile_picture": <file>
}

Response:
{
  "message": "Profile picture updated successfully",
  "profile_picture_url": "/storage/profile_pictures/xyz789.jpg"
}
```

## File Storage
Profile pictures are stored in:
- **Physical location:** `storage/app/public/profile_pictures/`
- **Public URL:** `/storage/profile_pictures/{filename}`
- **Max size:** 5MB
- **Allowed formats:** JPEG, PNG, GIF, etc. (any valid image)

## Database Schema
```sql
ALTER TABLE users 
ADD COLUMN profile_picture_url VARCHAR(255) NULL AFTER password_hash,
ADD COLUMN last_online TIMESTAMP NULL AFTER created_at;
```

## Migration Commands Used
```bash
# Create migration
php artisan make:migration add_profile_picture_and_last_online_to_users_table

# Run migration
php artisan migrate

# Refresh database with seed data
php artisan migrate:fresh --seed
```

## Security Considerations
1. **File Type Validation** - Only images are allowed for profile pictures
2. **File Size Limit** - Maximum 5MB to prevent abuse
3. **Authentication Required** - All profile endpoints require JWT authentication
4. **Authorization** - Users can only update/delete their own profile picture
5. **Old File Cleanup** - Previous profile picture is deleted when uploading new one

## Performance Optimizations
1. **Last Online Rate Limiting** - Updates only every 5 minutes via middleware
2. **Conditional Updates** - Checks if update is needed before database write
3. **Efficient Queries** - Uses Eloquent relationships for loading user data

## Frontend Integration Notes
- Profile pictures are returned as URLs in all user-related endpoints
- `last_online` is returned as ISO 8601 timestamp
- Frontend can calculate "online", "recently active", "offline" status based on `last_online`
- Example: User is "online" if `last_online` is within last 5 minutes

## Suggested Frontend Display Logic
```javascript
function getOnlineStatus(lastOnline) {
  const now = new Date();
  const lastOnlineDate = new Date(lastOnline);
  const minutesAgo = (now - lastOnlineDate) / 1000 / 60;
  
  if (minutesAgo < 5) return 'online';
  if (minutesAgo < 60) return `active ${Math.floor(minutesAgo)}m ago`;
  if (minutesAgo < 1440) return `active ${Math.floor(minutesAgo / 60)}h ago`;
  return `active ${Math.floor(minutesAgo / 1440)}d ago`;
}
```

## Next Steps for Frontend
1. Add profile picture upload component to registration form
2. Display user avatars in friend list
3. Show "last seen" status based on `last_online` timestamp
4. Add profile picture update functionality in settings
5. Display online/offline indicator (green dot if online within 5 minutes)
