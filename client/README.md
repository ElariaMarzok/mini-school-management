# Mini School Management System

Full-stack school management system built with the MERN stack.

## Tech Stack
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
- Frontend: React (Vite), Tailwind CSS, React Router, Axios, Recharts

## Project Structure

school-management/
├── server/ # Express REST API
└── client/ # React application


## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
npm run seed            # creates the first Admin user
npm run dev
```
Runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd client
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api
npm run dev
```
Runs on `http://localhost:5173`.

## Roles
- **Admin**: full access to students, grades/classes, attendance and dashboard.
- **Teacher**: views and records attendance only for their assigned class.

## Key Features
- JWT authentication with role-based route protection (backend middleware + frontend ProtectedRoute)
- Student CRUD with search (name/code/phone) and grade/class filters, soft delete (Deactivate)
- Grades & Classes management with live student counts and bulk student assignment
- Daily attendance sheet (upsert-based save, editable) and per-student attendance history
- Admin dashboard with summary cards and a 7-day attendance bar chart; lighter Teacher summary view

## API Overview
See `server/src/routes/*.js` for the full list of endpoints (`/api/auth`, `/api/grades`, `/api/classes`, `/api/students`, `/api/attendance`, `/api/dashboard`).