# Data Service

Internal service handling all PostgreSQL operations for the AI Education Tool.

## Setup

1. Copy `.env.example` to `.env` and fill in your values
2. Ensure PostgreSQL is running
3. Install dependencies: `npm install`
4. Seed the database: `npm run seed`
5. Start the service: `npm run dev`

## Internal Endpoints

All endpoints require the `x-internal-secret` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/internal/users/create` | Create a user |
| POST | `/internal/users/find` | Find user by email or username |
| GET | `/internal/users/:id` | Get user by ID |
| PUT | `/internal/users/:id/role` | Update user role |
| POST | `/internal/tokens/store` | Store refresh token |
| POST | `/internal/tokens/verify` | Verify refresh token |
| POST | `/internal/tokens/rotate` | Rotate refresh token |
| DELETE | `/internal/tokens/revoke` | Revoke refresh token(s) |
