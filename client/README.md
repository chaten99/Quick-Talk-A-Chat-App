# Quick Talk
A real-time chat application built with React, Node.js, Express, and Socket.IO. It supports user authentication, private messaging, group chats, and more.  

## Features
- User registration and Login through email/password and Google OAuth
- Will Update later with more features

## Tech Stack
- Frontend: React, TypeScript, Tailwind CSS, React Router, React Hook Form, Zod
- Backend: Node.js, Express, MongoDB, Redis, JWT, Bcrypt, Nodemailer, Google OAuth
- Will update later with more tech stack details

## Setup Instructions
### Backend
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `server` directory with the following content:
```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
EMAIL_PASS=app_password_for_your_email
EMAIL_USER=youremail@gmail.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
4. Start the server: `npm start`

If you want to run the backend in development mode with hot-reloading, use: `npm run dev`

If you want to run using Docker, make sure you have Docker installed and running, then execute: 
```
1. cd server
2. cd docker
3. docker-compose up --build
```

### Frontend
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `client` directory with the following content:
```
VITE_API_URL=http://localhost:3000/api
```
4. Start the development server: `npm run dev`

Making sure both the backend and frontend servers are running, you can access the application at `http://localhost:5173`.

Further working on the project, will update the README with more details on features, tech stack, and setup instructions.