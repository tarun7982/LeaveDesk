const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');
const { ApiError } = require('../middleware/errorHandler');

function pendingLeaves(req, res, next) {
  try {
    const { search, leave_type } = req.query;
    const leaves = Leave.findAll({ status: 'PENDING', leave_type, search, managerId: req.user.id });
    res.json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
}

function approveLeave(req, res, next) {
  try {
    const leave = Leave.findById(req.params.id);
    if (!leave) return next(new ApiError(404, 'Leave request not found'));
    if (leave.status !== 'PENDING') return next(new ApiError(400, 'Only pending requests can be approved'));

    const updated = Leave.updateStatus(req.params.id, 'APPROVED', {
      reviewed_by: req.user.id,
      manager_comments: req.body.comments || null,
    });

    Employee.updateLeaveBalance(leave.employee_id, -leave.total_days);
    AuditLog.record({ actor_id: req.user.id, action: 'APPROVE', entity: 'leave', entity_id: leave.id });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

function rejectLeave(req, res, next) {
  try {
    const leave = Leave.findById(req.params.id);
    if (!leave) return next(new ApiError(404, 'Leave request not found'));
    if (leave.status !== 'PENDING') return next(new ApiError(400, 'Only pending requests can be rejected'));

    if (!req.body.comments || !req.body.comments.trim()) {
      return next(new ApiError(422, 'Comments are required when rejecting a leave request'));
    }

    const updated = Leave.updateStatus(req.params.id, 'REJECTED', {
      reviewed_by: req.user.id,
      manager_comments: req.body.comments,
    });

    AuditLog.record({ actor_id: req.user.id, action: 'REJECT', entity: 'leave', entity_id: leave.id });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

function teamEmployees(req, res, next) {
  try {
    const { search, department } = req.query;
    const employees = Employee.findAll({ search, department, role: 'EMPLOYEE' });
    res.json({ success: true, data: employees });
  } catch (err) {
    next(err);
  }
}

module.exports = { pendingLeaves, approveLeave, rejectLeave, teamEmployees };
