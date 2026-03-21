import { writePool, readPool } from '../config/database.js';

/**
 * Creates a new user record in the database.
 *
 * @param {object} params - The user creation parameters.
 * @param {string} params.username - The unique username.
 * @param {string} params.email - The unique email address.
 * @param {string} params.passwordHash - The bcrypt-hashed password.
 * @param {string} params.role - The user role ('user' or 'admin').
 * @returns {Promise<object>} The created user record without the password hash.
 */
async function create({ username, email, passwordHash, role }) {
  const result = await writePool.query(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, role, created_at, updated_at`,
    [username, email, passwordHash, role]
  );
  return result.rows[0];
}

/**
 * Finds a user by their email address.
 *
 * @param {string} email - The email to search for.
 * @returns {Promise<object|null>} The user record including password hash, or null if not found.
 */
async function findByEmail(email) {
  const result = await readPool.query(
    `SELECT id, username, email, password_hash, role, created_at, updated_at
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Finds a user by their username.
 *
 * @param {string} username - The username to search for.
 * @returns {Promise<object|null>} The user record including password hash, or null if not found.
 */
async function findByUsername(username) {
  const result = await readPool.query(
    `SELECT id, username, email, password_hash, role, created_at, updated_at
     FROM users WHERE username = $1`,
    [username]
  );
  return result.rows[0] || null;
}

/**
 * Finds a user by their unique identifier.
 *
 * @param {string} id - The UUID of the user.
 * @returns {Promise<object|null>} The user record without password hash, or null if not found.
 */
async function findById(id) {
  const result = await readPool.query(
    `SELECT id, username, email, role, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Updates the role of a user.
 *
 * @param {string} id - The UUID of the user to update.
 * @param {string} role - The new role to assign.
 * @returns {Promise<object|null>} The updated user record, or null if not found.
 */
async function updateRole(id, role) {
  const result = await writePool.query(
    `UPDATE users SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, username, email, role, created_at, updated_at`,
    [role, id]
  );
  return result.rows[0] || null;
}

export const userRepository = {
  create,
  findByEmail,
  findByUsername,
  findById,
  updateRole,
};
