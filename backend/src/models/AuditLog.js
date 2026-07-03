const db = require('../config/db');

const AuditLog = {
  record({ actor_id, action, entity, entity_id, details }) {
    db.prepare(`
      INSERT INTO audit_logs (actor_id, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(actor_id || null, action, entity, entity_id || null, details ? JSON.stringify(details) : null);
  },

  findAll(limit = 100) {
    return db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit);
  },
};

module.exports = AuditLog;
