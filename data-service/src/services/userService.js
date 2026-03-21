import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/userRepository.js';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

/**
 * Creates a new user with a hashed password.
 *
 * @param {object} params - The user creation parameters.
 * @param {string} params.username - The unique username.
 * @param {string} params.email - The unique email address.
 * @param {string} params.password - The plaintext password to hash.
 * @param {string} [params.role='user'] - The role to assign.
 * @returns {Promise<object>} The created user record without the password.
 * @throws {Error} If the username or email already exists.
 */
async function createUser({ username, email, password, role = 'user' }) {
  const existingByEmail = await userRepository.findByEmail(email);
  if (existingByEmail) {
    const error = new Error('Email already in use');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  const existingByUsername = await userRepository.findByUsername(username);
  if (existingByUsername) {
    const error = new Error('Username already taken');
    error.code = 'USERNAME_EXISTS';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return userRepository.create({ username, email, passwordHash, role });
}

/**
 * Finds a user by email or username, returning the full record including password hash.
 *
 * @param {string} identifier - An email address or username.
 * @returns {Promise<object|null>} The user record with password hash, or null if not found.
 */
async function findByIdentifier(identifier) {
  const isEmail = identifier.includes('@');
  if (isEmail) {
    return userRepository.findByEmail(identifier);
  }
  return userRepository.findByUsername(identifier);
}

/**
 * Retrieves a user by their unique identifier.
 *
 * @param {string} userId - The UUID of the user.
 * @returns {Promise<object|null>} The user record without password hash, or null if not found.
 */
async function getUserById(userId) {
  return userRepository.findById(userId);
}

/**
 * Updates the role of a user.
 *
 * @param {string} userId - The UUID of the user.
 * @param {string} role - The new role to assign ('user' or 'admin').
 * @returns {Promise<object|null>} The updated user record, or null if not found.
 * @throws {Error} If the role is invalid.
 */
async function updateUserRole(userId, role) {
  const validRoles = ['user', 'admin'];
  if (!validRoles.includes(role)) {
    const error = new Error('Invalid role');
    error.code = 'INVALID_ROLE';
    throw error;
  }
  return userRepository.updateRole(userId, role);
}

export const userService = {
  createUser,
  findByIdentifier,
  getUserById,
  updateUserRole,
};
