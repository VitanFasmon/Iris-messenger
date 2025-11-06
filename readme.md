
# Iris Messenger

**Iris Messenger** is a modern, lightweight web-based chat platform designed for private communication between users.
It allows users to send messages, share media, manage friends, and even set messages to auto-delete after a specified time.

This project demonstrates a full-stack application using **Flask**, **React/Angular**, and **PostgreSQL** with **JWT authentication**.

---

## 🚀 Features

* **Private messaging**: One-to-one conversations between users
* **Timed message deletion**: Messages can be set to automatically delete after a chosen period
* **Media sharing**: Upload images, videos, audio, and files
* **Friend system**: Add friends and maintain a friend list
* **Unique usernames**: Each user has a unique identifier

---

## 🛠 Technology Stack

| Layer          | Technology            |
| -------------- | --------------------- |
| Frontend       | React or Angular      |
| Backend        | Python + Flask        |
| Database       | PostgreSQL            |
| Authentication | JWT (JSON Web Tokens) |

---

## 📂 Project Structure

```
/iris_messenger_backend
│
├── app.py                 # Flask entry point
├── config.py              # Database & JWT configuration
├── models/                # SQLAlchemy models
├── controllers/           # Route logic for auth, messages, friends
├── utils/                 # Helper functions (JWT, file handling, scheduler)
└── requirements.txt       # Python dependencies
/frontend                  # React or Angular frontend code
```

---

## 💾 Database

The project uses **PostgreSQL** with the following tables:

* `users` – stores registered user accounts
* `friends` – stores friend relationships and requests
* `messages` – stores messages with timestamps and deletion info
* `attachments` – stores media attached to messages

Relationships:

* Users can send and receive multiple messages
* Users can have multiple friends
* Messages can have multiple attachments

---

## 🔑 Setup & Installation

### 1. Clone the repository

```bash
git clone git@github.com:VitanFasmon/Iris-messenger.git
cd Iris-messenger
```

### 2. Backend setup

```bash
cd iris_messenger_backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure PostgreSQL

* Create a database named `iris_messenger`
* Update `config.py` with your PostgreSQL username and password

```python
SQLALCHEMY_DATABASE_URI = 'postgresql://username:password@localhost/iris_messenger'
```

### 4. Initialize the database

```bash
python
>>> from models import db, init_db
>>> init_db(app)  # if using Flask app context
```

### 5. Run the backend

```bash
flask run
```

### 6. Frontend setup

* Navigate to `/frontend`
* Install dependencies (`npm install`)
* Start the development server (`npm start`)

---

## 🛠 Usage

1. Register a new user
2. Log in with JWT authentication
3. Add friends and start private conversations
4. Send messages, files, and set a deletion time
5. View chat history and attached media

---

## 📚 Future Enhancements

* Real-time messaging via WebSockets (Flask-SocketIO)
* Message read receipts
* End-to-end encryption
* Dark mode and customizable UI themes
* User profile pictures and status messages

---

## 📄 License

This project is **open-source** for educational purposes. Feel free to clone, study, and modify for personal use.

---
