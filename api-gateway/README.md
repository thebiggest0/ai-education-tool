# API Gateway

Express server handling authentication, JWT management, and routing to the Data Service.

## Setup

1. Copy `.env.example` to `.env` and fill in your values
2. Install dependencies: `npm install`
3. Ensure Data Service is running
4. Start the service: `npm run dev`

## Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login with email/username + password |
| POST | `/auth/refresh` | No | Rotate refresh token, get new pair |
| POST | `/auth/logout` | Yes | Revoke refresh token |
| GET | `/auth/me` | Yes | Get current user profile |
