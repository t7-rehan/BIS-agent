# BIS Intelligent Assistant — Backend Foundation (Phase 1–3)

Production-ready backend API foundation and structured database layer for the **AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers**.

> 📌 **Current Status: Phase 3 — Database Foundation + Project Memory Completed**  
> This backend houses the FastAPI service layer, Pydantic validation schemas, and the persistent SQLite relational database powered by SQLAlchemy 2.0. Curated datasets from Phase 2 are seeded with full relational integrity.

---

## Tech Stack

- **Language:** Python 3.10+ (Tested on Python 3.11)
- **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **ASGI Server:** [Uvicorn](https://www.uvicorn.org/)
- **Database & ORM:** SQLite 3 & [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Data Validation:** [Pydantic v2](https://docs.pydantic.dev/) & [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- **Environment Management:** [python-dotenv](https://github.com/theskumar/python-dotenv)
- **Testing:** [pytest](https://docs.pytest.org/) & [httpx](https://www.python-httpx.org/)

---

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py          # Package initialization
│   ├── main.py              # FastAPI app factory, CORS, exception handlers, lifespan
│   │
│   ├── api/
│   │   ├── __init__.py      # Aggregate API router
│   │   ├── health.py        # GET /api/health endpoint
│   │   └── chat.py          # POST /api/chat endpoint
│   │
│   ├── core/
│   │   ├── __init__.py      # Core module initialization
│   │   └── config.py        # Application settings (DATABASE_URL, CORS, API prefix)
│   │
│   ├── db/                  # Phase 3: Database layer
│   │   ├── __init__.py      # Database exports
│   │   ├── database.py      # SQLite engine, session maker, get_db dependency
│   │   ├── models.py        # SQLAlchemy 2.0 models & M2M association tables
│   │   └── seed.py          # Idempotent seed script reading rag/data/*.json
│   │
│   ├── models/
│   │   ├── __init__.py      # Schemas export
│   │   └── schemas.py       # Pydantic models: ChatRequest, ChatResponse, HealthResponse
│   │
│   └── services/
│       ├── __init__.py      # Services export
│       ├── chat_service.py  # ChatService processing queries with foundation response
│       └── query_service.py # BISQueryService structured database query methods
│
├── data/
│   ├── .gitkeep
│   └── bis.db               # SQLite database file (git-ignored, seeded on demand)
│
├── tests/
│   ├── __init__.py          # Test suite package
│   ├── test_health.py       # Health and root endpoint tests
│   ├── test_chat.py         # Chat endpoint validation and structure tests
│   ├── test_rag_data.py     # Dataset validation and ingestion parser tests
│   └── test_database.py     # Models, seeding, relations, and query service tests
│
├── requirements.txt         # Python dependencies
├── pytest.ini               # Pytest configuration (pythonpath = . ..)
├── .env.example             # Safe environment variables template
└── README.md                # Backend documentation
```

---

## Getting Started

### Prerequisites

- Python 3.10 or higher installed on your system.

### 1. Set Up Virtual Environment

Navigate to the `backend` directory:

```bash
cd backend
```

**On Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**On macOS / Linux (Bash):**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

Default configuration variables in `.env`:
```env
APP_NAME=BIS Intelligent Assistant Backend
APP_VERSION=0.1.0
ENVIRONMENT=development
API_PREFIX=/api
DATABASE_URL=sqlite:///./data/bis.db
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

---

## Database Seeding

Populate the local SQLite database from the curated Phase 2 datasets:

```powershell
# From backend directory
python -m app.db.seed
```

This imports:
- **26 Indian Standards**
- **23 Products** (with 70+ aliases)
- **16 Quality Control Orders (QCOs)**
- **20 Certification Schemes**
- **20 Testing Laboratories**
- **12 General Knowledge Articles**

The seeding process is completely **idempotent** and safe to run multiple times.

---

## Running the Application

Execute Uvicorn from the `backend` directory:

```bash
uvicorn app.main:app --reload --port 8000
```

The server will be available at:
- **API Base:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`

---

## API Endpoints

### 1. Health Check
- **Route:** `GET /api/health`
- **Description:** Verifies service liveness and returns application metadata.
- **Sample Response (HTTP 200):**
  ```json
  {
    "status": "ok",
    "service": "bis-intelligent-assistant-backend",
    "version": "0.1.0"
  }
  ```

### 2. Chat Query
- **Route:** `POST /api/chat`
- **Description:** Accepts a user query and returns a structured response.
- **Sample Response (HTTP 200):**
  ```json
  {
    "answer": "Backend connection is working. AI and BIS knowledge retrieval will be added in later phases.",
    "intent": "GENERAL_QUERY",
    "sources": [],
    "confidence": null
  }
  ```

---

## Running Automated Tests

Run the full automated test suite from the `backend` directory:

```bash
pytest -v
```

All 27 automated tests verify:
- API endpoint availability and input validation
- Database initialization and table creation
- Seed execution and idempotency
- Standard and product retrieval by ID, IS number, and keyword/alias search
- Many-to-many relationships (Product <-> Standard, Product <-> QCO, Laboratory <-> Standard)
- Reverse lookups (find products by standard, find labs by standard)
- Foreign key constraints enforcement
- Ingestion parsers and dataset relational integrity
