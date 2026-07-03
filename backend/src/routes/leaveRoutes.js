const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  applyLeave,
  listLeaves,
  getLeave,
  updateLeave,
  deleteLeave,
  dashboardStats,
} = require('../controllers/leaveController');

const router = express.Router();

const leaveValidation = [
  body('leave_type').isIn(['SICK', 'CASUAL', 'EARNED', 'UNPAID']).withMessage('Invalid leave type'),
  body('start_date').isISO8601().withMessage('start_date must be a valid date (YYYY-MM-DD)'),
  body('end_date').isISO8601().withMessage('end_date must be a valid date (YYYY-MM-DD)'),
  body('reason').trim().isLength({ min: 3 }).withMessage('Reason must be at least 3 characters'),
];

router.get('/dashboard-stats', authenticate, dashboardStats);

router.post('/', authenticate, authorize('EMPLOYEE'), leaveValidation, validate, applyLeave);
router.get('/', authenticate, listLeaves);
router.get('/:id', authenticate, getLeave);

router.put(
  '/:id',
  authenticate,
  authorize('EMPLOYEE'),
  [
    body('leave_type').optional().isIn(['SICK', 'CASUAL', 'EARNED', 'UNPAID']),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('reason').optional().trim().isLength({ min: 3 }),
  ],
  validate,
  updateLeave
);

router.delete('/:id', authenticate, authorize('EMPLOYEE'), deleteLeave);

module.exports = router;
