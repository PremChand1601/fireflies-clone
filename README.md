# Fireflies Clone

Meeting intelligence workspace (Phase 1 foundation).

## Stack

- Next.js
- TypeScript
- FastAPI
- SQLite
- SQLAlchemy

## Structure

- `frontend/` — Next.js App Router client (TypeScript, Tailwind CSS, shadcn/ui).
- `backend/` — FastAPI API with SQLAlchemy and SQLite.

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000

### Frontend

```bash
cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

App: http://localhost:3000
