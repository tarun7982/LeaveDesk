const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  pendingLeaves,
  approveLeave,
  rejectLeave,
  teamEmployees,
} = require('../controllers/managerController');

const router = express.Router();

router.use(authenticate, authorize('MANAGER'));

router.get('/pending-leaves', pendingLeaves);
router.get('/employees', teamEmployees);

router.put('/leaves/:id/approve', [body('comments').optional().trim()], validate, approveLeave);
router.put(
  '/leaves/:id/reject',
  [body('comments').trim().notEmpty().withMessage('Comments are required to reject a leave request')],
  validate,
  rejectLeave
);

module.exports = router;
