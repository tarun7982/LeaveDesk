const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { ApiError } = require('../middleware/errorHandler');

function sanitize(employee) {
  const { password, ...rest } = employee;
  return rest;
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const employee = Employee.findByEmail(email);

    if (!employee) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const match = await bcrypt.compare(password, employee.password);
    if (!match) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const payload = { id: employee.id, email: employee.email, role: employee.role, name: employee.name };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: employee.id });

    AuditLog.record({ actor_id: employee.id, action: 'LOGIN', entity: 'employee', entity_id: employee.id });

    res.json({
      success: true,
      data: {
        user: sanitize(employee),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  // Stateless JWT: logout is handled client-side by discarding the token.
  // Endpoint kept for API completeness / future token blacklisting.
  res.json({ success: true, message: 'Logged out successfully' });
}

function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(new ApiError(400, 'Refresh token is required'));

    const decoded = verifyRefreshToken(refreshToken);
    const employee = Employee.findById(decoded.id);
    if (!employee) return next(new ApiError(401, 'Invalid refresh token'));

    const accessToken = signAccessToken({
      id: employee.id,
      email: employee.email,
      role: employee.role,
      name: employee.name,
    });

    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired refresh token'));
  }
}

function me(req, res, next) {
  try {
    const employee = Employee.findById(req.user.id);
    if (!employee) return next(new ApiError(404, 'User not found'));
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, refresh, me };
