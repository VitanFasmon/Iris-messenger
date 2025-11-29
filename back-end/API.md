# Iris Messenger Backend - API Documentation

## Getting Started

### Prerequisites
- PHP 8.2+
- Composer
- MySQL

### Installation

```bash
cd back-end

# Install dependencies
composer install

# Configure environment
cp .env.example .env
# Edit .env and set your database credentials

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Run migrations
php artisan migrate

# Seed database with test data (optional)
php artisan db:seed

# Start development server
php artisan serve
```

The API will be available at `http://127.0.0.1:8000/api`

### Test Users (after seeding)
- **alice** / password123 (has profile picture, last online: 10 min ago)
- **bob** / password123 (has profile picture, last online: 5 min ago)
- **charlie** / password123 (has profile picture, last online: 2 hours ago)

## API Endpoints

### Authentication

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**With Profile Picture:**
```bash
POST /api/auth/register
Content-Type: multipart/form-data

username=johndoe
email=john@example.com
password=securepassword
profile_picture=@/path/to/image.jpg
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "profile_picture_url": "/storage/profile_pictures/abc123.jpg",
    "last_online": "2025-11-19T15:45:30.000000Z",
    "created_at": "2025-11-17T12:00:00.000000Z"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com",
    "profile_picture_url": "https://i.pravatar.cc/150?img=1",
    "last_online": "2025-11-19T15:45:30.000000Z",
    "created_at": "2025-11-17T12:00:00.000000Z"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Note:** The `last_online` field is automatically updated on login, token refresh, and API requests (rate-limited to every 5 minutes).

#### Get Current User
```bash
GET /api/me
Authorization: Bearer {token}
```

Response:
```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "profile_picture_url": "https://i.pravatar.cc/150?img=1",
  "last_online": "2025-11-19T15:45:30.000000Z",
  "created_at": "2025-11-17T12:00:00.000000Z"
}
```

#### Logout
```bash
POST /api/auth/logout
Authorization: Bearer {token}
```

Response:
```json
{
  "message": "Successfully logged out"
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Authorization: Bearer {token}
```

Response:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Note:** Refreshing the token also updates the `last_online` timestamp.

### Users

#### Search User by Username
```bash
GET /api/users/{username}
Authorization: Bearer {token}
```

Response:
```json
{
  "id": 2,
  "username": "bob",
  "email": "bob@example.com",
  "profile_picture_url": "https://i.pravatar.cc/150?img=2",
  "last_online": "2025-11-19T15:40:30.000000Z",
  "created_at": "2025-11-17T10:30:00.000000Z"
}
```

#### Get User by ID
```bash
GET /api/users/id/{id}
Authorization: Bearer {token}
```

Response:
```json
{
  "id": 2,
  "username": "bob",
  "email": "bob@example.com",
  "profile_picture_url": "https://i.pravatar.cc/150?img=2",
  "last_online": "2025-11-19T15:40:30.000000Z",
  "created_at": "2025-11-17T10:30:00.000000Z"
}
```

### Profile

#### Update Profile Picture
```bash
POST /api/profile/picture
Authorization: Bearer {token}
Content-Type: multipart/form-data

profile_picture=@/path/to/new-image.jpg
```

**Constraints:**
- Must be a valid image file (JPEG, PNG, GIF, etc.)
- Maximum file size: 5MB
- Old profile picture is automatically deleted

Response:
```json
{
  "message": "Profile picture updated successfully",
  "profile_picture_url": "/storage/profile_pictures/xyz789.jpg"
}
```

#### Delete Profile Picture
```bash
DELETE /api/profile/picture
Authorization: Bearer {token}
```

Response:
```json
{
  "message": "Profile picture deleted successfully"
}
```

### Friends

#### Get Friends List
```bash
GET /api/friends
Authorization: Bearer {token}
```

Returns all accepted friendships with profile pictures and last online status.

Response:
```json
[
  {
    "id": 2,
    "username": "bob",
    "email": "bob@example.com",
    "profile_picture_url": "https://i.pravatar.cc/150?img=2",
    "last_online": "2025-11-19T15:40:30.000000Z",
    "friendship_created_at": "2025-11-17T10:00:00.000000Z"
  }
]
```

#### Get Pending Friend Requests
```bash
GET /api/friends/pending
Authorization: Bearer {token}
```

Returns friend requests you've received.

Response:
```json
[
  {
    "id": 3,
    "user": {
      "id": 3,
      "username": "charlie",
      "email": "charlie@example.com",
      "profile_picture_url": "https://i.pravatar.cc/150?img=3",
      "last_online": "2025-11-19T13:45:30.000000Z"
    },
    "created_at": "2025-11-19T14:00:00.000000Z"
  }
]
```

#### Send Friend Request
```bash
POST /api/friends/{user_id}
Authorization: Bearer {token}
```

#### Accept Friend Request
```bash
POST /api/friends/{friendship_id}/accept
Authorization: Bearer {token}
```

#### Remove Friend or Reject Request
```bash
DELETE /api/friends/{friendship_id}
Authorization: Bearer {token}
```

### Messages

#### Get Chat History
```bash
GET /api/messages/{receiver_id}
Authorization: Bearer {token}
```

Returns all messages between you and the specified user (both directions), ordered ascending by `timestamp`.

Optional query parameters for pagination:

- `limit` (number, default 30, max 100): number of messages to return
- `before` (ISO 8601 datetime, e.g. `2025-11-29T12:00:00.000Z`): return messages older than this timestamp

Example:

```bash
GET /api/messages/2?limit=30&before=2025-11-29T12:00:00.000Z
```

Notes:
- When `before` is omitted, the latest page is returned but the response is still ordered ascending for rendering.
- Use this with frontend infinite loading by passing the oldest message `timestamp` as the next `before` value.

#### Send Message
```bash
POST /api/messages/{receiver_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Hello, how are you?",
  "delete_after": 300
}
```

**Parameters:**
- `content` (optional): Message text
- `file` (optional): File upload (multipart/form-data)
- `delete_after` (optional): Seconds until auto-deletion

**Send Message with File:**
```bash
POST /api/messages/{receiver_id}
Authorization: Bearer {token}
Content-Type: multipart/form-data

file=@/path/to/image.jpg
content=Check out this photo!
delete_after=600
```

Response (truncated):
```json
{
  "message": "Message sent successfully",
  "data": {
    "id": 123,
    "sender_id": 1,
    "receiver_id": 2,
    "content": "Check out this photo!",
    "file_url": "/storage/uploads/abc123xyz.jpg",
    "filename": "image.jpg",
    "timestamp": "2025-11-29T12:34:56.000000Z",
    "delete_after": 600,
    "expires_at": "2025-11-29T12:44:56.000000Z",
    "attachments": [
      { "id": 1, "file_type": "image", "file_url": "/storage/uploads/abc123xyz.jpg", "filename": "image.jpg" }
    ]
  }
}
```

#### Delete Message
```bash
DELETE /api/messages/{message_id}
Authorization: Bearer {token}
```

Only the sender can delete their own messages.

#### Download Attachment (keeps original filename)
```bash
GET /api/messages/download/{message_id}
Authorization: Bearer {token}
```

Downloads the attachment of a specific message using its original filename.
Returns 404 if the message has no file.

#### Last Messages (per friend)
```bash
GET /api/messages/last
Authorization: Bearer {token}
```

Returns the most recent active message with each friend in a single, optimized query. Useful for friend list previews.

Response (example):
```json
[
  {
    "user_id": 2,
    "message_id": 123,
    "sender_id": 1,
    "content": "See you soon!",
    "file_url": null,
    "filename": null,
    "timestamp": "2025-11-29T12:34:56.000000Z",
    "delete_after": 300,
    "expires_at": "2025-11-29T12:39:56.000000Z"
  }
]
```

## Timed Message Deletion

Messages with `delete_after` set will automatically be marked as deleted after they expire.

### Manual Cleanup
```bash
php artisan messages:delete-expired
```

### Automated Cleanup (Scheduler)

The scheduler runs every minute to delete expired messages. To enable it, add this to your crontab:

```bash
* * * * * cd /path/to/back-end && php artisan schedule:run >> /dev/null 2>&1
```

Or run the scheduler manually in development:
```bash
php artisan schedule:work
```

## User Presence & Online Status

The `last_online` field is automatically updated in the following situations:

1. **On Registration** - Set to current timestamp
2. **On Login** - Updated to current timestamp
3. **On Token Refresh** - Updated to current timestamp
4. **On API Requests** - Updated via middleware (rate-limited to every 5 minutes to reduce database writes)

### Frontend Integration

Display online status based on `last_online`:
- **Online**: `last_online` within last 5 minutes
- **Recently Active**: `last_online` within last hour  
- **Last Seen**: Display relative time for older activity

Example JavaScript logic:
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

## File Uploads

### Message Attachments
Files are stored in `storage/app/public/uploads/`.

### Profile Pictures
Profile pictures are stored in `storage/app/public/profile_pictures/`.

**Setup:**
```bash
php artisan storage:link
```

Files will be accessible at:
- Messages: `http://127.0.0.1:8000/storage/uploads/...`
- Profiles: `http://127.0.0.1:8000/storage/profile_pictures/...`

### Allowed File Types
Uploads are validated by extension for broad compatibility. Examples of allowed extensions:

- Images: `jpg, jpeg, png, gif, webp, bmp, svg, ico`
- Documents: `pdf, doc, docx, xls, xlsx, ppt, pptx, txt, rtf, odt, ods, odp, csv`
- Archives: `zip, rar, 7z, tar, gz`
- Media: `mp3, mp4, avi, mov, wmv, flv, mkv, wav, ogg, webm`
- Code/Text: `json, xml, html, css, js, ts, jsx, tsx, php, py, java, c, cpp, h, hpp, cs, rb, go, rs, swift, kt, sh, bat, ps1, sql, md, yaml, yml, toml, ini`
- eBooks: `epub, mobi, azw, azw3`

Note: Allowing executable extensions (e.g., `.php`, `.sh`) can be risky in misconfigured environments. Files are stored under `storage/app/public` and served as static assets, but for maximum safety consider storing outside the web root and always serving via the download endpoint.

### PHP Upload Limits
If uploads fail unexpectedly, verify PHP limits:

```bash
php -i | grep -E "upload_max_filesize|post_max_size"
```

Recommended `.ini` settings for up to 10 MB uploads:

```
upload_max_filesize = 10M
post_max_size = 12M
```

Then clear caches / restart PHP-FPM as needed.

## CORS Configuration

By default, CORS is configured to allow requests from your local frontend dev server (e.g., `http://localhost:5173` for Vite or `http://localhost:3000` for CRA).

To change this, update `FRONTEND_URL` in your `.env`:

```
FRONTEND_URL=http://localhost:5173
```

## Testing

### Run Tests
```bash
php artisan test
```

### Example cURL Commands

**Login and get token:**
```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}' \
  | jq -r '.token')

echo $TOKEN
```

**Get friends list:**
```bash
curl -X GET http://127.0.0.1:8000/api/friends \
  -H "Authorization: Bearer $TOKEN"
```

**Send a message:**
```bash
curl -X POST http://127.0.0.1:8000/api/messages/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hi Bob!","delete_after":300}'
```

**Get chat history:**
```bash
curl -X GET http://127.0.0.1:8000/api/messages/2 \
  -H "Authorization: Bearer $TOKEN"
```

## Environment Variables

Key variables in `.env`:

```env
APP_NAME="Iris Messenger"
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=messenger_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

FRONTEND_URL=http://localhost:3000

JWT_SECRET=your_generated_secret
```

## Project Structure

```
app/
├── Console/Commands/
│   └── DeleteExpiredMessages.php    # Scheduled task for message cleanup
├── Http/
│   ├── Controllers/Api/
│   │   ├── AuthController.php       # Authentication endpoints
│   │   ├── FriendController.php     # Friend management
│   │   ├── MessageController.php    # Messaging & file uploads
│   │   ├── ProfileController.php    # Profile picture management
│   │   └── UserController.php       # User search/profile
│   └── Middleware/
│       └── UpdateLastOnline.php     # Auto-update last_online timestamp
└── Models/
    ├── User.php                      # User model with JWT
    ├── Friend.php                    # Friend relationship model
    ├── Message.php                   # Message model with expiry scopes
    └── Attachment.php                # File attachment model

database/
├── migrations/
│   ├── 2025_11_17_001500_create_iris_messenger_schema_mysql.php
│   └── 2025_11_19_154000_add_profile_picture_and_last_online_to_users_table.php
└── seeders/
    └── DatabaseSeeder.php            # Test data seeder

routes/
└── api.php                           # API route definitions
```

## Development Workflow

1. **Start the server:**
   ```bash
   php artisan serve
   ```

2. **Run migrations and seed:**
   ```bash
   php artisan migrate:fresh --seed
   ```

3. **Watch for expired messages:**
   ```bash
   php artisan schedule:work
   ```

4. **Test API endpoints** using Postman, cURL, or your React frontend

## Troubleshooting

### JWT Token Invalid
- Ensure `JWT_SECRET` is set in `.env`
- Run `php artisan config:clear` after changing JWT settings

### File Upload Fails
- Run `php artisan storage:link`
- Check `storage/app/public` permissions

### CORS Errors
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Clear config cache: `php artisan config:clear`

### Database Connection
- Verify MySQL credentials in `.env`
- Ensure database `messenger_db` exists
- Test connection: `php artisan migrate:status`

## Next Steps

- Deploy to AWS or another hosting provider
- Set up queue workers for background jobs
- Add rate limiting for API endpoints
- Implement WebSocket for real-time messaging
- Add email verification
- Create comprehensive test suite
