# Quick Talk

Quick Talk is a full-stack real-time chat application covering direct messaging, group chats, friend systems (invitation flow), notifications, presence tracking, and Google OAuth.

The frontend is built with React and Vite, while the backend uses Express, MongoDB, Redis, and Socket.IO to handle real-time communication and state.

---

## Features

* Email/password authentication with OTP ve/rification (OTP stored in Redis)

* Google OAuth login and signup

* JWT-based authentication using HTTP-only cookies

* Friend system (invitation flow):

  * search users (username/email, supports partial matching)
  * send, accept, reject, and cancel friend requests
  * unfriend users
  * in-app notifications for requests
  * 24-hour cooldown after rejection to prevent spam

* Direct messaging between friends

* Group conversations with name, avatar, and member selection

* Real-time messaging using Socket.IO

* Typing indicators

* Message delivery and read receipts

* Seen-by tracking for group messages

* Online/offline presence with last seen

* Unread message counts with live conversation reordering

* In-app notifications

* Profile updates with avatar upload (Cloudinary)

* Swagger API documentation

---

## Tech Stack

### Frontend

* React 19 with TypeScript — keeps UI logic predictable
* Vite — fast dev server and build tool
* Tailwind CSS — quick styling without heavy CSS setup
* Zustand — lightweight state management
* React Router — routing
* React Hook Form + Zod — form handling with validation
* Axios — API communication
* Socket.IO Client — real-time communication with backend

---

### Backend

* Node.js + Express — API and server logic
* MongoDB with Mongoose — flexible schema for chats and messages
* Redis — used for:

  * OTP storage with expiry
  * online presence tracking
  * caching
  * Socket.IO adapter (scaling)
* Socket.IO — real-time messaging and events
* JWT — authentication via cookies
* Bcrypt — password hashing
* Nodemailer — sending OTP emails
* Google OAuth — external authentication
* Cloudinary — avatar uploads
* Swagger — API documentation

---

## Project Structure

```text
Quick Talk/
├── client/   # React frontend
└── server/   # Express API, Socket.IO, MongoDB, Redis
```

---

## Local Development

### 1. Start the backend

```bash
cd server
npm install
npm run dev
```

Backend runs on:
[http://localhost:3000](http://localhost:3000)

---

### 2. Start the frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on:
[http://localhost:5173](http://localhost:5173)

---

### 3. Swagger docs

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Environment Variables

### Backend (`server/.env`)

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
JWT_SECRET=your_jwt_secret

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
NODE_ENV=development

EMAIL_USER=youremail@example.com
EMAIL_PASS=your_email_app_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Real-Time Architecture Notes

Socket.IO handles:

* message delivery
* typing indicators
* unread count updates
* conversation reordering
* presence updates
* read and seen tracking

Redis is used for:

* tracking online users efficiently
* OTP expiration handling
* caching frequently used data
* enabling horizontal scaling with Socket.IO adapter

---

## Production Setup (Google OAuth)

You need to configure two URLs:

* `FRONTEND_URL` — where the client runs
* `BACKEND_URL` — where Google redirects after login

Example:

```env
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com
NODE_ENV=production
```

---

### Google Console Configuration

Authorized JavaScript origins:

```text
http://localhost:5173
https://your-frontend-domain.com
```

Authorized redirect URIs:

```text
http://localhost:3000/api/auth/google/callback
https://your-backend-domain.com/api/auth/google/callback
```

Important:

* Redirect URI must point to the backend
* Use HTTPS in production or cookies will not work properly

---

## API Overview

Main route groups:

* /api/auth
* /api/profile
* /api/friends
* /api/conversations
* /api/messages
* /api/notifications

See Swagger for full request/response details.

---

## Notes

* Direct messaging is limited to friends
* If users unfriend each other:
  * chat history remains
  * messaging is blocked until they reconnect
* Group chats support typing indicators and seen-by tracking
* Friend requests act as the invitation system between users

---

## Summary

This project focuses on building a practical real-time system, including presence tracking, message state management (sent, delivered, read), invitation control (friend requests with cooldown), and combining multiple authentication flows in one application.

---