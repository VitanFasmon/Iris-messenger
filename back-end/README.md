<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

---

## Iris Messenger Backend

This is the Laravel REST API backend for the Iris Messenger application - a private chat platform with timed message deletion and media sharing.

### Features Implemented

✅ **JWT Authentication** - Secure token-based auth with login/register/logout  
✅ **User Management** - User profiles and search by username  
✅ **Friend System** - Send/accept/reject friend requests  
✅ **Private Messaging** - One-to-one chat with message history  
✅ **Timed Deletion** - Auto-delete messages after custom time windows  
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
