const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const { ApiError } = require('../middleware/errorHandler');

function listEmployees(req, res, next) {
  try {
    const { search, department, role } = req.query;
    const employees = Employee.findAll({ search, department, role });
    res.json({ success: true, data: employees });
  } catch (err) {
    next(err);
  }
}

function getEmployee(req, res, next) {
  try {
    const employee = Employee.findById(req.params.id);
    if (!employee) return next(new ApiError(404, 'Employee not found'));

    // Employees may only view their own profile; managers may view anyone.
    if (req.user.role === 'EMPLOYEE' && req.user.id !== employee.id) {
      return next(new ApiError(403, 'You can only view your own profile'));
    }

    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
}

async function createEmployee(req, res, next) {
  try {
    const { name, email, password, department, role, manager_id } = req.body;

    const existing = Employee.findByEmail(email);
    if (existing) return next(new ApiError(409, 'An account with this email already exists'));

    const hashed = await bcrypt.hash(password, 10);
    const employee = Employee.create({ name, email, password: hashed, department, role, manager_id });

    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
}

module.exports = { listEmployees, getEmployee, createEmployee };
