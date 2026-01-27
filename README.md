# App Launch

# Backend

cd backend; $env:PYTHONPATH="backend"; python -m uvicorn app.main:app --host 127.0.0.1 --port 8001

# frontend:

cd frontend; npm run dev

Repo:
https://github.com/dimitrij22026/Diplomska


# AI-Powered Personal Finance Advisor

A comprehensive personal finance management application that uses AI to provide personalized financial advice, budget recommendations, and spending insights through an intuitive web interface.


# Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Git


# Backend Setup

1. **Navigate to backend directory:**
   cd backend

2. **Create virtual environment:**
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate

3. **Install dependencies:**
   pip install -r requirements.txt

4. **Set up environment variables:**
   cp .env.example .env
   # Edit .env with your database credentials and OpenAI API key

5. **Start the development server:**
   uvicorn app.main:app --reload

   # API will be available at http://localhost:8000
   # Documentation at http://localhost:8000/docs

# Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

#  Technology Stack

# Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Default database (automatic table creation)
- **PyMySQL**: Optional MySQL database connector
- **Pydantic**: Data validation
- **PassLib**: Password hashing
- **Python-JOSE**: JWT token handling

# Frontend
- **React 19**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **TanStack Query**: Data fetching and caching
- **Recharts**: Chart library for analytics
- **Zod**: Schema validation
- **Lucide React**: Icon library

#  Database Schema

The application uses MySQL with the following main entities:
- **Users**: User accounts with authentication
- **Transactions**: Income and expense records
- **Budgets**: Spending limits by category
- **SavingsGoals**: Financial targets
- **Advice**: AI-generated recommendations

#  Testing

Run backend tests:
```bash
cd backend
pytest
```

Run frontend tests (when implemented):
```bash
cd frontend
npm test
```

# Documentation

- [Project Brief](docs/ai-personal-finance-brief.md) - Detailed project requirements (in Macedonian)
- [API Documentation](http://localhost:8000/docs) - Auto-generated OpenAPI docs
- [Database Schema](docs/) - Entity relationships and migrations

#  Academic Context

This project was developed as a diploma thesis exploring the intersection of personal finance management and artificial intelligence. It demonstrates practical application of modern web development practices, data analysis, and AI integration in a real-world problem domain.

#  Future Enhancements

- Bank account synchronization
- Advanced analytics and reporting
- Investment portfolio tracking
- Mobile application
- Advanced AI features (predictive analytics, automated savings)
