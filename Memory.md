# BIS Intelligent Assistant — Project Memory

## 1. Project Overview

### Project Purpose
The **BIS Intelligent Assistant** is an authoritative, AI-powered conversational system engineered to guide industries, MSMEs, manufacturers, and consumers through Indian Standards (IS), Bureau of Indian Standards (BIS) conformity assessment procedures, Quality Control Orders (QCOs), and recognized testing laboratories.

### SIH Problem Statement
Navigating Indian Standards and statutory BIS compliance is notoriously challenging for small enterprises and citizens. Relevant regulatory information is fragmented across government gazette notifications, ministry circulars (DPIIT, MeitY, MoRTH, Steel, FSSAI), the BIS website, Manakonline, the Compulsory Registration Scheme (CRS) portal, and the Laboratory Information Management System (LIMS). Organizations frequently struggle to determine:
1. Which specific Indian Standard applies to their product.
2. Whether certification is mandatory (via a gazetted QCO) or voluntary.
3. The correct certification scheme (Scheme I ISI Mark vs Scheme II CRS).
4. Statutory enforcement dates, transition buffers, and small-business exemptions.
5. Qualified laboratories recognized by BIS for mandatory product testing.
6. Genuine hallmarking details (HUID) for precious metals.

### Core Objective
Deliver **evidence-backed, source-traceable answers** grounded in official statutory data, strictly eliminating generic AI hallucinations regarding standard numbers, compliance mandates, or enforcement dates.

### Target Users
| User Group | Core Needs |
| :--- | :--- |
| **MSMEs & Startups** | Identify applicable standards, application workflows, fee structures, and exemptions. |
| **Manufacturers & Importers** | Verify mandatory QCO enforcement dates, factory audit rules, and FMCS requirements. |
| **Testing Laboratories** | Review testing scope, clause-level parameters, and BIS recognition criteria (LRS). |
| **Consumers & Buyers** | Verify ISI marks, 6-digit HUID codes on gold, CRS registration numbers, and consumer grievance redressal. |
| **Students & Researchers** | Search standards by division/technical committee, comprehend standard clauses, and track revisions. |

### Core User Flow
```
User Query (Text / Voice)
       │
       ▼
1. Intent & Product Classification  (Identify domain, product keywords, standard codes)
       │
       ▼
2. Structured DB Lookup             (SQLite: Standards, QCOs, Schemes, Labs, Aliases)
       │
       ▼
3. Semantic Vector Search           (ChromaDB / Vector Index over BIS text chunks)
       │
       ▼
4. Evidence Synthesis & Validation  (Cross-check facts, ensure source traceability)
       │
       ▼
5. Orchestrated AI Response         (Precise guidance with official citations and URLs)
```

---

## 2. Current Architecture

```
BIS-agent/
├── .agents/
│   └── rules/
│       └── Rules (1).md            # Core engineering rules & development constitution
│
├── backend/
│   ├── app/
│   │   ├── api/                    # FastAPI routes
│   │   │   ├── __init__.py         # Router aggregation
│   │   │   ├── health.py           # GET /api/health
│   │   │   └── chat.py             # POST /api/chat (Phase 1 conversational foundation)
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py           # Pydantic Settings (APP, CORS, DATABASE_URL)
│   │   │
│   │   ├── db/                     # Phase 3 Database Layer
│   │   │   ├── __init__.py         # DB exports (Base, engine, get_db, init_db, models)
│   │   │   ├── database.py         # SQLite connection, engine, sessionmaker, PRAGMA hook
│   │   │   ├── models.py           # SQLAlchemy 2.0 models & 6 association tables
│   │   │   └── seed.py             # Idempotent seed pipeline from rag/data/*.json
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py          # Pydantic validation schemas (ChatRequest, ChatResponse, etc.)
│   │   │
│   │   └── services/
│   │       ├── __init__.py         # Service exports
│   │       ├── chat_service.py     # Conversational service foundation
│   │       └── query_service.py    # Structured database query service (BISQueryService)
│   │
│   ├── data/
│   │   ├── .gitkeep
│   │   └── bis.db                  # Local SQLite database (git-ignored)
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_health.py          # API health check tests
│   │   ├── test_chat.py            # API chat validation tests
│   │   ├── test_rag_data.py        # Dataset validation & parser unit tests
│   │   └── test_database.py        # Database models, relations, seed, and query tests
│   │
│   ├── .env.example                # Backend environment variable template
│   ├── pytest.ini                  # Pytest configuration with pythonpath = . ..
│   ├── requirements.txt            # Backend Python dependencies
│   └── README.md                   # Backend documentation
│
├── Frontend/                       # React / Vite frontend shell (from previous phases)
│
├── rag/                            # Curated BIS knowledge & document ingestion
│   ├── sources/
│   │   └── sources.json            # 16 authoritative source registry entries
│   ├── data/                       # 6 curated JSON datasets (standards, products, QCOs, etc.)
│   ├── raw/                        # Raw cached fetch documents (.gitkeep)
│   ├── processed/                  # Intermediate clean text (.gitkeep)
│   ├── ingestion/                  # Polite HTTP fetcher, PDF clause parser, HTML cleaner
│   ├── chunking/                   # Semantic text chunker preserving parent metadata
│   ├── validate_data.py            # Standalone dataset relational integrity validator
│   └── README.md                   # RAG knowledge base documentation
│
├── Memory.md                       # THIS FILE — Persistent Project Memory & Handoff
├── Phases.md                       # Comprehensive project roadmap & phase criteria
└── README.md                       # Main repository overview
```

---

## 3. Completed Phases

### Phase 1 — Backend Foundation
- **Objective:** Establish production-ready FastAPI backend shell, standard validation, error handling, CORS policies, and automated test suite.
- **Implemented:**
  - FastAPI app factory with async lifespan context in `backend/app/main.py`.
  - Structured error handlers for `RequestValidationError`, `HTTPException`, and uncaught internal server errors.
  - Endpoints: `GET /` (root discovery), `GET /api/health` (liveness check), `POST /api/chat` (conversational foundation).
  - Pydantic models: `ChatRequest`, `ChatResponse`, `SourceItem`, `HealthResponse`.
  - Initial tests: `test_health.py` and `test_chat.py`.
- **Key Decisions:**
  - Keep `/api/chat` operational with a clean response structure so frontend integration works before AI orchestrator is added.
  - Strict input validation preventing blank or oversized inputs (> 2000 chars).
- **Results:** 8 tests passed.

### Phase 2 — BIS Knowledge Data Collection & Ingestion Foundation
- **Objective:** Collect and curate authoritative BIS datasets across key industries and build document ingestion/chunking utilities with zero hallucination.
- **Implemented:**
  - 6 verified JSON datasets under `rag/data/` (`standards.json`, `products.json`, `qcos.json`, `certification_schemes.json`, `laboratories.json`, `general_knowledge.json`).
  - Source registry in `rag/sources/sources.json` tracking 16 official government and statutory URLs.
  - Ingestion utilities in `rag/ingestion/`: `fetch.py` (polite HTTP with exponential backoff & disk cache), `html_parser.py` (zero-dependency HTML cleaner), `pdf_parser.py` (clause-aware extractor).
  - Semantic chunker in `rag/chunking/chunker.py` attaching provenance metadata (`document_id`, `source_url`, chunk offsets).
  - Automated integrity validator `rag/validate_data.py` validating 100% schema compliance and foreign key links.
- **Key Decisions:**
  - Official statutory sources only (BIS, DPIIT, MeitY, MoRTH, Manakonline, LIMS, Gazette).
  - Mandatory cross-referencing between products, standards, QCOs, certification schemes, and laboratories.
- **Results:** All datasets passed validation; 12 tests passed.

### Phase 3 — Database Foundation + Project Memory (CURRENT)
- **Objective:** Build persistent structured database layer using SQLite and SQLAlchemy 2.0, implement idempotent seeding pipeline, structured query service, and project memory handoff.
- **Implemented:**
  - Configuration: `DATABASE_URL` in `backend/app/core/config.py` and `backend/.env.example`.
  - Database engine & session management in `backend/app/db/database.py` with automatic SQLite foreign key enforcement (`PRAGMA foreign_keys=ON;`).
  - SQLAlchemy 2.0 ORM models in `backend/app/db/models.py`:
    - `Standard` (`standards`)
    - `Product` (`products`)
    - `ProductAlias` (`product_aliases`)
    - `QCO` (`qcos`)
    - `CertificationScheme` (`certification_schemes`)
    - `Laboratory` (`laboratories`)
    - `GeneralKnowledge` (`general_knowledge`)
    - 6 Many-to-Many Association Tables: `product_standards`, `product_qcos`, `product_certification_schemes`, `qco_standards`, `scheme_standards`, `laboratory_standards`.
  - Idempotent seed pipeline in `backend/app/db/seed.py` executable via CLI (`python -m app.db.seed`).
  - Independent query service in `backend/app/services/query_service.py` (`BISQueryService`).
  - Automated test suite in `backend/tests/test_database.py` covering table creation, seeding, idempotency, foreign key enforcement, relationships, searches, and edge cases.
  - Root persistent memory document `Memory.md`.
- **Key Decisions:**
  - SQLite used for MVP: zero external server dependency, exceptional read speed, file-based simplicity.
  - Relational mapping rather than comma-separated strings: Enables bidirectional queries (`product -> standards` and `standard -> products`, `standard -> laboratories`).
  - Strict foreign key enforcement via SQLite PRAGMA hook.
  - Idempotent upsert behavior: Re-running seed updates records without duplicate associations or primary key errors.
- **Results:** 27 pytest tests passed (100% pass rate).

---

## 4. Current Database/Data State

### Dataset Summary
| Entity | Storage | Record Count | Schema Highlights |
| :--- | :--- | :---: | :--- |
| **Indian Standards** | `standards` table | **26** | `id`, `is_number` (unique index), `title`, `product_category`, `description`, `technical_department`, `status`, `source_url` |
| **Products** | `products` table | **23** | `id`, `product_name` (index), `category`, `source_url` |
| **Product Aliases** | `product_aliases` table | **70+** | `id`, `product_id` (FK), `alias` (index) |
| **Quality Control Orders** | `qcos` table | **16** | `id`, `qco_name`, `product`, `issuing_ministry`, `mandatory` (bool), `enforcement_date`, `amendments` (JSON), `source_url` |
| **Certification Schemes** | `certification_schemes` table | **20** | `id`, `scheme_name`, `product`, `certification_type`, `mandatory` (bool), `source_url` |
| **Testing Laboratories** | `laboratories` table | **20** | `id`, `laboratory_name`, `lab_code` (unique index), `location`, `state` (index), `testing_scope` (JSON), `validity`, `source_url` |
| **General Knowledge** | `general_knowledge` table | **12** | `id`, `topic` (index), `title`, `text`, `source_url`, `source_type` |
| **Sources Registry** | `rag/sources/sources.json` | **16** | Central index of gazettes, portals, and statutory ministries |

### Relational Graph
```
              ┌───────────────────────────┐
              │          Product          │
              └───────┬───────────┬───────┘
                      │           │
          ┌───────────┘           └───────────┐
          ▼                                   ▼
┌───────────────────┐               ┌───────────────────┐
│        QCO        │               │   Cert. Scheme    │
└─────────┬─────────┘               └─────────┬─────────┘
          │                                   │
          └───────────┐           ┌───────────┘
                      ▼           ▼
              ┌───────────────────────────┐
              │         Standard          │◄──────────┐
              └───────────────────────────┘           │
                                                      │
                                            ┌─────────┴─────────┐
                                            │    Laboratory     │
                                            └───────────────────┘
```

---

## 5. Important Technical Decisions

1. **Official BIS/Government Sources Only:** Every single record originates from official portals (`bis.gov.in`, `manakonline.in`, `crsbis.in`, `lims.bis.gov.in`, official Gazette of India). No synthetic or placeholder standard numbers exist.
2. **No Hallucinated Compliance Data:** Enforcement dates, ministries, and standard clause identifiers must be accurate to statutory notifications.
3. **Traceability First:** Every model stores `source_url` and optional `retrieved_at` timestamp for auditability in future RAG citation generation.
4. **Mandatory vs. Voluntary Distinction:** Distinct boolean flags and gazette order links prevent confusion between voluntary Indian Standards and mandatory QCOs.
5. **Relational Representation Over Flat Strings:** Relationships (`Product <-> Standard`, `Standard <-> Laboratory`, etc.) are modeled via proper association tables with foreign key cascades, allowing SQL joins and reverse index lookups.
6. **SQLite for MVP:** SQLite provides lightning-fast queries, zero-setup execution for evaluators/judges, and seamless portability without needing Docker or external DB services.
7. **Idempotent Seeding:** The seed command (`python -m app.db.seed`) can be run multiple times safely; it handles upserting and re-synchronizing association links without creating duplicate rows.
8. **Phase Boundary Discipline:** No LLM, embeddings, or vector indices were introduced in Phase 3. They belong strictly to Phase 4 & 5.

---

## 6. Current Phase

**Phase 3 — Database Foundation + Project Memory** is **COMPLETE**.

### Completed in this phase:
- SQLAlchemy 2.0 ORM models and association tables.
- SQLite database connection, PRAGMA foreign keys, and session generator.
- Repeatable, idempotent data seeding pipeline from `rag/data/*.json`.
- `BISQueryService` with full type-hinting and search capabilities.
- Comprehensive test suite (15 database tests added, total 27 passing).
- `Memory.md` project memory document.

### Explicitly Out of Scope (Deferred to later phases):
- Embeddings and vector database creation (Phase 4)
- RAG retrieval pipeline (Phase 4)
- LLM / Gemini orchestration (Phase 5)
- Product classification AI (Phase 5)
- User authentication & accounts (Phase 14)
- New frontend components (Phase 6)

---

## 7. Remaining Roadmap

```
Phase 1: Backend Foundation                ✅ COMPLETED
Phase 2: BIS Knowledge & Ingestion         ✅ COMPLETED
Phase 3: Database Foundation + Memory      ✅ COMPLETED (Current)
Phase 4: RAG + Vector Search               ⏳ NEXT
Phase 5: LLM + AI Orchestrator             ⏳ PENDING
Phase 6: BIS Intelligence + Frontend Wire  ⏳ PENDING
Phase 7: Testing + SIH Demo Polish         ⏳ PENDING
```

- **Phase 4 — RAG + Vector Search:** Generate chunk embeddings from `rag/data/` and parsed documents, initialize local vector store (e.g. ChromaDB), implement semantic retrieval and metadata filtering.
- **Phase 5 — LLM + AI Orchestrator:** Connect Gemini API / LLM orchestrator, implement intent classification (Standard Lookup, QCO Check, Lab Discovery, Hallmarking, Consumer Grievance), merge structured DB results with vector chunks into grounded prompts.
- **Phase 6 — BIS Intelligence + Frontend Integration:** Wire real backend responses into the React/Vite UI (`Frontend/`), implement interactive standard explorer, lab locator map, and evidence citation modal.
- **Phase 7 — Testing + SIH Demo:** End-to-end evaluation with test queries across all SIH domains, latency benchmarks, edge case handling, and demo rehearsal.

---

## 8. Database Documentation

### Database Technology
- **DBMS:** SQLite 3
- **ORM:** SQLAlchemy 2.0
- **Driver:** Python standard library `sqlite3`
- **Location:** `backend/data/bis.db` (git-ignored, generated during seed)
- **Configuration:** `DATABASE_URL=sqlite:///./data/bis.db`

### Tables & Schema
1. **`standards`**:
   - `id` (VARCHAR(64), PK)
   - `is_number` (VARCHAR(128), UNIQUE, INDEX)
   - `title` (VARCHAR(512))
   - `product_category` (VARCHAR(256))
   - `description` (TEXT)
   - `technical_department` (VARCHAR(256))
   - `status` (VARCHAR(64))
   - `source_url` (VARCHAR(1024))
   - `source_title` (VARCHAR(512), NULLABLE)
   - `retrieved_at` (VARCHAR(64), NULLABLE)
2. **`products`**:
   - `id` (VARCHAR(64), PK)
   - `product_name` (VARCHAR(256), INDEX)
   - `category` (VARCHAR(256))
   - `source_url` (VARCHAR(1024))
3. **`product_aliases`**:
   - `id` (INTEGER, PK, AUTOINCREMENT)
   - `product_id` (VARCHAR(64), FK -> products.id, INDEX)
   - `alias` (VARCHAR(256), INDEX)
4. **`qcos`**:
   - `id` (VARCHAR(64), PK)
   - `qco_name` (VARCHAR(512))
   - `product` (VARCHAR(512))
   - `issuing_ministry` (VARCHAR(256))
   - `mandatory` (BOOLEAN)
   - `enforcement_date` (VARCHAR(64))
   - `amendments` (JSON)
   - `source_url` (VARCHAR(1024))
   - `retrieved_at` (VARCHAR(64), NULLABLE)
5. **`certification_schemes`**:
   - `id` (VARCHAR(64), PK)
   - `scheme_name` (VARCHAR(256))
   - `product` (VARCHAR(512))
   - `certification_type` (VARCHAR(128))
   - `mandatory` (BOOLEAN)
   - `source_url` (VARCHAR(1024))
6. **`laboratories`**:
   - `id` (VARCHAR(64), PK)
   - `laboratory_name` (VARCHAR(256))
   - `lab_code` (VARCHAR(64), UNIQUE, INDEX)
   - `location` (VARCHAR(512))
   - `state` (VARCHAR(128), INDEX)
   - `testing_scope` (JSON)
   - `validity` (VARCHAR(256))
   - `source_url` (VARCHAR(1024))
7. **`general_knowledge`**:
   - `id` (VARCHAR(64), PK)
   - `topic` (VARCHAR(128), INDEX)
   - `title` (VARCHAR(512))
   - `text` (TEXT)
   - `source_url` (VARCHAR(1024))
   - `source_type` (VARCHAR(64))
   - `retrieved_at` (VARCHAR(64), NULLABLE)
8. **Association Tables**:
   - `product_standards` (`product_id`, `standard_id`)
   - `product_qcos` (`product_id`, `qco_id`)
   - `product_certification_schemes` (`product_id`, `scheme_id`)
   - `qco_standards` (`qco_id`, `standard_id`)
   - `scheme_standards` (`scheme_id`, `standard_id`)
   - `laboratory_standards` (`laboratory_id`, `standard_id`)

### Seeding Command
From `backend/`:
```powershell
.\.venv\Scripts\python.exe -m app.db.seed
```
Or from project root:
```powershell
.\backend\.venv\Scripts\python.exe -m backend.app.db.seed
```

### Query Service Methods (`app.services.query_service.BISQueryService`)
- `get_standard_by_id(db, standard_id)`
- `get_standard_by_is_number(db, is_number)`
- `search_standards(db, query, limit=10)`
- `get_all_standards(db, limit=100)`
- `get_product_by_id(db, product_id)`
- `search_products(db, query, limit=10)` (searches name, category, and aliases)
- `get_product_standards(db, product_id)`
- `get_product_qcos(db, product_id)`
- `get_product_certification_schemes(db, product_id)`
- `is_product_qco_mandatory(db, product_id)`
- `get_labs_for_standard(db, standard_id_or_is_no)`
- `get_products_for_standard(db, standard_id_or_is_no)`
- `get_qco(db, qco_id)`
- `get_certification_scheme(db, scheme_id)`
- `get_general_knowledge(db, query_or_topic=None, limit=10)`

---

## 9. Testing Status

### Test Summary
- **Total Automated Tests Executed:** 27 pytest tests + 7 standalone dataset validation checks.
- **Pass Rate:** 100% (27 passed, 0 failed, 0 errors).
- **Execution Time:** ~1.7 seconds.

### Test Breakdown
- **Phase 1 API Tests (8):**
  - Root endpoint discovery (`test_root_endpoint`)
  - Health check endpoint (`test_health_endpoint`)
  - Chat valid query payload (`test_chat_valid_message`)
  - Chat input validations: empty, whitespace, missing field, non-string, length > 2000 (`test_chat_*`)
- **Phase 2 Data & Ingestion Tests (4):**
  - Dataset relational integrity & schema check (`test_rag_datasets_relational_integrity`)
  - HTML parser text extraction (`test_html_parser`)
  - PDF parser clause marker extraction (`test_pdf_parser_fallback`)
  - Semantic chunker and parent metadata preservation (`test_chunker`)
- **Phase 3 Database & Query Tests (15):**
  - Clean table initialization (`test_database_initialization`)
  - Model creation & representation formatting (`test_model_creation_and_repr`)
  - Seed dataset record counts (`test_seeding_counts`)
  - Seed idempotency on repeated execution (`test_seed_idempotency`)
  - Standard retrieval by ID, IS number, and search (`test_standard_retrieval`)
  - Product retrieval and alias search (`test_product_retrieval_and_aliases`)
  - Product -> Standard many-to-many relationship (`test_product_to_standard_relationship`)
  - Product -> QCO relationship and mandatory check (`test_product_to_qco_relationship`)
  - Product -> Certification scheme mapping (`test_product_to_certification_scheme_relationship`)
  - Laboratory -> Standard testing capability lookup (`test_laboratory_to_standard_relationship`)
  - Standard -> Products reverse lookup (`test_products_for_standard_reverse_lookup`)
  - Direct QCO and Scheme lookups (`test_qco_and_scheme_direct_lookups`)
  - General knowledge query by topic/keyword (`test_general_knowledge_lookup`)
  - Safe handling of non-existent entities (`test_nonexistent_references_handled_safely`)
  - Foreign key constraint enforcement (`test_foreign_key_enforcement`)

---

## 10. Known Limitations

1. **Curated MVP Dataset Size:** The database currently contains 26 standards and 23 products covering high-priority SIH domains (appliances, electronics, lighting, cookware, steel, automotive, toys, solar, packaged water, cement, gold hallmarking). While sufficient for the hackathon demo, full national coverage requires scaling to thousands of standards.
2. **SQLite Write Concurrency:** SQLite is optimal for local development, fast read access, and demo evaluations. In high-concurrency production deployments with simultaneous multi-user writes, migration to PostgreSQL will be recommended.
3. **No Embeddings or Vector Index Yet:** Semantic similarity and vector search are intentionally deferred to Phase 4. Currently, text search in the database relies on indexed SQL `LIKE` queries.
4. **Chat Endpoint Is A Foundation Placeholder:** `/api/chat` currently returns a structured placeholder response confirming backend connectivity; real AI answers backed by RAG and database lookups will be connected in Phase 5.

---

## 11. How the Next AI Should Continue

### What to Read First
1. Read `Memory.md` (this file) completely.
2. Inspect `Phases.md` for Phase 4 deliverables.
3. Check `backend/app/db/models.py` and `backend/app/services/query_service.py` to understand how structured data is retrieved.
4. Inspect `rag/chunking/chunker.py` and `rag/data/*.json` to understand how documents are chunked and attributed.

### Current Project State
- Backend, Database, Ingestion, and Curated Data layers are complete and 100% verified.
- 27 automated tests are passing.
- Database can be seeded at any time using `python -m app.db.seed`.

### Current Phase: Phase 4 — RAG + Vector Search
The next AI agent must implement Phase 4:
- Choose/confirm a lightweight local vector store (e.g. ChromaDB).
- Select an appropriate embedding model (e.g., SentenceTransformers / `all-MiniLM-L6-v2` or Gemini embeddings via API).
- Create a vector indexing pipeline that reads `rag/data/*.json`, applies `rag/chunking/chunker.py`, computes embeddings, and stores vectors with rich metadata (`standard_id`, `is_number`, `source_url`, `doc_type`).
- Implement vector search queries with top-k retrieval and metadata filtering.
- Add automated tests for vector ingestion and retrieval.

### What Should NOT Be Changed Unnecessarily
- Do NOT rewrite or break existing SQLAlchemy models in `backend/app/db/models.py`.
- Do NOT alter `rag/data/*.json` schema or delete existing records.
- Do NOT break the existing `POST /api/chat` or `GET /api/health` endpoints.
- Do NOT start Phase 5 (LLM Orchestration) before completing Phase 4.
