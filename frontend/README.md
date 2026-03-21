# Frontend

React + TypeScript + Vite frontend for the AI Education Tool.

## Setup

1. Copy `.env.example` to `.env`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public only | Login form |
| `/register` | Public only | Registration form |
| `/dashboard` | Authenticated | User dashboard |
| `/admin` | Admin only | Admin dashboard |
