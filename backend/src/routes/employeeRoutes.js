const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { listEmployees, getEmployee, createEmployee } = require('../controllers/employeeController');

const router = express.Router();

router.get('/', authenticate, authorize('MANAGER'), listEmployees);

router.post(
  '/',
  authenticate,
  authorize('MANAGER'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['EMPLOYEE', 'MANAGER']),
  ],
  validate,
  createEmployee
);

router.get('/:id', authenticate, getEmployee);

module.exports = router;
