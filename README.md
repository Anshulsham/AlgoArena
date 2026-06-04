# AlgoArena

AlgoArena is a full-stack coding practice platform built for solving programming problems, submitting code, tracking progress, and discussing approaches with other learners. It combines a LeetCode-style problem workspace with authentication, code execution, AI-assisted help, discussions, and solution media support.

## Features

- User authentication with secure cookie-based sessions
- Problem listing, problem detail pages, and difficulty-based practice
- In-browser code editor powered by Monaco Editor
- Code run and submission flow using Judge0
- Submission history and solved-problem tracking
- Problem of the Day support
- AI chat assistance for problem-solving guidance
- Discussion posts, comments, and voting
- Admin tools for problem and solution video management
- Cloudinary integration for video storage

## Tech Stack

- **Frontend:** React, Vite, Redux Toolkit, React Router, Tailwind CSS, DaisyUI, Monaco Editor
- **Backend:** Node.js, Express, MongoDB, Mongoose, Redis, JWT, bcrypt
- **Services:** MongoDB Atlas, Redis Cloud, Judge0, Gemini AI, Cloudinary
- **Deployment:** AWS EC2, Nginx, PM2, Certbot SSL

## Project Structure

```text
AlgoArena/
├── backend/     # Express API server
└── frontend/    # React Vite client
```

## Environment Setup

Create environment files locally or on your server. Do not commit real `.env` files.

Backend example:

```env
PORT=3000
NODE_ENV=production
ALLOWED_ORIGIN=https://yourdomain.com
COOKIE_SECURE=true
DB_CONNECT_STRING=your_mongodb_connection_string
JWT_KEY=your_jwt_secret
REDIS_PASS=your_redis_password
JUDGE0_KEY=your_judge0_key
GEMINI_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Frontend example:

```env
VITE_API_URL=/api
```

For local frontend development, use:

```env
VITE_API_URL=http://localhost:3000
```

## Running Locally

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Production Notes

The deployed app uses Nginx to serve the frontend and proxy API requests:

```text
https://yourdomain.com/api/* -> http://localhost:3000/*
```

In production, keep:

```env
VITE_API_URL=/api
ALLOWED_ORIGIN=https://yourdomain.com
COOKIE_SECURE=true
```

## License

This project is for learning and portfolio use.
