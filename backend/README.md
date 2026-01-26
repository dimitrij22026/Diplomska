# Backend Service (FastAPI)

## Requirements
- Python 3.11+
- MySQL 8 (local or remote instance)

## Setup
1. Create a virtual environment inside `backend/`.
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
2. Install dependencies.
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and update database credentials.
4. Run the development server.
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000` and automatically exposes docs at `/docs`.
