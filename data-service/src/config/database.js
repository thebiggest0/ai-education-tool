import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || '';
const DB_PORT = parseInt(process.env.DB_PORT || '', 10);
const DB_NAME = process.env.DB_NAME || '';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

const writePool = new pg.Pool({
  host: DB_HOST,
  user: process.env.DB_WRITE_USER || 'lab4_writer',
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  max: 10,
});

const readPool = new pg.Pool({
  host: DB_HOST,
  user: process.env.DB_READ_USER || 'lab4_reader',
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  max: 10,
});

/**
 * Initializes the database schema by creating required tables if they do not exist.
 *
 * @returns {Promise<void>} Resolves when schema initialization is complete.
 */
async function initializeDatabase() {
  const client = await writePool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
    `);
    console.log('Database schema initialized');
  } finally {
    client.release();
  }
}

export { writePool, readPool, initializeDatabase };
