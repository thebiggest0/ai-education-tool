import { tokenService } from '../services/tokenService.js';

/**
 * Express middleware that verifies the JWT access token from the Authorization header.
 * Attaches the decoded user payload (userId, role) to req.user on success.
 *
 * @param {import('express').Request} req - The incoming request.
 * @param {import('express').Response} res - The outgoing response.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access token required',
      code: 'MISSING_TOKEN',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = tokenService.verifyAccessToken(token);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired access token',
      code: 'INVALID_TOKEN',
    });
  }
}

/**
 * Creates an Express middleware that checks whether the authenticated user has the required role.
 * Must be used after the authenticate middleware.
 *
 * @param {string} role - The required role (e.g., 'admin').
 * @returns {import('express').RequestHandler} The role-checking middleware.
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
      });
    }
    next();
  };
}
