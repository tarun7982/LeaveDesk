const { verifyAccessToken } = require('../utils/jwt');
const { ApiError } = require('./errorHandler');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing'));
  }

  const token = header.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

// Usage: authorize('MANAGER') or authorize('EMPLOYEE', 'MANAGER')
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Not authenticated'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
