# Iris Messenger – Project Documentation

## Project Overview

This is a modern, lightweight web-based chat platform that focuses on private communication between users. The main idea is to provide a secure space for users to send messages, share media, and control how long their messages remain visible through a timed deletion feature.

### Key Features

- Private one-to-one messaging
- Message deletion after a custom time window
- File, image, audio, and video sharing
- Friend list management
- Unique usernames for each user

## Technology Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| **Frontend** | React | Provides user interface, handles API communication |
| **Backend** | Laravel | REST API, authentication, and message handling |
| **Database** | MySQL | Stores user data, messages, and friend relationships |
| **Authentication** | JWT (JSON Web Token) | Token-based authentication for secure access |

## Functional Breakdown

| Feature | Backend Responsibilities | Frontend Responsibilities |
|---------|-------------------------|---------------------------|
| **User Authentication** | Register/login users, hash passwords, generate JWT tokens | Manage token in local storage, redirect on login |
| **Private Messaging** | Handle message creation and retrieval via API | Display message history, send and receive messages |
| **Timed Message Deletion** | Store expiry timestamps, auto-delete expired messages | Allow sender to set deletion time |
| **File/Media Sharing** | Save uploaded files, store file path/URL | Upload and preview attachments |
| **Friends System** | Manage friend requests and relationships | Show friend list, add/remove friends |
| **Unique Username** | Enforce unique usernames in database | Validate input during registration |

## Backend Structure

The backend will be organized using a clear separation of concerns, following a **Model–Controller–Utility** approach.

### Database Design (MySQL)

The database schema implements the following tables:

#### Table: `users`

Stores all registered user accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UNSIGNED INT | PRIMARY KEY, AUTO_INCREMENT | Unique user ID |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Unique username per user |
| `email` | VARCHAR(100) | UNIQUE, NULLABLE | Optional email for login |
| `password_hash` | TEXT | NOT NULL | Hashed user password |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | User registration date |

#### Table: `friends`

Represents friendship or friend requests between users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UNSIGNED INT | PRIMARY KEY, AUTO_INCREMENT | Unique friendship record ID |
| `user_id` | UNSIGNED INT | FOREIGN KEY → users.id | User who sent the friend request |
| `friend_id` | UNSIGNED INT | FOREIGN KEY → users.id | User who received the friend request |
| `status` | VARCHAR(20) | NULLABLE | Status: 'pending' / 'accepted' |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Timestamp when friendship action occurred |

#### Table: `messages`

Stores messages exchanged between users, including content and timing info.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UNSIGNED INT | PRIMARY KEY, AUTO_INCREMENT | Unique message ID |
| `sender_id` | UNSIGNED INT | FOREIGN KEY → users.id | Sender of the message |
| `receiver_id` | UNSIGNED INT | FOREIGN KEY → users.id | Receiver of the message |
| `content` | TEXT | NULLABLE | Message text content |
| `file_url` | TEXT | NULLABLE | Attachment file path or URL |
| `timestamp` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Time message was sent |
| `delete_after` | UNSIGNED INT | NULLABLE | Seconds until auto-deletion (MySQL mapping of INTERVAL) |
| `expires_at` | TIMESTAMP | NULLABLE | Timestamp when message should expire |
| `is_deleted` | BOOLEAN | DEFAULT FALSE | True if deleted or expired |

#### Table: `attachments`

Stores media or files attached to messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UNSIGNED INT | PRIMARY KEY, AUTO_INCREMENT | Unique attachment ID |
| `message_id` | UNSIGNED INT | FOREIGN KEY → messages.id | Message this file belongs to |
| `file_type` | VARCHAR(20) | NULLABLE | Type: 'image' / 'video' / 'audio' / 'file' |
| `file_url` | TEXT | NULLABLE | File storage path or URL |

#### Database Relationships

```
users (1) ──< (many) friends.user_id
users (1) ──< (many) friends.friend_id
users (1) ──< (many) messages.sender_id
users (1) ──< (many) messages.receiver_id
messages (1) ──< (many) attachments.message_id
```

**Notes:**
- `delete_after` is stored as seconds (UNSIGNED INT) in MySQL since MySQL doesn't support PostgreSQL's INTERVAL type
- All foreign keys enforce referential integrity between tables
- The `friends` table uses a simple status field to track pending vs. accepted friendships

### Authentication Flow

1. User registers or logs in via the API
2. Laravel verifies credentials and issues a JWT token
3. The frontend stores this token (in localStorage or memory)
4. Each subsequent API request includes the token in the header
5. The backend validates the token and retrieves the user ID for that request

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Log in and receive JWT |
| `GET /api/users/:username` | Search for a specific user |
| `POST /api/friends/:id` | Send a friend request |
| `GET /api/friends` | List user's friends |
| `POST /api/messages/:receiver_id` | Send message or file |
| `GET /api/messages/:receiver_id` | Retrieve chat history |
| `DELETE /api/messages/:id` | Delete a message manually |
| `GET /api/me` | Get logged-in user profile |

## Frontend Structure

### Main Components

- **Login/Register Page** – Handles user authentication
- **Dashboard** – Shows friends and recent chats
- **Chat Window** – Displays messages and allows sending
- **Friend List / Add Friend Modal** – Manage friend connections
- **File Upload Component** – Upload and send attachments
- **Settings / Profile Page** – Manage account preferences

### Communication

- Uses REST API
- Stores JWT token securely for authenticated requests

## Timed Message Deletion Logic

A background daemon periodically runs a cleanup task that:

1. Finds all messages where `expires_at < NOW()` and `is_deleted = FALSE`
2. Deletes them permanently (or marks them as deleted)

This will be implemented using Laravel's scheduler or queue system.

## Version Control

- **Git** (GitHub)

## Hosting

- **AWS** (Probably)

---

*Last updated: November 17, 2025*
