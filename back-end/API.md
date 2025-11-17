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
- **alice** / password123
- **bob** / password123  
- **charlie** / password123

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

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
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
    "created_at": "2025-11-17T12:00:00.000000Z"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Get Current User
```bash
GET /api/me
Authorization: Bearer {token}
```

#### Logout
```bash
POST /api/auth/logout
Authorization: Bearer {token}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Authorization: Bearer {token}
```

### Users

#### Search User by Username
```bash
GET /api/users/{username}
Authorization: Bearer {token}
```

#### Get User by ID
```bash
GET /api/users/id/{id}
Authorization: Bearer {token}
```

### Friends

#### Get Friends List
```bash
GET /api/friends
Authorization: Bearer {token}
```

Returns all accepted friendships.

#### Get Pending Friend Requests
```bash
GET /api/friends/pending
Authorization: Bearer {token}
```

Returns friend requests you've received.

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

Returns all messages between you and the specified user (both directions).

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

#### Delete Message
```bash
DELETE /api/messages/{message_id}
Authorization: Bearer {token}
```

Only the sender can delete their own messages.

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

## File Uploads

Files are stored in `storage/app/public/uploads/`. Make sure to create the symbolic link:

```bash
php artisan storage:link
```

Files will be accessible at `http://127.0.0.1:8000/storage/uploads/...`

## CORS Configuration

By default, CORS is configured to allow requests from `http://localhost:3000` (React dev server).

To change this, update `FRONTEND_URL` in your `.env`:

```
FRONTEND_URL=http://localhost:3000
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
├── Http/Controllers/Api/
│   ├── AuthController.php           # Authentication endpoints
│   ├── FriendController.php         # Friend management
│   ├── MessageController.php        # Messaging & file uploads
│   └── UserController.php           # User search/profile
└── Models/
    ├── User.php                      # User model with JWT
    ├── Friend.php                    # Friend relationship model
    ├── Message.php                   # Message model with expiry scopes
    └── Attachment.php                # File attachment model

database/
├── migrations/
│   └── 2025_11_17_001500_create_iris_messenger_schema_mysql.php
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
