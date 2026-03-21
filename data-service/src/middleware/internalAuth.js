/**
 * Express middleware that validates the x-internal-secret header against the configured secret.
 * Rejects requests that do not include a valid internal secret.
 *
 * @param {import('express').Request} req - The incoming request.
 * @param {import('express').Response} res - The outgoing response.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
export function requireInternalSecret(req, res, next) {
  const providedSecret = req.headers['x-internal-secret'];
  const expectedSecret = process.env.INTERNAL_SECRET;

  if (!providedSecret || providedSecret !== expectedSecret) {
    return res.status(403).json({
      error: 'Forbidden: invalid internal secret',
      code: 'INVALID_INTERNAL_SECRET',
    });
  }

  next();
}
