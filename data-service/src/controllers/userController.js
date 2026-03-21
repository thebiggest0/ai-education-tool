import { userService } from '../services/userService.js';

/**
 * Handles user creation requests from the API gateway.
 *
 * @param {import('express').Request} req - The request containing username, email, password, and optional role.
 * @param {import('express').Response} res - The response with the created user or error.
 */
async function createUser(req, res) {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required',
        code: 'MISSING_FIELDS',
      });
    }

    const user = await userService.createUser({ username, email, password, role });
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === 'EMAIL_EXISTS' || error.code === 'USERNAME_EXISTS') {
      return res.status(409).json({ error: error.message, code: error.code });
    }
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

/**
 * Handles user lookup requests by email or username.
 *
 * @param {import('express').Request} req - The request containing the identifier field.
 * @param {import('express').Response} res - The response with the user record or error.
 */
async function findUser(req, res) {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        error: 'Identifier (email or username) is required',
        code: 'MISSING_IDENTIFIER',
      });
    }

    const user = await userService.findByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Error finding user:', error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

/**
 * Handles user retrieval requests by user ID.
 *
 * @param {import('express').Request} req - The request with user ID in params.
 * @param {import('express').Response} res - The response with the user record or error.
 */
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

/**
 * Handles user role update requests.
 *
 * @param {import('express').Request} req - The request with user ID in params and role in body.
 * @param {import('express').Response} res - The response with the updated user record or error.
 */
async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required', code: 'MISSING_ROLE' });
    }

    const user = await userService.updateUserRole(id, role);
    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    return res.json(user);
  } catch (error) {
    if (error.code === 'INVALID_ROLE') {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    console.error('Error updating role:', error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

export const userController = {
  createUser,
  findUser,
  getUserById,
  updateUserRole,
};
