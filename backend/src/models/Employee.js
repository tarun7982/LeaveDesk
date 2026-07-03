const db = require('../config/db');

const PUBLIC_COLUMNS = 'id, name, email, department, role, manager_id, leave_balance, created_at, updated_at';

const Employee = {
  create({ name, email, password, department, role, manager_id }) {
    const stmt = db.prepare(`
      INSERT INTO employees (name, email, password, department, role, manager_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, email, password, department || 'General', role || 'EMPLOYEE', manager_id || null);
    return Employee.findById(info.lastInsertRowid);
  },

  findByEmail(email) {
    return db.prepare('SELECT * FROM employees WHERE email = ?').get(email);
  },

  findById(id) {
    return db.prepare(`SELECT ${PUBLIC_COLUMNS} FROM employees WHERE id = ?`).get(id);
  },

  findByIdRaw(id) {
    return db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  },

  findAll({ search, department, role } = {}) {
    let query = `SELECT ${PUBLIC_COLUMNS} FROM employees WHERE 1=1`;
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    query += ' ORDER BY name ASC';
    return db.prepare(query).all(...params);
  },

  countByRole(role) {
    return db.prepare('SELECT COUNT(*) as count FROM employees WHERE role = ?').get(role).count;
  },

  updateLeaveBalance(id, delta) {
    db.prepare('UPDATE employees SET leave_balance = leave_balance + ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(delta, id);
  },
};

module.exports = Employee;
