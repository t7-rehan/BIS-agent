# BIS Intelligent Assistant — Backend Foundation (Phase 1)

Production-ready backend API foundation for the **AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers**.

> 📌 **Phase Status: Phase 1 — Backend Foundation**  
> This phase establishes the initial API skeleton, configuration, validation schemas, chat service placeholder, error handling, CORS policies, and automated test suite. Advanced features (AI Orchestration, Hybrid RAG, Vector Search, BIS Document Ingestion) will be added in subsequent phases.

---

## Tech Stack

- **Language:** Python 3.10+ (Tested on Python 3.11)
- **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **ASGI Server:** [Uvicorn](https://www.uvicorn.org/)
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
│   │   └── config.py        # Application settings and environment configuration
│   │
│   ├── models/
│   │   ├── __init__.py      # Schemas export
│   │   └── schemas.py       # Pydantic models: ChatRequest, ChatResponse, SourceItem, HealthResponse
│   │
│   └── services/
│       ├── __init__.py      # Services export
│       └── chat_service.py  # ChatService processing queries with placeholder response
│
├── tests/
│   ├── __init__.py          # Test suite package
│   ├── test_health.py       # Health and root endpoint tests
│   └── test_chat.py         # Chat endpoint validation and structure tests
│
├── requirements.txt         # Minimal Phase 1 Python dependencies
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

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Linux / macOS:**
```bash
cp .env.example .env
```

Default configuration variables in `.env`:
```env
APP_NAME=BIS Intelligent Assistant Backend
APP_VERSION=0.1.0
ENVIRONMENT=development
API_PREFIX=/api
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

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
- **Request Body (JSON):**
  ```json
  {
    "message": "What BIS standard applies to electric mixers?"
  }
  ```
- **Sample Response (HTTP 200):**
  ```json
  {
    "answer": "Backend connection is working. AI and BIS knowledge retrieval will be added in later phases.",
    "intent": "GENERAL_QUERY",
    "sources": [],
    "confidence": null
  }
  ```
- **Validation Rules:**
  - `message` must be a non-empty string with non-whitespace characters (1 to 2000 characters).
  - Invalid requests return HTTP 422 with a structured error payload.

---

## Running Automated Tests

Run the test suite using `pytest` from the `backend` directory:

```bash
pytest -v
```

Tests verify:
- Root and health check availability (`GET /` and `GET /api/health`)
- Valid chat request processing (`POST /api/chat`)
- Input validation failures (empty string, whitespace-only, missing body, oversized queries)

---

## Phase 1 Limitations & Roadmap

As this is **Phase 1: Backend Foundation**, the following capabilities are intentionally deferred to future phases:
- ❌ **No Vector Databases or Embeddings:** (Deferred to Phase 5 & 6)
- ❌ **No Document Ingestion / Crawlers:** (Deferred to Phase 4 & 5)
- ❌ **No Live LLM / RAG Pipelines:** (Deferred to Phase 6 & 8)
- ❌ **No Product / QCO Classification Engines:** (Deferred to Phase 9 & 10)
- ❌ **No Authentication / User Accounts:** (Deferred to Phase 14)
