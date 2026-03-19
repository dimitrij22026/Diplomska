# AI-Powered Personal Finance Advisor

Personal finance web app with a FastAPI backend and React + Vite frontend. The project includes budgeting, transaction tracking, savings goals, analytics, profile management, market data views, and an AI assistant flow.

Repository: `https://github.com/dimitrij22026/Diplomska`

## Tech Stack

Backend:

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic v2
- JWT auth (`python-jose`)
- `passlib` for password hashing
- `httpx` for external API calls

Frontend:

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Recharts
- Zod

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm
- Optional: MySQL 8+ (if not using SQLite)

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv .venv
```

Activate venv:

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create env file:

```bash
cp .env.example .env
```

Run API (port `8001`, matches frontend proxy):

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

API docs: `http://127.0.0.1:8001/docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

By default, Vite proxies `/api` and `/uploads` to `http://127.0.0.1:8001`.

## Environment Configuration

`backend/.env.example` contains the base keys. Important DB behavior:

- If `SQLALCHEMY_DATABASE_URI` is set to a value, that value is used.
- If `SQLALCHEMY_DATABASE_URI` is empty, backend falls back to MySQL fields (`MYSQL_*`).
- If no `.env` is present, code-level default is SQLite: `sqlite:///./finance_app.db`.

Example SQLite configuration:

```env
SQLALCHEMY_DATABASE_URI=sqlite:///./finance_app.db
```

Example MySQL configuration:

```env
SQLALCHEMY_DATABASE_URI=
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=finance_app
MYSQL_PASSWORD=change-me
MYSQL_DB=finance_app
```

## API Overview

Base prefix: `/api/v1`

Registered route groups:

- `/health`
- Auth
- Users
- Transactions
- Budgets
- Savings Goals
- Advice
- Market

Also available at app root: `/health`.

## Frontend Pages

Main routes include:

- `/welcome`
- `/auth/login`
- `/auth/verify`
- `/` dashboard (protected)
- `/transactions`
- `/budgets`
- `/analytics`
- `/portfolio`
- `/crypto`
- `/stocks`
- `/assistant`
- `/profile`
- `/about`

## Useful Commands

Backend:

```bash
cd backend
python inspect_db.py
python run_migration.py
python add_missing_columns.py
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
npm run preview
```

## Testing Status

- Backend has minimal test scaffolding (`backend/test_app.py`).
- `backend/tests/` is currently empty.
- Frontend test script is not currently configured in `package.json`.

## Documentation

- Brief and requirements: `docs/ai-personal-finance-brief.md`
- OpenAPI docs (while backend is running): `http://127.0.0.1:8001/docs`

## Academic Context

Developed as a diploma thesis project focused on applying modern web technologies and AI-assisted guidance to personal finance management.
