const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database/leave_management.db';
const resolvedPath = path.resolve(process.cwd(), dbPath);

// Ensure the directory exists
const dir = path.dirname(resolvedPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new DatabaseSync(resolvedPath);

// Enforce foreign key constraints
db.exec('PRAGMA foreign_keys = ON;');

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password      TEXT NOT NULL,
    department    TEXT NOT NULL DEFAULT 'General',
    role          TEXT NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER')) DEFAULT 'EMPLOYEE',
    manager_id    INTEGER,
    leave_balance INTEGER NOT NULL DEFAULT 20,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
  CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_id);

  CREATE TABLE IF NOT EXISTS leaves (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id      INTEGER NOT NULL,
    leave_type       TEXT NOT NULL CHECK (leave_type IN ('SICK', 'CASUAL', 'EARNED', 'UNPAID')),
    start_date       TEXT NOT NULL,
    end_date         TEXT NOT NULL,
    total_days       INTEGER NOT NULL,
    reason           TEXT NOT NULL,
    status           TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')) DEFAULT 'PENDING',
    manager_comments TEXT,
    reviewed_by      INTEGER,
    reviewed_at      TEXT,
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES employees(id) ON DELETE SET NULL,
    CHECK (date(end_date) >= date(start_date))
  );

  CREATE INDEX IF NOT EXISTS idx_leaves_employee ON leaves(employee_id);
  CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
  CREATE INDEX IF NOT EXISTS idx_leaves_type ON leaves(leave_type);
  CREATE INDEX IF NOT EXISTS idx_leaves_dates ON leaves(start_date, end_date);

  CREATE TABLE IF NOT EXISTS audit_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id    INTEGER,
    action      TEXT NOT NULL,
    entity      TEXT NOT NULL,
    entity_id   INTEGER,
    details     TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (actor_id) REFERENCES employees(id) ON DELETE SET NULL
  );
`);

module.exports = db;
