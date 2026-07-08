# LeaveDesk — Employee Leave Management System

A full-stack MVP that digitizes employee leave requests: employees apply and track leave, managers review and approve/reject with comments, and both get a role-aware dashboard. Built for the Full Stack Developer Intern practical assessment.

## Project Overview

Employees currently request leave over email/spreadsheets, causing delays and no visibility into status. LeaveDesk replaces that with:
- A single source of truth for leave requests and their approval state
- Role-based dashboards (Employee vs Manager)
- Search/filter across leave history
- JWT-secured REST API with input validation and consistent error handling

## Features

**Authentication**
- Email/password login, JWT access + refresh tokens, protected routes, role-based access control, logout, validation, and clear error messages for invalid credentials.

**Employee module**
- Login, dashboard, apply for leave, view/search/filter leave history, edit or cancel *pending* requests, see manager comments on reviewed requests.

**Manager module**
- Login, dashboard, view pending approvals, review full leave details, approve or reject (rejection requires a comment), search/filter team employees and requests, view any team member's leave history.

**Dashboards**
- Employee: total / approved / pending / rejected counts + recent activity.
- Manager: same, scoped to their team, plus a quick link into Pending Approvals.

**Bonus features implemented**
- JWT refresh tokens
- Role-Based Access Control (RBAC) at both the route and data level
- Search & filtering (leave history, pending approvals, employees)
- Leave balance tracking (decremented automatically on approval)
- Audit logs (login, create/edit/cancel/approve/reject actions)
- Fully responsive, mobile-friendly UI

## Technology Stack

| Layer      | Choice                                                                 |
|------------|-------------------------------------------------------------------------|
| Frontend   | React 19 (Vite), React Router, Tailwind CSS, Axios                     |
| Backend    | Node.js, Express                                                        |
| Database   | SQLite via Node's built-in `node:sqlite` module (zero native deps/setup)|
| Auth       | JSON Web Tokens (access + refresh), bcrypt password hashing            |
| Validation | express-validator (backend), inline client-side validation (frontend)  |
| Docs       | OpenAPI 3.0 spec + Postman collection                                  |

> **Why `node:sqlite`?** It's Node's built-in SQLite driver (stable since Node 22.5), so there's no native compilation step, no separate DB server to install, and the project runs immediately after `npm install` on any machine with Node 22+. The schema/queries are written in plain SQL, so migrating to PostgreSQL/MySQL later only means swapping the driver.

## Folder Structure

```
leave-management-system/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # SQLite connection + schema (DDL)
│   │   ├── models/                # Employee, Leave, AuditLog data access
│   │   ├── middleware/             # auth (JWT + RBAC), validation, error handler
│   │   ├── controllers/            # request handlers
│   │   ├── routes/                 # Express routers
│   │   ├── utils/                  # jwt helpers, logger
│   │   ├── seed.js                 # sample data seeder
│   │   ├── app.js                  # Express app wiring
│   │   └── server.js               # entry point
│   ├── database/                   # SQLite file lives here (gitignored)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/             # Navbar, Layout, ProtectedRoute, StatusBadge, Spinner
│   │   ├── pages/                  # Login, Dashboard, ApplyLeave, LeaveHistory,
│   │   │                           # PendingApprovals, Profile, NotFound
│   │   ├── context/AuthContext.jsx
│   │   ├── services/api.js         # Axios instance + token refresh interceptor
│   │   ├── App.jsx                 # routes
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── openapi.yaml                # OpenAPI 3.0 spec
│   └── DATABASE.md                 # ER diagram + schema notes
├── postman/
│   └── LeaveManagementSystem.postman_collection.json
└── README.md
```

## Installation & Setup

### Prerequisites
- **Node.js 22.5+** (required for the built-in `node:sqlite` module — check with `node -v`)
- npm 10+

### 1. Clone and install

```bash
git clone <your-repo-url>
# Leave Management System

A full-stack leave management application with a React frontend and Node.js backend.

## Run locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Push this project to GitHub.
3. Install the GitHub Pages deploy tool:

```bash
cd frontend
npm install --save-dev gh-pages
```

4. Deploy the frontend:

```bash
npm run deploy
```

The site will be available at:

https://<your-username>.github.io/LeaveDesk/

## Deploy the backend to Render

1. Create a Render account and connect this GitHub repository.
2. Create a new Web Service using the backend folder.
3. Use these settings:
   - Build Command: npm install
   - Start Command: npm start
4. Add these environment variables:
   - NODE_ENV=production
   - CLIENT_ORIGIN=https://<your-username>.github.io
5. After deployment, the API will be available at:

https://leavedesk-api.onrender.com/api/health

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

**backend/.env** (copy from `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development
DB_PATH=./database/leave_management.db
JWT_SECRET=change_this_to_a_long_random_secret_in_production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=change_this_to_a_different_long_random_secret
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

**frontend/.env** (copy from `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup

No separate database server needed — SQLite is created automatically as a file on first run. To seed it with sample data:

```bash
cd backend
npm run seed
```

This creates one manager and two employees (credentials below) with a mix of pending/approved/rejected leave requests.

### 4. Running the Application

**Backend** (from `backend/`):
```bash
npm run dev     # with nodemon, auto-restarts on changes
# or
npm start       # plain node
```
Runs on `http://localhost:5000`. Health check: `GET http://localhost:5000/api/health`.

**Frontend** (from `frontend/`, in a separate terminal):
```bash
npm run dev
```
Runs on `http://localhost:5173`.

Open `http://localhost:5173` in your browser.

### Sample Login Credentials

| Role     | Email                  | Password      |
|----------|-------------------------|---------------|
| Manager  | manager@company.com     | Password@123  |
| Employee | employee@company.com    | Password@123  |
| Employee | priya@company.com       | Password@123  |

(The Login page also has "Fill Employee" / "Fill Manager" buttons for a quick demo.)

## API Documentation

- **OpenAPI spec:** `docs/openapi.yaml` — import into [Swagger Editor](https://editor.swagger.io/) or any OpenAPI-compatible tool.
- **Postman collection:** `postman/LeaveManagementSystem.postman_collection.json` — import into Postman, set the `baseUrl` variable (defaults to `http://localhost:5000/api`), log in via the Auth folder, then copy the returned `accessToken` into the collection's `accessToken` variable to authorize subsequent requests.
- **Database schema:** `docs/DATABASE.md` — ER diagram, column-level constraints, indexing strategy, normalization notes.

### Endpoint Summary

| Method | Endpoint                    | Access          | Description                          |
|--------|------------------------------|-----------------|----------------------------------------|
| POST   | /api/auth/login              | Public          | Login, returns JWT access+refresh      |
| POST   | /api/auth/logout             | Authenticated   | Logout                                 |
| POST   | /api/auth/refresh            | Public          | Exchange refresh token for new access  |
| GET    | /api/auth/me                 | Authenticated   | Current user profile                   |
| GET    | /api/employees                | Manager         | List all employees (search/filter)     |
| POST   | /api/employees                | Manager         | Create a new employee account          |
| GET    | /api/employees/:id            | Authenticated   | Get an employee profile                |
| POST   | /api/leaves                   | Employee        | Apply for leave                        |
| GET    | /api/leaves                   | Authenticated   | List leaves (own, or team if manager)  |
| GET    | /api/leaves/:id                | Authenticated   | Get leave detail                       |
| PUT    | /api/leaves/:id                | Employee (owner)| Edit a pending leave                   |
| DELETE | /api/leaves/:id                | Employee (owner)| Cancel a pending leave                 |
| GET    | /api/leaves/dashboard-stats    | Authenticated   | Role-aware dashboard stats             |
| GET    | /api/pending-leaves             | Manager         | List team's pending leave requests     |
| PUT    | /api/leaves/:id/approve          | Manager         | Approve a pending leave                |
| PUT    | /api/leaves/:id/reject            | Manager         | Reject a pending leave (comments req.) |

All authenticated endpoints require `Authorization: Bearer <accessToken>`. Every response follows `{ success, data }` on success or `{ success: false, error: { message, details } }` on failure, with appropriate HTTP status codes (400/401/403/404/409/422/500).

## Assumptions

- Leave balance starts at 20 days per employee and is decremented only on **approval** (not on request submission), so a pending or rejected request never affects balance.
- A "manager" is just an employee with `role = MANAGER`; the `manager_id` on an employee record determines whose team they belong to for approval/visibility purposes.
- Employee self-signup isn't in scope — accounts are provisioned by a manager via `POST /api/employees` (or the seed script for the demo).
- Overlapping leave date ranges for the same employee are not blocked in this MVP (documented limitation below).
- Single-level manager hierarchy is sufficient for the MVP; the schema supports deeper hierarchies without migration.

## Known Limitations

- No email notifications on status changes (flagged as a bonus feature, not implemented in this pass).
- No pagination on list endpoints — acceptable at demo data volumes, would need `LIMIT/OFFSET` + cursor or page params at scale.
- No automated test suite (unit/integration) included due to the assessment timeline.
- SQLite is fine for local development/demo; a production deployment should move to PostgreSQL (schema is portable — see `docs/DATABASE.md`).
- No overlapping-leave-date validation yet (an employee could theoretically submit two overlapping requests).

## Future Enhancements

- Email notifications on leave submission/approval/rejection
- Pagination + infinite scroll on history/approval lists
- Docker Compose setup for one-command local spin-up
- CI pipeline (GitHub Actions) running lint + tests on PRs
- Unit/integration test coverage (Jest + Supertest for backend, Vitest + RTL for frontend)
- Multi-level approval chains and delegate approvers (out-of-office manager)
- CSV/PDF export of leave history

## Git Workflow

This repository was built with incremental, feature-scoped commits (database schema → auth → employee module → leave module → manager module → frontend pages → docs) rather than a single squashed commit, so the history reflects how the feature was actually built.
