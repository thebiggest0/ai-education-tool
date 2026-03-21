import { authService } from '../services/authService.js';
import { tokenService } from '../services/tokenService.js';

/**
 * Handles user registration requests.
 *
 * @param {import('express').Request} req - The request containing username, email, and password.
 * @param {import('express').Response} res - The response with tokens and user data or error.
 */
async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required',
        code: 'MISSING_FIELDS',
      });
    }

    const result = await authService.register({ username, email, password });
    return res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      error: error.message,
      code: error.code || 'INTERNAL_ERROR',
    });
  }
}

/**
 * Handles user login requests.
 *
 * @param {import('express').Request} req - The request containing identifier and password.
 * @param {import('express').Response} res - The response with tokens and user data or error.
 */
async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        error: 'Identifier and password are required',
        code: 'MISSING_FIELDS',
      });
    }

    const result = await authService.login({ identifier, password });
    return res.json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      error: error.message,
      code: error.code || 'INTERNAL_ERROR',
    });
  }
}

/**
 * Handles user logout by revoking the refresh token.
 *
 * @param {import('express').Request} req - The authenticated request containing the refresh token in the body.
 * @param {import('express').Response} res - The response confirming logout.
 */
async function logout(req, res) {
  try {
    const { refreshToken } = req.body;

    await tokenService.revokeRefreshToken({
      token: refreshToken,
      userId: req.user.userId,
    });

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Handles refresh token rotation, issuing a new token pair.
 *
 * @param {import('express').Request} req - The request containing the current refreshToken.
 * @param {import('express').Response} res - The response with the new token pair or error.
 */
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN',
      });
    }

    const tokens = await tokenService.rotateTokens(refreshToken);
    return res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    if (error.code === 'INVALID_REFRESH_TOKEN') {
      return res.status(401).json({
        error: error.message,
        code: error.code,
      });
    }
    console.error('Error refreshing tokens:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Returns the current authenticated user's profile.
 *
 * @param {import('express').Request} req - The authenticated request.
 * @param {import('express').Response} res - The response with the user profile.
 */
async function me(req, res) {
  try {
    const user = await authService.getCurrentUser(req.user.userId);
    return res.json(user);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      error: error.message,
      code: error.code || 'INTERNAL_ERROR',
    });
  }
}

export const authController = {
  register,
  login,
  logout,
  refresh,
  me,
};
