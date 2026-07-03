const Leave = require('../models/Leave');
const AuditLog = require('../models/AuditLog');
const { ApiError } = require('../middleware/errorHandler');

function applyLeave(req, res, next) {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;

    if (new Date(start_date) > new Date(end_date)) {
      return next(new ApiError(422, 'Start date must be before or equal to end date'));
    }

    const leave = Leave.create({
      employee_id: req.user.id,
      leave_type,
      start_date,
      end_date,
      reason,
    });

    AuditLog.record({ actor_id: req.user.id, action: 'CREATE', entity: 'leave', entity_id: leave.id });

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
}

function listLeaves(req, res, next) {
  try {
    const { status, leave_type, search } = req.query;

    // Employees see only their own records; managers see their team's records.
    const leaves = req.user.role === 'MANAGER'
      ? Leave.findAll({ status, leave_type, search, managerId: req.user.id })
      : Leave.findByEmployee(req.user.id, { status, leave_type, search });

    res.json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
}

function getLeave(req, res, next) {
  try {
    const leave = Leave.findById(req.params.id);
    if (!leave) return next(new ApiError(404, 'Leave request not found'));

    if (req.user.role === 'EMPLOYEE' && leave.employee_id !== req.user.id) {
      return next(new ApiError(403, 'You can only view your own leave requests'));
    }

    res.json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
}

function updateLeave(req, res, next) {
  try {
    const leave = Leave.findById(req.params.id);
    if (!leave) return next(new ApiError(404, 'Leave request not found'));

    if (leave.employee_id !== req.user.id) {
      return next(new ApiError(403, 'You can only edit your own leave requests'));
    }
    if (leave.status !== 'PENDING') {
      return next(new ApiError(400, 'Only pending leave requests can be edited'));
    }

    const { leave_type, start_date, end_date, reason } = req.body;
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return next(new ApiError(422, 'Start date must be before or equal to end date'));
    }

    const updated = Leave.update(req.params.id, {
      ...(leave_type && { leave_type }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      ...(reason && { reason }),
    });

    AuditLog.record({ actor_id: req.user.id, action: 'UPDATE', entity: 'leave', entity_id: leave.id });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

function deleteLeave(req, res, next) {
  try {
    const leave = Leave.findById(req.params.id);
    if (!leave) return next(new ApiError(404, 'Leave request not found'));

    if (leave.employee_id !== req.user.id) {
      return next(new ApiError(403, 'You can only cancel your own leave requests'));
    }
    if (leave.status !== 'PENDING') {
      return next(new ApiError(400, 'Only pending leave requests can be cancelled'));
    }

    Leave.delete(req.params.id);
    AuditLog.record({ actor_id: req.user.id, action: 'DELETE', entity: 'leave', entity_id: leave.id });

    res.json({ success: true, message: 'Leave request cancelled successfully' });
  } catch (err) {
    next(err);
  }
}

function dashboardStats(req, res, next) {
  try {
    const stats = req.user.role === 'MANAGER'
      ? Leave.stats({ managerId: req.user.id })
      : Leave.stats({ employeeId: req.user.id });

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { applyLeave, listLeaves, getLeave, updateLeave, deleteLeave, dashboardStats };
