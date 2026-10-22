run this web site# Library Management Application

A complete library management system built with React, Vite, Express, and MongoDB. The application helps library visitors browse available books, register/login, borrow books, and track borrowing records. Admin users can manage the catalog, monitor borrow records, and view library statistics.

## Project Overview

This project is designed for a real-world library environment where:
- visitors can view book categories and search the collection
- members can register and log in
- users can borrow and return books
- admins can add, edit, and remove books
- admins can track active loans, overdue issues, and library performance

## Main Features

### For Visitors
- homepage with library branding and overview
- browse and search books
- view detailed book information
- contact page for questions or support

### For Members
- sign up and login
- view available books
- borrow available books
- check personal borrowing history
- return borrowed books

### For Admins
- add new books
- update existing book information
- remove outdated or damaged books
- review and manage all borrow records
- track statistics such as total books, available copies, borrowed books, overdue items, and members

## Technology Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT (JSON Web Token)
- API communication: Axios

## Project Structure

```text
librarymanagement/
├── client/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── README.md
│   └── package.json
└── README.md
```

## Installation

### 1. Install frontend dependencies

```bash
cd librarymanagement/client
npm install
```

### 2. Install backend dependencies

```bash
cd ../server
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `server/` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/librarymanagement
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## Run the Application

### Start the backend

```bash
cd librarymanagement/server
npm run dev
```

### Start the frontend

```bash
cd librarymanagement/client
npm run dev -- --host 0.0.0.0
```

Then open:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Important Project Details

### Why this is a good project
This project is valuable because it covers several real-world software development areas:
- user authentication and authorization
- CRUD operations for books
- borrowing and returning logic
- role-based access for members and admin
- API design and data modeling
- frontend + backend integration
- dashboard and analytics tracking

### Important application concepts used
- JWT authentication for protected routes
- MongoDB schemas for users, books, and borrow records
- Express controllers and routes for clean API structure
- React Router for page navigation
- Tailwind CSS for modern styling

## Potential Future Enhancements

- add book cover images
- add email notifications for overdue books
- add advanced filters and sorting
- add search suggestions and a reading history page
- add admin login dashboard widgets
- deploy the app on Vercel/Render

## Final Project Summary

This library management application is a complete and practical project that demonstrates both frontend and backend development. It is suitable for academic, training, or portfolio purposes because it includes the main features of a modern digital library system and shows a strong understanding of application architecture, data flow, and user experience.
