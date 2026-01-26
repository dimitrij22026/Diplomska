# AI-Powered Personal Finance Advisor

This repository contains the diploma project for building an AI-driven personal finance assistant composed of a FastAPI backend, a React (Vite + TypeScript) frontend, and supporting infrastructure.

## Repository Structure

```
backend/   # FastAPI service, models, services, and database migrations
frontend/  # React + Vite client application
infra/     # Docker, MySQL, and deployment scripts/configuration
docs/      # Project briefs, specifications, and supplementary documentation
```

## Immediate Next Steps

1. **Backend foundation**
   - Configure Python 3.11 virtual environment
   - Initialize FastAPI project with SQLAlchemy, Alembic, and dependency management via `requirements.txt` or `pyproject.toml`
   - Prepare configuration scaffolding for MySQL connection, service layers, and testing utilities
2. **Frontend foundation**
   - Bootstrap Vite + React + TypeScript app with ESLint/Prettier
   - Define shared UI layout, routing shell, and API client helpers
3. **DevOps & Tooling**
   - Add `.gitignore`, `.editorconfig`, and base Docker setup for consistent dev environments
   - Plan CI/test strategy (GitHub Actions)

## Documentation

See `docs/ai-personal-finance-brief.md` for the full project brief. Additional docs (API specs, DB schema, user flows) will be added as the project evolves.
