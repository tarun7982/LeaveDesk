const db = require('../config/db');

function daysBetweenInclusive(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

const Leave = {
  create({ employee_id, leave_type, start_date, end_date, reason }) {
    const total_days = daysBetweenInclusive(start_date, end_date);
    const stmt = db.prepare(`
      INSERT INTO leaves (employee_id, leave_type, start_date, end_date, total_days, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(employee_id, leave_type, start_date, end_date, total_days, reason);
    return Leave.findById(info.lastInsertRowid);
  },

  findById(id) {
    return db.prepare(`
      SELECT l.*, e.name as employee_name, e.email as employee_email, e.department as employee_department,
             r.name as reviewer_name
      FROM leaves l
      JOIN employees e ON e.id = l.employee_id
      LEFT JOIN employees r ON r.id = l.reviewed_by
      WHERE l.id = ?
    `).get(id);
  },

  findByEmployee(employeeId, { status, leave_type, search } = {}) {
    let query = `SELECT * FROM leaves WHERE employee_id = ?`;
    const params = [employeeId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (leave_type) {
      query += ' AND leave_type = ?';
      params.push(leave_type);
    }
    if (search) {
      query += ' AND reason LIKE ?';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY created_at DESC';
    return db.prepare(query).all(...params);
  },

  findAll({ status, leave_type, search, managerId } = {}) {
    let query = `
      SELECT l.*, e.name as employee_name, e.email as employee_email, e.department as employee_department
      FROM leaves l
      JOIN employees e ON e.id = l.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (managerId) {
      query += ' AND e.manager_id = ?';
      params.push(managerId);
    }
    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }
    if (leave_type) {
      query += ' AND l.leave_type = ?';
      params.push(leave_type);
    }
    if (search) {
      query += ' AND (e.name LIKE ? OR e.email LIKE ? OR l.reason LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY l.created_at DESC';
    return db.prepare(query).all(...params);
  },

  update(id, fields) {
    const total_days = fields.start_date && fields.end_date
      ? daysBetweenInclusive(fields.start_date, fields.end_date)
      : undefined;

    const sets = [];
    const params = [];
    for (const [key, value] of Object.entries(fields)) {
      sets.push(`${key} = ?`);
      params.push(value);
    }
    if (total_days !== undefined) {
      sets.push('total_days = ?');
      params.push(total_days);
    }
    sets.push("updated_at = datetime('now')");
    params.push(id);

    db.prepare(`UPDATE leaves SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    return Leave.findById(id);
  },

  updateStatus(id, status, { reviewed_by, manager_comments } = {}) {
    db.prepare(`
      UPDATE leaves
      SET status = ?, manager_comments = ?, reviewed_by = ?, reviewed_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(status, manager_comments || null, reviewed_by || null, id);
    return Leave.findById(id);
  },

  delete(id) {
    return db.prepare('DELETE FROM leaves WHERE id = ?').run(id);
  },

  stats({ employeeId, managerId } = {}) {
    let base = 'FROM leaves l JOIN employees e ON e.id = l.employee_id WHERE 1=1';
    const params = [];
    if (employeeId) {
      base += ' AND l.employee_id = ?';
      params.push(employeeId);
    }
    if (managerId) {
      base += ' AND e.manager_id = ?';
      params.push(managerId);
    }

    const total = db.prepare(`SELECT COUNT(*) as count ${base}`).get(...params).count;
    const approved = db.prepare(`SELECT COUNT(*) as count ${base} AND l.status = 'APPROVED'`).get(...params).count;
    const pending = db.prepare(`SELECT COUNT(*) as count ${base} AND l.status = 'PENDING'`).get(...params).count;
    const rejected = db.prepare(`SELECT COUNT(*) as count ${base} AND l.status = 'REJECTED'`).get(...params).count;

    const recentQuery = `
      SELECT l.id, l.leave_type, l.status, l.start_date, l.end_date, l.updated_at, e.name as employee_name
      ${base}
      ORDER BY l.updated_at DESC
      LIMIT 5
    `;
    const recent = db.prepare(recentQuery).all(...params);

    return { total, approved, pending, rejected, recent };
  },
};

module.exports = Leave;
