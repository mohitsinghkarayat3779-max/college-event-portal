# College Event Portal

A full-stack web app for browsing and registering for college events, with a student dashboard and an admin panel — built with the **MERN** stack (MongoDB, Express, React, Node.js).

> Live URL: _add your deployed link here after hosting (see "Deploying" below)_

---

## Features

**Authentication**
- Student registration/login with hashed passwords (bcrypt) and JWT-based sessions
- Protected routes on both frontend (React Router guards) and backend (Express middleware)
- Separate admin role (seeded manually, not self-registerable, to prevent privilege escalation)

**Student Dashboard**
- Responsive grid of upcoming events with search, category filter, and upcoming/past filter
- Register / cancel registration with live seat-count updates
- "My Registrations" view
- Announcements strip showing the latest admin posts
- QR code generated per registration (for event check-in) — bonus feature
- Dark mode toggle — bonus feature
- Loading skeletons while data fetches — bonus feature

**Event Listing**
- Event cards and detail pages show banner image, description, date/time, venue, category,
  registration deadline, and live available-seat count

**Admin Panel**
- Create / edit / delete events
- View registrant list per event, with CSV export — bonus feature
- Publish / delete announcements (optionally linked to a specific event)
- Dashboard with quick stats (total events, upcoming events, seats filled)

---

## Tech stack

| Layer     | Choice                                             |
|-----------|-----------------------------------------------------|
| Frontend  | React 18 + Vite, React Router, Axios, qrcode.react  |
| Backend   | Node.js, Express                                    |
| Database  | MongoDB with Mongoose                               |
| Auth      | JWT (jsonwebtoken) + bcryptjs password hashing       |

Plain CSS (no UI framework) was used deliberately so every style decision is visible and
easy to modify — no black-box component library to fight with.

---

## Database schema

**User**
| Field    | Type   | Notes                          |
|----------|--------|---------------------------------|
| name     | String | required                        |
| email    | String | required, unique                |
| password | String | required, bcrypt-hashed          |
| role     | String | `student` \| `admin`, default `student` |

**Event**
| Field                | Type     | Notes |
|----------------------|----------|-------|
| title, description   | String   | required |
| bannerImage          | String   | image URL |
| date                 | Date     | event date |
| time                 | String   | display string, e.g. "5:00 PM" |
| venue                | String   | required |
| category             | String   | enum: Technical/Cultural/Sports/Workshop/Seminar/Other |
| registrationDeadline | Date     | required |
| totalSeats           | Number   | capacity at creation |
| availableSeats       | Number   | decremented atomically on registration |
| createdBy            | ObjectId | ref → User (admin who created it) |

**Registration**
| Field  | Type     | Notes |
|--------|----------|-------|
| user   | ObjectId | ref → User |
| event  | ObjectId | ref → Event |
| status | String   | `registered` \| `cancelled` |

A **unique compound index** on `(user, event)` means a student has at most one registration
document per event — cancelling and re-registering reuses/updates that same document instead
of creating duplicates, which keeps the seat-count math simple and race-condition-safe.

**Announcement**
| Field     | Type     | Notes |
|-----------|----------|-------|
| title, message | String | required |
| event     | ObjectId | ref → Event, optional (announcement can be general or event-specific) |
| createdBy | ObjectId | ref → User (admin) |

---

## Architecture decisions

- **Atomic seat booking.** Registering for an event uses a single `findOneAndUpdate` with the
  condition `availableSeats: { $gt: 0 }` combined with `$inc: -1`. This means two students
  registering for the last seat at the same moment can't both succeed — MongoDB's document-level
  atomicity prevents the overbooking race condition without needing manual locks or transactions.
- **Role separation.** `POST /api/auth/register` always creates a `student` account. There's no
  public "become an admin" endpoint — admins are created via the `npm run seed` script or directly
  in the database, which is a deliberate security boundary for a project like this.
- **Stateless auth.** JWTs are stored in `localStorage` on the client and sent as a Bearer token.
  This keeps the backend fully stateless (no server-side sessions), which simplifies horizontal
  scaling and deployment.
- **Soft-cancel registrations.** Cancelling sets `status: 'cancelled'` rather than deleting the
  document, preserving a full audit trail while still freeing the seat immediately.

---

## Running locally

### Prerequisites
- Node.js 18+
- A MongoDB instance — either a local install, or a free cluster at
  [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI to your MongoDB connection string, and JWT_SECRET to a long random string
npm install
npm run seed   # optional: creates an admin user (admin@college.edu / admin123) + one sample event
npm run dev    # starts the API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# .env already points VITE_API_URL at http://localhost:5000/api by default
npm install
npm run dev    # starts the app on http://localhost:5173
```

Open **http://localhost:5173** in your browser. Register a student account, or log in as the
seeded admin (`admin@college.edu` / `admin123`) to access `/admin`.

---

## Deploying

- **Backend:** Render, Railway, or Fly.io all work well for a plain Express app. Set the same
  environment variables from `.env` in your host's dashboard, and use MongoDB Atlas for the database.
- **Frontend:** Vercel or Netlify — set `VITE_API_URL` to your deployed backend URL, and run `npm run build`.
- Once deployed, remember to update your backend's `CLIENT_URL` env var (for CORS) and paste
  your live URL at the top of this README.

---

## Project structure

```
college-event-portal/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/          # User, Event, Registration, Announcement
│   │   ├── middleware/      # auth (JWT + admin guard), error handler
│   │   ├── controllers/     # business logic per resource
│   │   ├── routes/          # Express routers
│   │   ├── server.js
│   │   └── seed.js          # optional: seed an admin + sample event
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js     # pre-configured Axios instance + auth interceptor
    │   ├── context/         # AuthContext, ThemeContext (dark mode)
    │   ├── components/      # Navbar, route guards, EventCard, Skeleton
    │   ├── pages/            # Login, Register, Dashboard, EventDetails
    │   ├── pages/admin/      # AdminDashboard, ManageEvents, EventForm, EventRegistrations, ManageAnnouncements
    │   └── styles/index.css
    └── package.json
```
