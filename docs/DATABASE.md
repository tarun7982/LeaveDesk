# Database Schema

The system uses SQLite (via Node's built-in `node:sqlite` module) for zero-setup local development. The schema is fully relational, normalized to 3NF, and would map directly onto PostgreSQL/MySQL if the project needed to scale to a client-server database (see `backend/src/config/db.js` for the exact DDL executed on startup).

## Entity-Relationship Overview

```
┌───────────────────────┐          ┌──────────────────────────┐
│      employees        │          │          leaves           │
├───────────────────────┤          ├──────────────────────────┤
│ id            PK      │───┐      │ id               PK       │
│ name                  │   │      │ employee_id      FK ─────┐│
│ email         UNIQUE  │   │      │ leave_type                │
│ password (hashed)     │   │      │ start_date                │
│ department            │   │      │ end_date                  │
│ role  (EMPLOYEE/      │   │      │ total_days                │
│        MANAGER)       │   │      │ reason                    │
│ manager_id    FK ─────┘   │      │ status                    │
│ leave_balance         │   │      │ manager_comments          │
│ created_at            │   │      │ reviewed_by      FK ──────┘ (→ employees.id)
│ updated_at            │   │      │ reviewed_at               │
└───────────────────────┘   │      │ created_at                │
        ▲                    │      │ updated_at                │
        │ (self-referencing) │      └──────────────────────────┘
        └────────────────────┘

┌───────────────────────┐
│      audit_logs        │
├───────────────────────┤
│ id            PK       │
│ actor_id      FK ──────┼──→ employees.id
│ action                 │
│ entity                 │
│ entity_id              │
│ details (JSON text)    │
│ created_at             │
└───────────────────────┘
```

## Tables

### `employees`
| Column         | Type    | Constraints                                      |
|----------------|---------|---------------------------------------------------|
| id             | INTEGER | PRIMARY KEY AUTOINCREMENT                          |
| name           | TEXT    | NOT NULL                                           |
| email          | TEXT    | NOT NULL, UNIQUE, indexed                          |
| password       | TEXT    | NOT NULL (bcrypt hash, never returned by the API)  |
| department     | TEXT    | NOT NULL DEFAULT 'General'                         |
| role           | TEXT    | NOT NULL, CHECK IN ('EMPLOYEE','MANAGER')          |
| manager_id     | INTEGER | FK → employees.id, ON DELETE SET NULL, indexed     |
| leave_balance  | INTEGER | NOT NULL DEFAULT 20                                |
| created_at     | TEXT    | DEFAULT now                                        |
| updated_at     | TEXT    | DEFAULT now                                        |

`manager_id` is a **self-referencing foreign key** — the same table models both employees and managers, and a manager's own record can (optionally) point to a manager above them, allowing multi-level hierarchies later without a schema change.

### `leaves`
| Column            | Type    | Constraints                                                    |
|-------------------|---------|------------------------------------------------------------------|
| id                | INTEGER | PRIMARY KEY AUTOINCREMENT                                        |
| employee_id       | INTEGER | NOT NULL, FK → employees.id, ON DELETE CASCADE, indexed          |
| leave_type        | TEXT    | NOT NULL, CHECK IN ('SICK','CASUAL','EARNED','UNPAID')           |
| start_date        | TEXT    | NOT NULL (ISO date)                                              |
| end_date          | TEXT    | NOT NULL (ISO date), CHECK (end_date >= start_date)              |
| total_days        | INTEGER | NOT NULL (computed server-side from the date range)              |
| reason            | TEXT    | NOT NULL                                                         |
| status            | TEXT    | NOT NULL, CHECK IN ('PENDING','APPROVED','REJECTED','CANCELLED') |
| manager_comments  | TEXT    | NULL (required by the API when rejecting)                        |
| reviewed_by       | INTEGER | FK → employees.id, ON DELETE SET NULL                            |
| reviewed_at       | TEXT    | NULL                                                             |
| created_at        | TEXT    | DEFAULT now                                                      |
| updated_at        | TEXT    | DEFAULT now                                                      |

### `audit_logs`
Append-only trail of who did what (login, create/edit/cancel leave, approve/reject) — a bonus feature (Audit Logs) that also aids debugging.

## Indexing Strategy
- `employees.email` — unique index, used on every login.
- `employees.manager_id` — speeds up "find my team" queries used on every manager dashboard/pending-approvals call.
- `leaves.employee_id`, `leaves.status`, `leaves.leave_type`, `leaves(start_date, end_date)` — cover the filter/search combinations used by Leave History and Pending Approvals.

## Normalization & Scalability Notes
- The schema is in **3NF**: no repeating groups, all non-key attributes depend only on the primary key, and employee/leave data is not duplicated across rows.
- Foreign keys with `ON DELETE CASCADE` (leaves) and `ON DELETE SET NULL` (manager references) keep referential integrity without orphaned rows.
- `total_days` is intentionally denormalized (computed once at write-time) purely to avoid recomputing date math on every read of a list of leaves — a deliberate, documented tradeoff, not an oversight.
- To scale beyond SQLite, this schema moves to PostgreSQL with no structural changes — swap `node:sqlite` calls for a `pg`/Prisma client and keep the same DDL (adjusting `AUTOINCREMENT` → `SERIAL`/`IDENTITY`).
