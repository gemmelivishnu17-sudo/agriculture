# Library Management API

A Node.js + Express + MongoDB backend for a Library Management System.

## Prerequisites
- Node.js 18+
- MongoDB database (local or MongoDB Atlas)

## Environment variables
Create a `.env` file in the `server/` folder with the following values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/librarymanagement
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## Run locally

```bash
npm install
npm run dev
```

The API will run on:
- http://localhost:5000

## API routes
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/me``
- `/api/books`
- `/api/books/:id`
- `/api/books/search`
- `/api/borrow`
- `/api/reading-list` (GET, POST, DELETE `/:bookId`)
- `/api/borrow/:id`
- `/api/borrow/:id/return`
- `/api/stats`

## Deployment notes
- Set `MONGO_URI` to your MongoDB Atlas connection string in production.
- Set `CLIENT_URL` to your deployed frontend origin (for example, `https://your-frontend.vercel.app`).
- For Render deployment, use the `start` script.
