# Iris Messenger API

A secure, ephemeral messaging API built with Laravel 12, featuring JWT authentication, profile management, and friend-based communication.

## 🌟 Features

- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Profile Management** - User profile pictures with automatic cleanup and last online tracking
- **Friend System** - Send, accept, reject, and remove friend requests
- **Ephemeral Messages** - Messages with automatic expiration (24h, 7d, 30d, or permanent)
- **File Attachments** - Upload files with messages (images, documents, etc.)
- **User Presence** - Automatic "last online" tracking with 5-minute rate limiting
- **Comprehensive Testing** - 65 feature tests with 100% endpoint coverage

## 🛠️ Tech Stack

- **Framework**: Laravel 12.38.1
- **Language**: PHP 8.3.6
- **Database**: MySQL 8.x
- **Authentication**: JWT (php-open-source-saver/jwt-auth v2.8.3)
- **Testing**: PHPUnit with Feature Tests
- **Storage**: Laravel Public Disk for file uploads

## 📋 Prerequisites

- PHP 8.3 or higher
- Composer
- MySQL 8.x or higher
- Node.js & npm (for frontend integration)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
cd back-end
composer install
```

### 2. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```


### 3. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE messenger_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
php artisan migrate

# Seed test data (optional)
php artisan db:seed
```

### 4. Storage Setup

```bash
php artisan storage:link
```

If file uploads fail or are unexpectedly small, increase PHP limits (and restart PHP-FPM/web server if applicable):

```
upload_max_filesize = 10M
post_max_size = 12M
```

### 5. Start Development Server

```bash
php artisan serve
```

The API will be available at `http://127.0.0.1:8000/api`

**Alternative options:**

```bash
# Custom host and port
php artisan serve --host=127.0.0.1 --port=9000

# Or use PHP built-in server directly
php -S 127.0.0.1:8000 -t public
```

**Note:** After changing configuration files (like `config/cors.php` or `.env`), clear the config cache:

```bash
php artisan config:clear
php artisan cache:clear
php artisan optimize:clear
```

Then restart the server (Ctrl+C and rerun `php artisan serve`).

### 6. Run Tests

```bash
php artisan test
```

Expected output: **65 tests passing**

## 📚 API Documentation

Full API documentation is available in [API.md](API.md).

### Base URL

```
http://127.0.0.1:8000/api
```

### Authentication Endpoints (Updated Nov 2025)

- `POST /auth/register` – Register (optional profile picture)
- `POST /auth/login` – Login and receive JWT
- `POST /auth/logout` – Invalidate token
- `POST /auth/refresh` – Refresh JWT (updates presence)
- `POST /auth/password` – Change password (current + new)
- `GET /me` – Authenticated user info

### User Endpoints

- `GET /users/{username}` – Exact username lookup
- `GET /users/id/{id}` – User by id

### Profile Endpoints

- `PATCH /profile` – Update username/email
- `POST /profile/picture` – Upload/update profile picture (multipart)
- `DELETE /profile/picture` – Delete profile picture

### Friend Endpoints

- `GET /friends` – Accepted friends
- `GET /friends/pending` – Incoming pending requests
- `GET /friends/outgoing` – Outgoing requests (sent by user)
- `POST /friends/{id}` – Send friend request
- `POST /friends/{id}/accept` – Accept pending request
- `DELETE /friends/{id}` – Reject pending or remove friendship

### Message Endpoints

- `GET /messages/last` – Aggregated last message per friend (performance)
- `GET /messages/{receiver_id}` – Full direct thread
- `POST /messages/{receiver_id}` – Send message/file (optional `delete_after` seconds)
- `DELETE /messages/{id}` – Delete own message
- `GET /messages/download/{id}` – Download attachment with original filename

## 🧪 Test User Credentials

Three test users are seeded automatically:

| Username | Password | Profile Picture | Last Online |
|----------|----------|----------------|-------------|
| alice | password | Avatar 1 | ~10 min ago |
| bob | password | Avatar 2 | ~5 min ago |
| charlie | password | Avatar 3 | ~2 hours ago |

**Seeded Relationships:**
- Alice ↔️ Bob (friends)
- Alice ↔️ Charlie (friends)
- Bob → Charlie (pending request)

## 📂 Project Structure

```
back-end/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php      # Registration, login, JWT
│   │   │   ├── FriendController.php    # Friend management
│   │   │   ├── MessageController.php   # Messaging
│   │   │   ├── ProfileController.php   # Profile pictures
│   │   │   └── UserController.php      # User search/info
│   │   └── Middleware/
│   │       └── UpdateLastOnline.php    # Auto-update last_online
│   └── Models/
│       ├── User.php                    # User model with JWT
│       ├── Friend.php                  # Friend relationships
│       └── Message.php                 # Messages with expiration
├── database/
│   ├── migrations/                     # Schema definitions
│   └── seeders/
│       └── DatabaseSeeder.php          # Test data
├── routes/
│   └── api.php                         # API routes
├── tests/
│   └── Feature/
│       ├── AuthTest.php                # Authentication tests (7)
│       ├── FriendTest.php              # Friend system tests (19)
│       ├── MessageTest.php             # Messaging tests (23)
│       └── ProfileTest.php             # Profile features tests (16)
├── storage/
│   └── app/
│       └── public/
│           ├── profile_pictures/       # User profile images
│           └── uploads/                # Message attachments
└── public/
    └── storage/                        # Symlink to storage/app/public
```

## 🔒 Security Features

- **JWT Authentication** - Stateless, secure token-based auth
- **Password Hashing** - Bcrypt with configurable rounds
- **CORS Protection** - Configurable allowed origins
- **File Upload Validation** - Type and size restrictions
- **Rate Limiting** - Prevents excessive last_online updates (5-minute threshold)
- **Input Validation** - All requests validated with Laravel's validator

## 📊 Database Schema

### Users Table
- `id`, `username` (unique), `email` (unique), `password_hash`
- `profile_picture_url` (nullable), `last_online` (nullable timestamp)
- Automatic timestamps: `created_at`, `updated_at`

### Friends Table
- `id`, `user_id`, `friend_id`, `status` (pending/accepted)
- Unique constraint: One friendship per user pair
- Automatic timestamps

### Messages Table
- `id`, `sender_id`, `receiver_id`, `content`, `file_path` (nullable)
- `expires_at` (nullable), `created_at`
- Indexes on sender_id, receiver_id for fast queries

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   ```bash
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-domain.com
   JWT_SECRET=<strong-random-secret>
   DB_PASSWORD=<secure-password>
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. **Optimize Laravel**
   ```bash
   composer install --optimize-autoloader --no-dev
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **Database**
   ```bash
   php artisan migrate --force
   ```

4. **File Permissions**
   ```bash
   chmod -R 775 storage bootstrap/cache
   chown -R www-data:www-data storage bootstrap/cache
   ```

5. **Web Server**
   - Point document root to `public/` directory
   - Configure HTTPS with valid SSL certificate
   - Set up proper CORS headers

## 📖 Additional Documentation

- [API.md](API.md) - Complete API reference with examples
- [vision/vision.md](vision/vision.md) - Project requirements and architecture
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Technical implementation details
- [PROFILE_FEATURES.md](PROFILE_FEATURES.md) - Profile features documentation
- [Postman Collection](Iris_Messenger_API.postman_collection.json) - Import into Postman for testing

## 🧪 Testing

The project includes comprehensive feature tests covering all endpoints:

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage (requires Xdebug)
php artisan test --coverage
```

**Test Coverage:**
- Authentication: 7 tests
- Friend System: 19 tests  
- Messaging: 23 tests
- Profile Features: 16 tests
- **Total: 65 tests**

## 🤝 Contributing

This is an academic project. For suggestions or issues, please contact the development team.

## 📄 License

Academic project - All rights reserved.

## 👥 Authors

Developed as part of Web Technologies course, University of Ljubljana, Faculty of Computer and Information Science.

---

**Last Updated**: November 2025  
**Version**: 1.1.0  
**Laravel Version**: 12.38.1

---

## Iris Messenger Backend

This is the Laravel REST API backend for the Iris Messenger application - a private chat platform with timed message deletion and media sharing.

### Features Implemented (Current)

✅ **JWT Authentication** - Secure token-based auth with login/register/logout  
✅ **User Management** - User profiles and search by username  
✅ **Friend System** - Send/accept/reject friend requests  
✅ **Private Messaging** - One-to-one chat with message history  
✅ **Timed Deletion** - Auto-delete messages after custom time windows (scheduled cleanup every minute)  
✅ **Aggregated Previews** - `/messages/last` endpoint for friend list performance  
✅ **Outgoing Requests** - `/friends/outgoing` to surface sent pending requests  
✅ **Password Change** - Secure endpoint for updating password  
✅ **Profile Update** - Patch username/email
✅ **File Uploads** - Image, video, audio, and file attachments  
✅ **Message Scheduler** - Automated cleanup of expired messages  
✅ **CORS Support** - Ready for React frontend integration  

### Quick Start

```bash
# Install dependencies
composer install

# Configure environment
cp .env.example .env
# Edit .env and set DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Generate keys
php artisan key:generate
php artisan jwt:secret

# Run migrations and seed test data
php artisan migrate --seed

# Start server
php artisan serve
```

**Test Users:** alice, bob, charlie (all use password: `password123`)

### API Documentation

See [API.md](API.md) for complete endpoint documentation and examples.

**Key Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/friends` - Get friends list
- `POST /api/messages/{receiver_id}` - Send message/file
- `GET /api/messages/{receiver_id}` - Get chat history

### Automated Message Deletion

Messages with `delete_after` set will auto-expire. Enable the scheduler:

```bash
# Development (runs scheduler continuously)
php artisan schedule:work

# Production (add to crontab)
* * * * * cd /path/to/back-end && php artisan schedule:run >> /dev/null 2>&1
```

Or run manually:
```bash
php artisan messages:delete-expired
```

### File Storage

Enable public file access:
```bash
php artisan storage:link
```

Files are stored in `storage/app/public/uploads/` and accessible at `/storage/uploads/...`

Attachments are served via a download endpoint to preserve the original filename and enforce authorization. Consider keeping executable types disabled in production unless you exclusively serve files through the download endpoint.

### Tech Stack

- **Laravel 12** - PHP framework
- **JWT Auth** - Token-based authentication  
- **MySQL** - Database
- **Eloquent ORM** - Database relationships
- **Laravel Scheduler** - Automated tasks

### Project Structure

```
app/
├── Console/Commands/DeleteExpiredMessages.php
├── Http/Controllers/Api/
│   ├── AuthController.php
│   ├── FriendController.php
│   ├── MessageController.php
│   └── UserController.php
└── Models/
    ├── User.php (with JWTSubject)
    ├── Friend.php
    ├── Message.php
    └── Attachment.php

database/
├── migrations/2025_11_17_001500_create_iris_messenger_schema_mysql.php
└── seeders/DatabaseSeeder.php

routes/api.php - All API routes with JWT middleware
```

### Development

Run tests:
```bash
php artisan test
```

Clear caches:
```bash
php artisan config:clear
php artisan cache:clear
```

### Vision Document

See [vision/vision.md](vision/vision.md) for complete project requirements and architecture.

---

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Project setup (Iris Messenger)

Quick steps to run this back-end locally inside the Iris Messenger monorepo:

1. From the repo root, change into this folder:
	- `cd back-end`
2. Install dependencies (needed after a fresh clone):
	- `composer install`
3. Create your environment file and app key:
	- `cp .env.example .env`
	- `php artisan key:generate`
4. Configure your database in `.env` and run migrations:
	- For quick local use, keep SQLite (ensure `database/database.sqlite` exists)
	- `php artisan migrate`
5. Start the local server:
	- `php artisan serve` then open <http://127.0.0.1:8000>

Run tests at any time with:

- `php artisan test`
