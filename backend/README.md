# BIS Intelligent Assistant — Backend & AI Orchestration (Phases 1–5)

Production-ready backend API, structured relational database, hybrid RAG retriever, and AI orchestrator for the **AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers**.

> 📌 **Current Status: Phase 5 — LLM Integration + AI Orchestration Completed**  
> This backend houses the FastAPI service layer, Pydantic validation schemas, persistent SQLite relational database powered by SQLAlchemy 2.0, local ChromaDB vector store, and the Phase 5 AI Orchestration pipeline integrating Google Gemini (via `google-genai` SDK) with deterministic intent routing and strict anti-hallucination validation.

---

## Tech Stack

- **Language:** Python 3.10+ (Tested on Python 3.11)
- **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **ASGI Server:** [Uvicorn](https://www.uvicorn.org/)
- **Database & ORM:** SQLite 3 & [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Vector Database:** [ChromaDB](https://www.trychroma.com/)
- **Embeddings:** FastEmbed (`BAAI/bge-small-en-v1.5` / `all-MiniLM-L6-v2`) via ONNX Runtime
- **LLM Integration:** Official Google GenAI SDK (`google-genai==2.22.0`, `gemini-2.5-flash`)
- **Data Validation:** [Pydantic v2](https://docs.pydantic.dev/) & [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- **Testing:** [pytest](https://docs.pytest.org/) & [httpx](https://www.python-httpx.org/) (69 tests, 100% pass rate)

---

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py               # Package initialization
│   ├── main.py                   # FastAPI app factory, CORS, exception handlers, lifespan
│   │
│   ├── api/
│   │   ├── __init__.py           # Aggregate API router
│   │   ├── health.py             # GET /api/health endpoint
│   │   └── chat.py               # POST /api/chat endpoint (routed to AI Orchestrator)
│   │
│   ├── core/
│   │   ├── __init__.py           # Core module initialization
│   │   └── config.py             # Application settings (DATABASE_URL, GEMINI_*, CORS, API prefix)
│   │
│   ├── db/                       # Phase 3: Database layer
│   │   ├── __init__.py           # Database exports
│   │   ├── database.py           # SQLite engine, session maker, get_db dependency
│   │   ├── models.py             # SQLAlchemy 2.0 models & M2M association tables
│   │   └── seed.py               # Idempotent seed script reading rag/data/*.json
│   │
│   ├── models/
│   │   ├── __init__.py           # Schemas export
│   │   └── schemas.py            # Pydantic models: ChatRequest, ChatResponse, EvidencePackage, IntentResult
│   │
│   └── services/
│       ├── __init__.py           # Services export
│       ├── chat_service.py       # ChatService bridging API and Orchestrator
│       ├── query_service.py      # BISQueryService structured database query methods
│       ├── intent_service.py     # Phase 5: Deterministic intent classifier & entity extractor
│       ├── llm_service.py        # Phase 5: Gemini LLM service (google-genai) with offline fallback
│       ├── orchestrator.py       # Phase 5: Central AI Orchestrator (Intent -> RAG -> LLM -> Validation)
│       └── response_validator.py # Phase 5: Anti-hallucination verification & citation checker
│
├── data/
│   ├── .gitkeep
│   ├── bis.db                    # SQLite database file (git-ignored, seeded on demand)
│   └── chroma/                   # ChromaDB vector store directory (git-ignored)
│
├── tests/
│   ├── __init__.py               # Test suite package
│   ├── test_health.py            # Health and root endpoint tests
│   ├── test_chat.py              # Chat endpoint validation & clarification tests
│   ├── test_rag_data.py          # Dataset validation and ingestion parser tests
│   ├── test_database.py          # Models, seeding, relations, and query service tests
│   ├── test_embeddings.py        # Local vector embedding tests
│   ├── test_vector_store.py      # ChromaDB collection & search tests
│   ├── test_retrieval.py         # Semantic & hybrid retriever benchmark tests
│   ├── test_intent.py            # Phase 5: Intent classification & clarification tests
│   ├── test_llm.py               # Phase 5: Gemini LLM service & error handling tests
│   ├── test_orchestrator.py      # Phase 5: End-to-end orchestration pipeline tests
│   └── test_response_validation.py # Phase 5: Anti-hallucination validation tests
│
├── requirements.txt              # Python dependencies
├── pytest.ini                    # Pytest configuration (pythonpath = . ..)
├── .env.example                  # Safe environment variables template
└── README.md                     # Backend documentation
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

Key configuration variables in `.env`:
```env
APP_NAME=BIS Intelligent Assistant Backend
APP_VERSION=0.1.0
ENVIRONMENT=development
API_PREFIX=/api
DATABASE_URL=sqlite:///./data/bis.db
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000

# Phase 5: Google Gemini LLM Integration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
LLM_TEMPERATURE=0.1
LLM_MAX_OUTPUT_TOKENS=1024
LLM_TIMEOUT_SECONDS=30.0
MOCK_LLM=false
```

> 🔒 **Security:** If `GEMINI_API_KEY` is unset or empty, the assistant automatically uses an offline fallback response without crashing. When running automated tests, `MOCK_LLM=true` or test fixtures mock the Gemini API completely.

---

## Database & Vector Store Seeding

1. Populate the local SQLite database from the curated Phase 2 datasets:
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

2. Index the knowledge base into ChromaDB:
   ```powershell
   # From repository root
   python -m rag.index
   ```

Both seeding and indexing processes are completely **idempotent** and safe to run repeatedly.

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

### 2. Chat Query (AI Orchestrator)
- **Route:** `POST /api/chat`
- **Description:** Accepts a user query and returns a structured, evidence-backed answer synthesized from SQLite relational records, ChromaDB semantic chunks, and Google Gemini with anti-hallucination validation.
- **Request Body:**
  ```json
  {
    "message": "Which Indian Standard applies to pressure cookers and is ISI certification mandatory?",
    "session_id": "optional-session-id"
  }
  ```
- **Sample Response (HTTP 200):**
  ```json
  {
    "answer": "Domestic pressure cookers are governed by Indian Standard **IS 2347:2017** (*Domestic Pressure Cookers — Specification*). Under the Domestic Pressure Cooker (Quality Control) Order, 2020 issued by DPIIT, BIS certification under Scheme-I (ISI Mark) is **mandatory** for manufacture, import, distribution, and sale in India.",
    "intent": "QCO_COMPLIANCE_QUERY",
    "confidence": 0.95,
    "sources": [
      {
        "id": "qco_dpiit_pressure_cookers_2020",
        "title": "Domestic Pressure Cooker (Quality Control) Order, 2020",
        "url": "https://dpiit.gov.in/sites/default/files/QCO_Pressure_Cooker_2020.pdf",
        "doc_type": "qco",
        "source_org": "DPIIT / Ministry of Commerce and Industry"
      },
      {
        "id": "is_2347_2017",
        "title": "IS 2347:2017 Domestic Pressure Cookers — Specification",
        "url": "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/2347",
        "doc_type": "standard",
        "source_org": "Bureau of Indian Standards"
      }
    ],
    "entities": {
      "product_name": "Domestic Pressure Cookers",
      "is_number": "IS 2347:2017",
      "certification_type": "ISI Mark (Scheme I)"
    },
    "requires_clarification": false,
    "suggested_clarifications": []
  }
  ```

---

## Running Automated Tests

Run the full automated test suite from the `backend` directory:

```bash
pytest -v
```

All **69 automated tests** verify:
- API endpoint availability, error handling, and input validation
- Database initialization, table creation, foreign keys, and seed idempotency
- Standard and product retrieval by ID, IS number, and keyword/alias search
- Many-to-many relationships (Product <-> Standard, Product <-> QCO, Laboratory <-> Standard)
- Reverse lookups (find products by standard, find labs by standard)
- FastEmbed vector embeddings and cosine similarity ranking
- ChromaDB collection lifecycle, idempotent upserts, and vector queries
- Hybrid retrieval with precision score cutoffs and benchmark evaluation suite (15 queries)
- Deterministic intent classification (9 categories) and underspecified query clarification prompts
- Google GenAI SDK integration, conservative generation parameters, and offline fallback
- Anti-hallucination validation (checking non-existent IS numbers and unsupported mandatory claims)
- End-to-end Orchestrator pipeline synthesizing hybrid evidence into structured responses

