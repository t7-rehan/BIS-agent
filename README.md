# AI-Powered Intelligent Assistant for Indian Standards & BIS Services

An AI-powered conversational assistant that helps industries, MSMEs, manufacturers, and consumers navigate Indian Standards and Bureau of Indian Standards (BIS) services. Built for the **Smart India Hackathon (SIH)**.

> ✅ **Status: MVP Complete — Phases 1–7 Finished, 100% SIH-Ready**

---

## Problem Statement

Industries, MSMEs, manufacturers, and consumers frequently struggle to navigate the landscape of Indian Standards and BIS services. Common difficulties include:

- Identifying which Indian Standard applies to a given product
- Understanding BIS certification requirements
- Determining whether certification is mandatory or voluntary for a product
- Understanding Quality Control Orders (QCOs) and their applicability
- Finding relevant testing laboratories for required tests
- Understanding hallmarking requirements for precious metals
- Navigating the broader set of BIS services and information available to consumers and industry

This information is often spread across multiple official sources and can be difficult to interpret without domain expertise.

---

## Solution

An AI-powered conversational assistant acting as an intelligent interface over authorized BIS knowledge sources — not a generic chatbot. Every answer is grounded in curated, evidence-backed official data.

```
User Query
  → Intent Detection
  → Entity / Context Extraction
  → Hybrid Retrieval (SQLite + ChromaDB)
  → Evidence Assembly
  → Gemini Response Generation
  → Anti-Hallucination Validation
  → Source-Backed Response
```

---

## Key Features

- **Natural-Language BIS Queries** — Conversational query answering grounded in official standards, QCOs, and guidelines
- **Indian Standard Recommendation** — Matches products and keywords to exact IS codes (26 standards, 23 products covered)
- **Product Classification & Alias Matching** — Maps commercial names and vernacular terms to statutory product definitions
- **BIS Certification Guidance** — Step-by-step guidance for Scheme I (ISI Mark), Scheme II (CRS), FMCS, and ECO Mark
- **QCO & Compliance Intelligence** — Determines mandatory vs voluntary certification with ministry order links
- **Laboratory Discovery** — Finds BIS-recognized and LRS-accredited testing laboratories with clause-level scopes
- **Hallmarking Guidance** — Gold and silver hallmarking rules, 6-digit HUID verification, and jeweler compliance
- **Consumer Service Assistance** — BIS CARE app navigation, ISI counterfeit verification, and grievance filing
- **Hybrid Search / Retrieval** — Combined BM25/keyword and dense semantic vector search via ChromaDB
- **Evidence-Backed Responses** — Responses synthesized strictly from official evidence packages with source citations
- **Anti-Hallucination Validation** — Filters out invented IS numbers and unsupported mandatory compliance claims
- **Clarifying Questions** — Interactive prompts when queries are underspecified (e.g. bare product names)
- **Multi-Turn Conversations** — Context inheritance across follow-up questions ("Is it mandatory?" resolves to the prior product)
- **Offline Fallback Mode** — Deterministic mock synthesizer when `GEMINI_API_KEY` is absent; returns grounded evidence
- **Rich UI** — Confidence badges, entity chips (Standard / Product / QCO), clickable source citations, evidence summary points

---

## Technology Stack

| Component          | Technology                                         |
|--------------------|----------------------------------------------------|
| Frontend           | React 19, Vite 8, TypeScript 6, Tailwind CSS 3     |
| Routing            | React Router v7                                    |
| Animation          | Framer Motion 13                                   |
| Frontend Tests     | Vitest 4 + React Testing Library 16                |
| Backend            | Python, FastAPI, Uvicorn                           |
| ORM / Database     | SQLAlchemy 2.0, SQLite 3                           |
| Validation         | Pydantic v2, pydantic-settings                     |
| Vector DB          | ChromaDB 0.4                                       |
| Embeddings         | FastEmbed / ONNX Runtime (`all-MiniLM-L6-v2`, 384-dim) |
| LLM                | Google Gemini (`gemini-2.5-flash`) via google-genai SDK |
| Backend Tests      | Pytest 8, HTTPX                                    |

---

## Repository Structure

```
BIS-agent/
│
├── Frontend/                    # React/Vite SPA
│   ├── src/
│   │   ├── pages/               # Home, Assistant, Standards, Compliance,
│   │   │                        # Laboratories, Services, Consumer, Knowledge,
│   │   │                        # Alerts, Dashboard, Settings, + detail views
│   │   ├── components/          # ai/, common/, compliance/, laboratories/,
│   │   │                        # layout/, standards/
│   │   ├── services/            # aiService.ts, standardsService.ts,
│   │   │                        # complianceService.ts, laboratoryService.ts,
│   │   │                        # alertService.ts
│   │   ├── context/             # AppContext.tsx (global state)
│   │   ├── types/               # TypeScript interfaces
│   │   └── __tests__/           # Vitest component tests (12 tests)
│   ├── public/                  # favicon.svg, icons.svg
│   └── package.json
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── api/                 # chat.py, health.py  (GET /api/health, POST /api/chat)
│   │   ├── core/                # config.py  (pydantic-settings)
│   │   ├── db/                  # database.py, models.py, seed.py
│   │   ├── models/              # schemas.py  (Pydantic request/response models)
│   │   └── services/
│   │       ├── intent_service.py    # Deterministic regex + vocabulary intent classifier
│   │       ├── orchestrator.py      # Central pipeline (intent → retrieval → LLM → validate)
│   │       ├── llm_service.py       # Gemini SDK wrapper with retry + timeout + mock fallback
│   │       ├── query_service.py     # SQLite relational lookups
│   │       ├── chat_service.py      # API ↔ orchestrator bridge
│   │       └── response_validator.py # Anti-hallucination citation filter
│   ├── data/                    # bis.db (SQLite), chroma/ (vector store) — git-ignored
│   ├── tests/                   # 90 pytest tests across 12 modules + SIH benchmark
│   └── requirements.txt
│
├── rag/                         # Knowledge ingestion & retrieval pipeline
│   ├── data/                    # Curated JSON datasets
│   │   ├── standards.json           # 26 Indian Standards
│   │   ├── products.json            # 23 products with aliases
│   │   ├── qcos.json                # Quality Control Orders
│   │   ├── certification_schemes.json
│   │   ├── laboratories.json        # BIS-recognized test labs
│   │   └── general_knowledge.json   # BIS regulatory articles
│   ├── ingestion/               # HTTP fetcher, PDF/HTML parsers, source registry
│   ├── chunking/                # Semantic chunker (700 token chunks, 80 overlap)
│   ├── embeddings/              # FastEmbed/ONNX embedding generation
│   ├── vector_store/            # ChromaStore wrapper (persistent, idempotent upsert)
│   ├── retrieval/               # BISHybridRetriever (semantic + relational fusion)
│   ├── sources/                 # Authoritative source registry
│   ├── raw/                     # Raw downloaded source documents
│   ├── processed/               # Cleaned/processed documents
│   ├── index.py                 # CLI indexing pipeline (python -m rag.index)
│   └── validate_data.py         # Data integrity checker (duplicate IDs, broken refs)
│
├── docs/
│   ├── PHASE_7_COMPLETION_REPORT.md
│   ├── SIH_DEMO_CHECKLIST.md
│   ├── CHATBOT_BUG_FIX_REPORT.md
│   └── BIS_KNOWLEDGE_EXPANSION_PLAN.md
│
├── tests/rag/                   # RAG-level integration tests
├── .agents/rules/               # AI coding rules
├── Architecture (1).md          # Detailed system architecture document
└── README.md
```

---

## System Architecture

```
                      ┌─────────────────┐
                      │      USER       │
                      └────────┬────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │ React 19 / Vite │   Chat UI, confidence badges,
                      │   Frontend      │   entity chips, source citations
                      └────────┬────────┘
                               │ POST /api/chat
                               ▼
                      ┌─────────────────┐
                      │    FastAPI      │   Request validation, CORS,
                      │   REST Layer    │   error handling
                      └────────┬────────┘
                               │
                               ▼
               ┌──────────────────────────────┐
               │       AI ORCHESTRATOR        │
               │                              │
               │  Intent Detection            │
               │  Entity / Context Extraction │
               │  Retrieval Planning          │
               │  Evidence Assembly           │
               │  Response Generation         │
               │  Anti-Hallucination Check    │
               └──────────┬───────────────────┘
                          │
           ┌──────────────┴──────────────┐
           ▼                             ▼
  ┌────────────────┐           ┌──────────────────┐
  │  SQLite / ORM  │           │   Hybrid RAG     │
  │                │           │                  │
  │  Standards     │           │  ChromaDB        │
  │  Products      │           │  all-MiniLM-L6   │
  │  QCOs          │           │  Semantic Search │
  │  Schemes       │           │  Chunking        │
  │  Laboratories  │           │  Metadata        │
  └───────┬────────┘           └──────────┬───────┘
          └──────────────┬───────────────┘
                         ▼
                ┌─────────────────┐
                │ Evidence Package│
                │ Sources, Entities│
                │ Confidence Score │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  Google Gemini  │
                │  gemini-2.5-flash│
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  Validation /   │
                │  Anti-Hallucin. │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────────────────┐
                │ Answer + Confidence + Sources│
                └──────────────────────────────┘
```

---

## API Endpoints

| Method | Path             | Description                                    |
|--------|------------------|------------------------------------------------|
| GET    | `/`              | Service metadata and links to docs             |
| GET    | `/api/health`    | Health check (uptime, version, environment)    |
| POST   | `/api/chat`      | Main chat endpoint — returns AI response       |
| GET    | `/docs`          | Interactive Swagger UI                         |
| GET    | `/redoc`         | ReDoc API documentation                        |

**Chat request body:**

```json
{
  "message": "Which Indian Standard applies to pressure cookers?",
  "session_id": "optional-session-id",
  "context": []
}
```

**Chat response shape:**

```json
{
  "answer": "...",
  "intent": "PRODUCT_STANDARD_QUERY",
  "confidence": 0.81,
  "confidence_level": "HIGH",
  "needs_clarification": false,
  "sources": [...],
  "evidence_used": [...],
  "entities": { "product_id": "PROD-PRESSURE-COOKER" },
  "warnings": [],
  "generation_mode": "bis_rag"
}
```

---

## Intent Classification

The deterministic intent classifier (`intent_service.py`) routes queries without relying on the LLM for classification:

| Intent                  | Triggers                                                       |
|-------------------------|----------------------------------------------------------------|
| `GREETING`              | "hi", "hello", "namaste", time-of-day greetings               |
| `CASUAL_CONVERSATION`   | "thanks", "how are you", capability questions                  |
| `PRODUCT_STANDARD_QUERY`| Product names, "which standard", "applies to"                  |
| `QCO_COMPLIANCE_QUERY`  | "mandatory", "qco", "quality control order", "enforce"         |
| `CERTIFICATION_QUERY`   | "scheme i/ii", "isi mark", "crs", "fmcs", "licence"           |
| `LABORATORY_QUERY`      | "lab", "test", "testing", "where to test", "accredited"        |
| `HALLMARKING_QUERY`     | "hallmark", "gold", "silver", "huid", "carat"                  |
| `CONSUMER_SERVICE_QUERY`| "complaint", "grievance", "bis care", "fake isi"               |
| `GENERAL_BIS_QUERY`     | "what is bis", "bureau of indian standards"                    |
| `STANDARD_LOOKUP`       | IS number mentioned directly                                   |
| `GENERAL_INFORMATION`   | General "what is X" questions without BIS-specific signals     |
| `UNKNOWN_QUERY`         | Fallback — no matching signal                                  |

Multi-turn context: if a follow-up question lacks a product or standard, the service inherits entities from the prior conversation turns.

---

## Knowledge Base

Located in `rag/data/`. The MVP dataset covers:

| Dataset                        | Records |
|-------------------------------|---------|
| Indian Standards (`standards.json`)      | 26      |
| Products with aliases (`products.json`)  | 23      |
| Quality Control Orders (`qcos.json`)     | 6+      |
| Certification Schemes                    | 6       |
| Testing Laboratories                     | 11      |
| General Knowledge Articles               | ~20     |
| BIS Services (`bis_services.json`)       | Optional|

All JSON datasets are validated by `rag/validate_data.py` for duplicate IDs, missing IS references, and broken relational links before being indexed into ChromaDB or seeded into SQLite.

---

## Test Coverage

| Test Suite                          | Framework                   | Tests | Status    |
|-------------------------------------|-----------------------------|-------|-----------|
| Backend core & unit tests           | Pytest 8 (Python 3.11)      | 69    | ✅ 100%   |
| Backend SIH evaluation benchmark    | Pytest 8 (Python 3.11)      | 21    | ✅ 100%   |
| Frontend conversational UI tests    | Vitest 4 + RTL              | 12    | ✅ 100%   |
| **Total**                           |                             | **102** | **100%** |

Backend test modules: `test_health`, `test_chat`, `test_database`, `test_embeddings`, `test_vector_store`, `test_rag_data`, `test_retrieval`, `test_intent`, `test_llm`, `test_response_validation`, `test_orchestrator`, `test_sih_evaluation`, `test_bug_fixes`, `test_conversational_flow`.

---

## How to Run

### Prerequisites

- **Python 3.11+**
- **Node.js 20+** and **npm**
- A **Google Gemini API key** (get one free at [aistudio.google.com](https://aistudio.google.com)). The backend also runs offline without one using the deterministic fallback.

---

### 1. Clone and set up the backend

```bash
# From the repo root
cd backend

# Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Configure environment variables:**

```bash
# Copy the example file
copy .env.example .env        # Windows
cp .env.example .env          # macOS/Linux

# Open .env and set your Gemini API key:
# GEMINI_API_KEY=your_key_here
```

Key settings in `.env`:

| Variable                  | Default                          | Description                                |
|---------------------------|----------------------------------|--------------------------------------------|
| `GEMINI_API_KEY`          | *(empty)*                        | Google Gemini API key. Leave blank to run in offline mock mode. |
| `GEMINI_MODEL`            | `gemini-2.5-flash`               | Gemini model name                          |
| `DATABASE_URL`            | `sqlite:///./data/bis.db`        | SQLite database path                       |
| `CHROMA_PERSIST_DIRECTORY`| `./data/chroma`                  | ChromaDB storage directory                 |
| `EMBEDDING_MODEL_NAME`    | `all-MiniLM-L6-v2`               | Sentence embedding model                   |
| `RETRIEVAL_TOP_K`         | `5`                              | Number of semantic chunks to retrieve      |
| `MOCK_LLM`                | `false`                          | Force offline fallback mode                |

---

### 2. Seed the database

Run this from inside the `backend/` directory (with the venv active):

```bash
python -m app.db.seed
```

This imports all curated JSON datasets from `rag/data/` into the SQLite database at `data/bis.db`. The seed is idempotent — safe to re-run.

---

### 3. Index the vector store

Run this from the **repo root** (not inside `backend/`):

```bash
python -m rag.index
```

For a clean rebuild:

```bash
python -m rag.index --reset
```

This chunks all BIS knowledge, generates 384-dim embeddings, and upserts them into ChromaDB at `backend/data/chroma/`.

---

### 4. Start the backend server

From inside the `backend/` directory (with the venv active):

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at:
- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

---

### 5. Set up and start the frontend

Open a new terminal from the repo root:

```bash
cd Frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env        # Windows
cp .env.example .env          # macOS/Linux
# VITE_API_URL=http://localhost:8000  (default, no change needed)

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

### 6. Run the tests

**Backend tests** (from `backend/` with venv active):

```bash
pytest -v tests
```

**Frontend tests** (from `Frontend/`):

```bash
npm test
```

**Validate RAG data integrity** (from repo root):

```bash
python rag/validate_data.py
```

---

### Quick start summary

```
Terminal 1 — Backend:
  cd backend && .venv\Scripts\activate
  python -m app.db.seed
  uvicorn app.main:app --reload --port 8000

Terminal 2 — Index (run once, then close):
  python -m rag.index

Terminal 3 — Frontend:
  cd Frontend && npm install && npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                  | Default                          | Description                         |
|---------------------------|----------------------------------|-------------------------------------|
| `APP_NAME`                | `BIS Intelligent Assistant Backend` | Service display name              |
| `APP_VERSION`             | `0.1.0`                          | API version                         |
| `ENVIRONMENT`             | `development`                    | Runtime environment label           |
| `API_PREFIX`              | `/api`                           | API route prefix                    |
| `DATABASE_URL`            | `sqlite:///./data/bis.db`        | SQLAlchemy database URL             |
| `CHROMA_PERSIST_DIRECTORY`| `./data/chroma`                  | ChromaDB storage path               |
| `CHROMA_COLLECTION_NAME`  | `bis_knowledge`                  | ChromaDB collection name            |
| `EMBEDDING_MODEL_NAME`    | `all-MiniLM-L6-v2`               | Embedding model for vector search   |
| `RETRIEVAL_TOP_K`         | `5`                              | Top-k semantic chunks to retrieve   |
| `GEMINI_API_KEY`          | *(empty)*                        | Google Gemini API key               |
| `GEMINI_MODEL`            | `gemini-2.5-flash`               | Gemini model identifier             |
| `LLM_TEMPERATURE`         | `0.1`                            | LLM generation temperature          |
| `LLM_MAX_OUTPUT_TOKENS`   | `1024`                           | Max tokens per LLM response         |
| `LLM_TIMEOUT_SECONDS`     | `30`                             | Hard wall-clock timeout for LLM API |
| `MOCK_LLM`                | `false`                          | `true` to force deterministic fallback |
| `FRONTEND_URL`            | `http://localhost:5173`          | Primary allowed CORS origin         |
| `ALLOWED_ORIGINS`         | *(comma-separated)*              | All CORS-allowed origins            |

### Frontend (`Frontend/.env`)

| Variable        | Default                    | Description              |
|-----------------|----------------------------|--------------------------|
| `VITE_API_URL`  | `http://localhost:8000`    | Backend API base URL     |

---

## Target Users

| User                  | Primary Need                                                         |
|-----------------------|----------------------------------------------------------------------|
| Consumers             | Understand BIS services, verify ISI marks, report substandard goods |
| MSMEs                 | Identify applicable standards and certification requirements         |
| Manufacturers         | Understand compliance, testing requirements, and QCO mandates        |
| Industries            | Navigate standards, certification, QCOs, and laboratories            |
| Students / Researchers| Discover and understand BIS standards and related information        |

---

## Project Status

**Phase 1 — Backend Foundation:** FastAPI app, Pydantic schemas, CORS, lifecycle, structured error handlers  
**Phase 2 — BIS Knowledge Acquisition:** 26 standards, 23 products, QCOs, labs, certification schemes — curated as JSON  
**Phase 3 — Database Foundation:** SQLite 3, SQLAlchemy 2.0, relational models, idempotent seed pipeline  
**Phase 4 — RAG + Vector Search:** FastEmbed ONNX, ChromaDB, semantic chunker, hybrid retriever  
**Phase 5 — LLM Integration + AI Orchestration:** Gemini SDK (`gemini-2.5-flash`), deterministic intent classifier, anti-hallucination validation, multi-turn context  
**Phase 6 — Frontend Integration:** React 19, full-stack `aiService.ts` (zero mocks), rich metadata chips, clickable sources  
**Phase 7 — Testing, SIH Demo & Final Polish:** 102 automated tests (100% pass), 20-case SIH evaluation benchmark, anti-hallucination hardening, SIH demo playbook

All MVP requirements finalized, tested, and verified.

---

## Accuracy & Trust

The system is designed to:

- Ground answers exclusively in retrieved, verified BIS evidence
- Refuse to generate unsupported IS numbers or mandatory compliance claims
- Provide source citations linking back to official BIS/government resources
- Expose a confidence score (`HIGH` / `MEDIUM` / `LOW` / `INSUFFICIENT_EVIDENCE`) reflecting retrieval quality
- Ask clarifying questions when queries are underspecified
- Fall back gracefully when Gemini is unavailable — returning structured evidence from the database

> For compliance, legal, or regulatory decisions, always verify against official BIS/government sources at [bis.gov.in](https://www.bis.gov.in).

---

## Known Limitations

- **Dataset scale:** MVP covers 26 standards and 23 products. Full national coverage (22,000+ IS standards) is a future expansion.
- **Database:** SQLite is used for development and demo. Production deployments should migrate to PostgreSQL.
- **Informational only:** This assistant provides guidance; formal legal or regulatory decisions require verification against official Gazette notifications.

---

## Security

- API keys and credentials must never be committed — use `.env` files (`.gitignore`d)
- CORS is restricted to configured frontend origins
- All external citation links use `rel="noopener noreferrer"` and `target="_blank"`
- Input validation enforced by Pydantic on every API request
- No secrets, `.env`, `*.db`, or `chroma/` data are tracked in Git

---

## Contributing

1. Read `.agents/rules/Rules (1).md`
2. Read `Architecture (1).md`
3. Understand the current phase before making changes
4. Make focused, phase-appropriate changes
5. Run `pytest -v tests` (backend) and `npm test` (frontend) before committing
6. Do not implement future-phase functionality without agreement

---

## Disclaimer

This assistant is an informational tool and should not be treated as an official BIS authority or a substitute for current official regulations, standards, notifications, or government decisions. For compliance-related decisions, verify current information through official BIS/government sources.

---

## License

License: To Be Decided

---

## Contact / Team

Team and contact information will be added later.
