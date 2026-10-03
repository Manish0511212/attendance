# Attendly QR Attendance

Cloud-based QR attendance management for Admin and Teacher users.

## Exact local commands

From the project root:

```bash
npm install
cd backend
npm install
cd ..
npm run seed
npm run server
```

In a second terminal:

```bash
npm run dev
```

Open `http://localhost:5173` and sign in with:

- Email: `admin@attendance.com`
- Password: `admin123`

## Environment

Copy `.env.example` to `.env` inside `backend/` and set `MONGODB_URI` to your MongoDB Atlas connection string. Set `JWT_SECRET`, `PORT=4000`, and `CLIENT_URL=http://localhost:5173`. The root `.env.example` contains `VITE_API_URL=http://localhost:4000/api`.

The server automatically runs the idempotent seed routine after connecting. `npm run seed` is also available for an explicit seed run and creates 50 students, five attendance records per student, eight-semester attendance summaries, and the demo admin user without duplicates.

## Features

- MongoDB-backed dashboard cards and Recharts reports
- 50 seeded Indian student records with unique QR values equal to `studentId`
- Student search, department/semester filters, profiles, QR generation, print, and download
- Camera QR scanning through `html5-qrcode`, plus manual token fallback
- Duplicate-safe same-day attendance with clear invalid QR/database errors
- Attendance history and filters by date, department, semester, subject, and status
- Vite frontend deployment and Express backend deployment ready
