# AI Education Tool

AI was used to style, document, error review, and gave overviews and answered questsions about resend library, ecryption, tokens

A full-stack monorepo with three independently runnable services: a React frontend, a Node.js API gateway, and a Node.js data service backed by PostgreSQL.

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    Frontend     │  HTTP   │   API Gateway   │  HTTP   │  Data Service   │
│  React + Vite   │────────▶│   Node.js       │────────▶│   Node.js       │
│  TypeScript     │◀────────│   JWT Auth      │◀────────│   PostgreSQL    │
└─────────────────┘         └────────┬────────┘         └─────────────────┘
                                     │ HTTP
                             ┌───────▼────────┐
                             │  AI Service    │
                             │  Python/Flask  │
                             └────────────────┘
```

The frontend never talks to the data service directly. All requests go through the API gateway, which verifies JWTs and forwards data operations via an internal shared secret.

## Services

### `frontend/` — React + TypeScript + Vite

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public only | Login form |
| `/register` | Public only | Registration form |
| `/forgot-password` | Public only | Request a password reset email |
| `/reset-password?token=` | Public | Set a new password via email link |
| `/dashboard` | Authenticated | User dashboard |
| `/admin` | Admin only | Admin dashboard |
| `/ai-chat` | Authenticated | AI-powered Q&A with persistent chat history |

**Stack:** React 19, React Router 7, Tailwind CSS 4, TypeScript 5

### `api-gateway/` — Node.js Express

Handles all authentication, JWT issuance and verification, and proxies data requests to the data service.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login, returns token pair + role |
| POST | `/auth/refresh` | No | Rotate refresh token |
| POST | `/auth/logout` | Yes | Revoke refresh token |
| GET | `/auth/me` | Yes | Get current user profile |
| POST | `/auth/forgot-password` | No | Send password reset email |
| POST | `/auth/reset-password` | No | Reset password with token |
| POST | `/ai/prompt` | Yes | Send answer to AI service for evaluation |
| GET | `/questions/active-student` | No | Get active question (no answer key) |
| GET | `/questions/active` | Yes | Get active question (with answer key) |
| GET | `/questions/instructor` | Yes | Get all instructor's questions |
| POST | `/questions` | Yes | Create a new question |
| PUT | `/questions/:id` | Yes | Update a question |
| POST | `/questions/:id/activate` | Yes | Activate a question |
| POST | `/questions/:id/deactivate` | Yes | Deactivate a question |
| DELETE | `/questions/:id` | Yes | Delete a question |
| POST | `/responses` | Yes | Save student answer + AI evaluation |
| GET | `/responses/question/:questionId` | Yes | Get chat history for a question |
| GET | `/responses/user` | Yes | Get all responses by current user |

**Token strategy:** Access tokens expire in 15 minutes. Refresh tokens expire in 7 days and are rotated on every use. Both secrets are separate env vars.

**Stack:** Express 4, jsonwebtoken, bcrypt, Resend (email), dotenv

### `data-service/` — Node.js Express

Internal-only service for all PostgreSQL operations. Rejects any request missing the `x-internal-secret` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/internal/users/create` | Create user, hash password |
| POST | `/internal/users/find` | Find by email or username |
| GET | `/internal/users/:id` | Get user by ID |
| PUT | `/internal/users/:id/role` | Update role |
| POST | `/internal/tokens/store` | Store refresh token hash |
| POST | `/internal/tokens/verify` | Verify refresh token |
| POST | `/internal/tokens/rotate` | Rotate refresh token |
| DELETE | `/internal/tokens/revoke` | Revoke token(s) |
| POST | `/internal/password-reset/store` | Store reset token |
| POST | `/internal/password-reset/verify` | Verify reset token |
| POST | `/internal/password-reset/reset` | Reset password + invalidate token |
| GET | `/internal/questions/active` | Get active question (with answer key) |
| GET | `/internal/questions/active-student` | Get active question (no answer key) |
| GET | `/internal/questions/instructor` | Get instructor's questions |
| POST | `/internal/questions` | Create a question |
| PUT | `/internal/questions/:id` | Update a question |
| POST | `/internal/questions/:id/activate` | Activate a question |
| POST | `/internal/questions/:id/deactivate` | Deactivate a question |
| DELETE | `/internal/questions/:id` | Delete a question |
| POST | `/internal/responses` | Save student answer + AI evaluation |
| GET | `/internal/responses/question/:questionId` | Get chat history for a question |
| GET | `/internal/responses/user` | Get all responses by a user |

### `ai-service/` — Python Flask

External AI microservice that evaluates student answers against correct answers using NLP similarity scoring.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Compare student answer to correct answer |

**Stack:** Python, Flask

**Stack:** Express 4, pg (PostgreSQL), bcrypt, dotenv

## Database Schema

```sql
users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ
)

password_reset_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ
)

question_bank (
  id UUID PRIMARY KEY,
  question_text TEXT NOT NULL,
  answer_key TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

question_responses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bank(id) ON DELETE CASCADE,
  student_answer TEXT NOT NULL,
  ai_score NUMERIC(5,2),
  ai_feedback TEXT,
  created_at TIMESTAMPTZ
)
```

Tables are created automatically on data service startup.

## Quickstart

### Configure environment

Each service has a `.env.example`. Copy and fill in values:

```bash
cp data-service/.env.example data-service/.env
cp api-gateway/.env.example api-gateway/.env
cp frontend/.env.example frontend/.env
```

Key variables:

| Service | Variable | Description |
|---------|----------|-------------|
| data-service | `DB_HOST`, `DB_NAME`, `DB_WRITE_USER`, `DB_READ_USER`, `DB_PASSWORD` | PostgreSQL connection |
| data-service | `INTERNAL_SECRET` | Shared secret with API gateway |
| api-gateway | `INTERNAL_SECRET` | Must match data-service |
| api-gateway | `ACCESS_TOKEN_SECRET` | JWT signing secret (access tokens) |
| api-gateway | `REFRESH_TOKEN_SECRET` | JWT signing secret (refresh tokens) |
| api-gateway | `RESEND_API_KEY` | Resend API key for password reset emails |
| api-gateway | `AI_SERVICE_URL` | URL of the AI microservice |
| frontend | `VITE_API_URL` | URL of the API gateway |

Generate secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run services individually:

```bash
# Data Service
cd data-service && npm run dev

# API Gateway
cd api-gateway && npm run dev

# Frontend
cd frontend && npm run dev
```

## Project Structure

```
ai-education-tool/
├── frontend/
│   └── src/
│       ├── components/       # Route guards, shared UI
│       ├── contexts/         # AuthContext (global auth state)
│       ├── pages/            # One file per route
│       ├── services/         # API call logic (authService, api)
│       └── types/            # Shared TypeScript interfaces
├── api-gateway/
│   └── src/
│       ├── config/           # Env config
│       ├── controllers/      # Request handlers
│       ├── middleware/        # JWT auth, role enforcement
│       ├── services/         # Business logic, email, token management
│       └── utils/            # Internal HTTP client
└── data-service/
    └── src/
        ├── config/           # Database pool setup + schema init
        ├── controllers/      # Request handlers
        ├── repositories/     # All SQL queries
        └── services/         # Business logic layer
```
