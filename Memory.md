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
│   │   ├── bis.db                  # Local SQLite database (git-ignored)
│   │   └── chroma/                 # Persistent local ChromaDB vector store
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_health.py          # API health check tests
│   │   ├── test_chat.py            # API chat validation tests
│   │   ├── test_rag_data.py        # Dataset validation & parser unit tests
│   │   ├── test_database.py        # Database models, relations, seed, and query tests
│   │   ├── test_embeddings.py      # Local embeddings (all-MiniLM-L6-v2) tests
│   │   ├── test_vector_store.py    # ChromaDB upsert, query, and reset tests
│   │   └── test_retrieval.py       # Semantic & hybrid retrieval and benchmark evaluation tests
│   │
│   ├── .env.example                # Backend environment variable template
│   ├── pytest.ini                  # Pytest configuration with pythonpath = . ..
│   ├── requirements.txt            # Backend Python dependencies (includes chromadb)
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

### Phase 3 — Database Foundation + Project Memory
- **Objective:** Build persistent structured database layer using SQLite and SQLAlchemy 2.0, implement idempotent seeding pipeline, structured query service, and project memory handoff.
- **Implemented:**
  - Configuration: `DATABASE_URL` in `backend/app/core/config.py` and `backend/.env.example`.
  - Database engine & session management in `backend/app/db/database.py` with automatic SQLite foreign key enforcement (`PRAGMA foreign_keys=ON;`).
  - SQLAlchemy 2.0 ORM models in `backend/app/db/models.py`: `Standard`, `Product`, `ProductAlias`, `QCO`, `CertificationScheme`, `Laboratory`, `GeneralKnowledge`, and 6 many-to-many association tables.
  - Idempotent seed pipeline in `backend/app/db/seed.py` executable via CLI (`python -m backend.app.db.seed`).
  - Independent query service in `backend/app/services/query_service.py` (`BISQueryService`).
  - Automated test suite in `backend/tests/test_database.py` covering table creation, seeding, idempotency, foreign key enforcement, relationships, searches, and edge cases.
- **Key Decisions:**
  - SQLite used for local MVP simplicity and rapid queries.
  - Relational mapping rather than comma-separated strings for bidirectional queries.
- **Results:** 27 pytest tests passed (100% pass rate).

### Phase 4 — RAG + Vector Search (COMPLETED)
- **Objective:** Convert curated BIS knowledge into searchable chunks, embed locally using sentence-transformers, store embeddings and metadata in local ChromaDB, implement idempotent indexing CLI, and build unified hybrid retrieval combining vector similarity with SQLite relational lookups.
- **Implemented:**
  - **Local Embedding Pipeline (`rag/embeddings/embedder.py`):** `BISEmbedder` wrapping `all-MiniLM-L6-v2` via ONNX Runtime / ChromaDB embedding function. Generates 384-dimensional dense vectors locally on CPU with zero external API calls or cost.
  - **ChromaDB Vector Store (`rag/vector_store/chroma_store.py`):** `ChromaStore` managing persistent collection `bis_knowledge` in `backend/data/chroma/`. Implements cosine similarity space, deterministic chunk IDs (`{doc_id}-chk-{index}`), metadata sanitization, and batch upserts.
  - **Indexing Pipeline CLI (`rag/index.py`):** Transforms all 6 curated datasets into 121 structured TextChunks using `rag/chunking/chunker.py`. Executable via `python -m rag.index` and `python -m rag.index --reset`. Re-indexing is 100% idempotent with zero duplicates.
  - **Semantic Retriever (`rag/retrieval/retriever.py`):** `SemanticRetriever` executing vector similarity searches, top-k retrieval, and metadata filtering by `document_type`.
  - **Hybrid Retriever (`rag/retrieval/hybrid.py`):** `BISHybridRetriever` merging semantic vector hits with SQLite relational queries (`BISQueryService`), extracting IS numbers and product entities, attaching applicable QCOs, schemes, and laboratories, and deduplicating source citations.
  - **Evaluation Benchmark Suite (`tests/rag/evaluation_queries.json`):** 15 benchmark queries across standard lookups, QCO mandates, schemes, labs, and general knowledge.
  - **Automated Tests:** `test_embeddings.py` (5 tests), `test_vector_store.py` (6 tests), `test_retrieval.py` (7 tests).
- **Key Decisions:**
  - Local CPU embeddings (`all-MiniLM-L6-v2`) via ONNX Runtime to ensure deterministic reproducibility, zero latency dependencies, and no API keys.
  - Embedded ChromaDB in `backend/data/chroma/` requiring no external server process or Docker daemon.
  - Provenance on every chunk (`document_id`, `source_url`, `source_title`, `source_type`, `document_type`, `is_number`, `product_id`, `qco_id`).
- **Results:** All 45 automated tests passed (100% pass rate in ~8.9 seconds). 121 total chunks indexed.

### Phase 5 — LLM Integration + AI Orchestration
- **Objective:** Integrate Google Gemini (`google-genai` SDK, `gemini-2.5-flash`), implement deterministic intent classification and entity extraction, build an AI Orchestrator combining structured DB lookups, vector chunks, and conservative LLM synthesis, and implement strict anti-hallucination validation with offline fallback.
- **Implemented:**
  - **Modern GenAI SDK Integration (`backend/app/services/llm_service.py`):** `GeminiLLMService` using official `google-genai==2.22.0` with conservative parameters (`temperature=0.1`, `max_output_tokens=1024`, `timeout=30.0`). Implemented graceful offline fallback when `GEMINI_API_KEY` is not set or when network/quota errors occur, returning a structured factual synthesis directly from retrieved evidence.
  - **Deterministic Intent Classification (`backend/app/services/intent_service.py`):** Rule-based regex and alias matcher categorizing queries into 9 distinct intents: `PRODUCT_STANDARD_QUERY`, `QCO_COMPLIANCE_QUERY`, `CERTIFICATION_QUERY`, `LABORATORY_QUERY`, `HALLMARKING_QUERY`, `CONSUMER_SERVICE_QUERY`, `STANDARD_LOOKUP`, `GENERAL_BIS_QUERY`, and `UNKNOWN_QUERY`. Extracts `product_name`, `is_number`, `state`, `huid`, and handles underspecified queries with structured clarification prompts.
  - **Evidence Packaging & Central Orchestrator (`backend/app/services/orchestrator.py`):** Central `BISOrchestrator` coordinating intent analysis, structured DB queries (`BISQueryService`), hybrid retrieval (`BISHybridRetriever`), context prompt assembly (`EvidencePackage`), LLM synthesis, anti-hallucination validation, and confidence scoring.
  - **Anti-Hallucination Validation (`backend/app/services/response_validator.py`):** Verification filters checking cited standard numbers against database standards, flagging unverified IS numbers, checking mandatory QCO claims against verified QCO evidence, and appending statutory warnings or fallbacks if claims are unsupported.
  - **Chat Routing Integration (`backend/app/api/chat.py` & `backend/app/services/chat_service.py`):** Updated `POST /api/chat` to route all queries through `BISOrchestrator` while maintaining Pydantic schema validation and backward compatibility.
  - **Automated Tests:** 24 new tests across `test_intent.py` (10 tests), `test_llm.py` (4 tests), `test_orchestrator.py` (5 tests), `test_response_validation.py` (4 tests), plus updated `test_chat.py` (7 tests). 100% mocked offline execution requiring no real API key.
- **Key Decisions:**
  - Use `google-genai>=2.20.0,<3.0.0` (installed 2.22.0) rather than deprecated `google-generativeai`.
  - Intent classification is strictly deterministic (zero latency, zero hallucination) with alias matching against all 70+ product aliases.
  - Set hybrid vector score threshold (`score >= 0.45`) and regex word boundaries (`\b`) to prevent false-positive chunk expansion on irrelevant/extraterrestrial queries.
  - Complete zero-API-key testability via mocking fixtures.
- **Results:** 69 total automated tests passing (100% pass rate in ~10.7 seconds).

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
- **Total Automated Tests Executed:** 69 pytest tests + 7 standalone dataset validation checks + 15 benchmark evaluation queries.
- **Pass Rate:** 100% (69 passed, 0 failed, 0 errors).
- **Execution Time:** ~10.7 seconds.

### Test Breakdown
- **Phase 1 API Tests (6):**
  - Root endpoint discovery (`test_root_endpoint`)
  - Health check endpoint (`test_health_endpoint`)
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
- **Phase 4 Embeddings Tests (5):**
  - `test_embedder_initialization`: 384 dimensions, local ONNX model
  - `test_embed_single_text`: Dense float vector generation
  - `test_embed_batch_documents`: Batch embedding shape consistency
  - `test_embed_empty_and_whitespace_text`: Safe zero-vector fallbacks
  - `test_semantic_similarity_distance`: Cosine similarity ordering
- **Phase 4 Vector Store Tests (6):**
  - `test_sanitize_metadata`: Metadata type sanitization for Chroma
  - `test_vector_store_initialization`: Clean collection initialization
  - `test_add_chunks_and_count`: TextChunk upsertion and count tracking
  - `test_idempotent_upsert`: Zero duplication on repeated upserts
  - `test_query_semantic_search`: Semantic search relevance ranking
  - `test_get_by_id_and_reset`: ID lookup and collection reset
- **Phase 4 Retrieval & Benchmark Tests (7):**
  - `test_semantic_retriever_basic_query`: Top-k vector retrieval with citations
  - `test_semantic_retriever_empty_query`: Graceful handling of empty input
  - `test_semantic_retriever_document_type_filter`: Document type filtering
  - `test_hybrid_retriever_empty_query`: Empty hybrid search handling
  - `test_hybrid_retriever_standard_lookup`: IS number extraction, standard, and lab lookup
  - `test_hybrid_retriever_product_and_qco_lookup`: Product, QCO, and scheme attachment
  - `test_benchmark_evaluation_suite`: 15 evaluation queries verified with 100% precision
- **Phase 5 Intent Classification Tests (10):**
  - `test_intent_standard_lookup`: IS number pattern matching
  - `test_intent_product_standard_query`: Product name and alias classification
  - `test_intent_qco_compliance`: Mandatory QCO queries
  - `test_intent_certification_scheme`: ISI / CRS / Scheme detection
  - `test_intent_laboratory_query`: Lab and testing scope extraction
  - `test_intent_hallmarking_query`: Gold, silver, and HUID queries
  - `test_intent_consumer_service`: Grievance, BIS CARE, fake ISI marks
  - `test_intent_general_bis`: Overview, history, organizational queries
  - `test_intent_unknown_query`: Out-of-scope / irrelevant questions
  - `test_underspecified_query_requires_clarification`: Single-word / vague questions triggering clarification
- **Phase 5 LLM Service Tests (4):**
  - `test_llm_offline_fallback`: Offline fallback generation when API key is missing
  - `test_llm_mock_successful_generation`: Gemini JSON schema generation and structured parsing
  - `test_llm_api_failure_raises_llm_error`: Exception handling on API error
  - `test_llm_empty_response_raises_llm_error`: Handling empty candidate responses
- **Phase 5 Response Validation Tests (4):**
  - `test_validation_valid_response`: Accurate pass-through of verified standards and QCOs
  - `test_validation_detects_unsupported_is_number`: Hallucination detection for unverified IS numbers
  - `test_validation_flags_unsupported_mandatory_claim`: Stripping unsupported mandatory compliance claims
  - `test_validation_empty_answer_replaced_with_fallback`: Safe fallback on empty LLM text
- **Phase 5 Orchestrator & Chat Flow Tests (8):**
  - `test_orchestrator_clarification_flow`: Underspecified query branching
  - `test_orchestrator_insufficient_evidence_flow`: Low evidence / unknown intent handling
  - `test_orchestrator_successful_product_query`: End-to-end product query synthesis with citations
  - `test_orchestrator_standard_lookup_flow`: Direct IS number query synthesis with labs and standards
  - `test_orchestrator_handles_llm_exception_gracefully`: Fallback synthesis on LLM error
  - `test_chat_valid_message`: Integration test via HTTP Client
  - `test_chat_underspecified_message_triggers_clarification`: HTTP test for interactive clarification

---

### Phase 6 — Frontend Integration + Conversational UI
- **Objective:** Connect the React 19 + TypeScript + Vite frontend application to the FastAPI backend (`POST /api/chat`), strictly eliminating mock AI data and implementing an authoritative, user-friendly conversational interface.
- **Implemented:**
  - **Zero-Mock API Client (`Frontend/src/services/aiService.ts`):** Direct communication with backend `POST /api/chat` using configurable `VITE_API_URL`, 35s timeout abort controller, and structured error propagation.
  - **Authoritative Conversational UI (`Frontend/src/pages/Assistant.tsx`):**
    - Duplicate submission lock while requests are in-flight.
    - Loading / typing indicator with animated bouncing dots.
    - Real SIH BIS starter prompts ("Domestic Pressure Cooker", "Packaged Drinking Water", "Gold Jewellery Hallmarking", "Cement Testing Laboratories", "Toys Safety QCO").
    - Network / backend error banners with "Try Again" action.
    - Session reset / clear conversation feature.
    - Real-time backend connectivity badge (`Operational` vs `Backend Offline`).
  - **Rich Response Presentation Components:**
    - `ChatMessage.tsx`: Central component orchestrating all structured metadata rendering.
    - `ConfidenceBadge.tsx`: Qualitative confidence rating (`Confidence: High / Medium / Low`) with accessible color coding.
    - `EntityBadges.tsx`: Interactive chips for identified Products, Standards (IS codes), QCO orders, States, and HUIDs.
    - `SourceList.tsx`: Verified citations with external links (`[View Source ↗]`) with secure `rel="noopener noreferrer"`.
    - `ClarificationCard.tsx`: Dedicated alert card rendering clarifying questions with suggested prompt options for ambiguous queries.
    - `WarningBanner.tsx`: Warning notices highlighting regulatory caveats or unverified claims.
  - **Automated Frontend Test Suite (`Frontend/src/__tests__/Assistant.test.tsx`):**
    - 11 comprehensive Vitest + React Testing Library tests verifying all Phase 6 scenarios:
      1. Initial empty state with suggestion starters.
      2. Handling underspecified query triggering clarification card.
      3. Dispatches correct API request with trimmed prompt.
      4. Renders successful response with markdown answer and confidence badge.
      5. Renders extracted entity badges.
      6. Renders evidence summary points.
      7. Renders verified source citations with valid external links.
      8. Renders regulatory warning banners.
      9. Handles network/backend errors with error message and retry button.
      10. Prevents submission of empty or whitespace-only messages.
      11. Resets conversation history when Clear is clicked.
  - **Production Build:** Excluded test files from production `tsconfig.app.json`, verified zero-warning `tsc -b && vite build` bundle creation.
- **Results:** 11/11 Vitest tests passed (100%), full production bundle built in 1.08s, live end-to-end communication with FastAPI verified.

---

### Phase 7 — Testing, SIH Demo & Final Polish
- **Objective:** Perform end-to-end hardening, anti-hallucination verification, fallback validation, evaluation benchmarking, and demo preparation for the Smart India Hackathon.
- **Implemented:**
  - **Structured SIH Benchmark Dataset (`backend/tests/evaluation_queries.json`):** 20 comprehensive test cases covering Product -> Standard, Mandatory QCOs, Certification Schemes, Laboratories, Standard Lookups, Vague Queries, Insufficient Product Info, Out-of-scope Low Evidence, General BIS, and Edge Cases.
  - **Automated SIH Evaluation Suite (`backend/tests/test_sih_evaluation.py`):** 21 automated pytest tests verifying intent classification, standard grounding, anti-hallucination guarantees, source domain legitimacy, and live `/api/chat` contract adherence.
  - **Clarification Hardening (`intent_service.py`):** Single-word / vague product queries (e.g. `"cooker"`, `"toys"`) now trigger clarifying questions instead of speculative guessing.
  - **Anti-Hallucination Gate (`orchestrator.py`):** Step 5 insufficient evidence check verifies direct entity presence and semantic cosine similarity (>= 0.58), reliably flagging out-of-scope queries (e.g. quantum spaceships) as `INSUFFICIENT_EVIDENCE` with 0.0 confidence and 0 invented standards.
  - **Frontend Demo Polish (`Assistant.tsx`, `SuggestedQueries.tsx`):** Aligned starter suggestion cards and sidebar shortcuts with the 6 core SIH demo scenarios.
  - **SIH Demo Playbook (`docs/SIH_DEMO_CHECKLIST.md`):** Complete startup commands, health checks, 6-step demo sequence showcasing trust and evidence, talking points, and quick recovery steps.
  - **Phase 7 Completion Report (`docs/PHASE_7_COMPLETION_REPORT.md`):** Detailed report containing all 19 mandated sections.
- **Results:** 102 / 102 automated tests passing (90 backend pytest + 12 frontend Vitest). 100% pass rate.

---

## 9. Testing Status

### Test Summary
- **Total Automated Tests Executed:** 102 tests (90 backend pytest tests + 12 frontend Vitest tests) + 7 standalone dataset validation checks + 20 benchmark evaluation queries.
- **Pass Rate:** 100% (102 passed, 0 failed, 0 errors).
- **Backend Execution Time:** ~11.8 seconds.
- **Frontend Execution Time:** ~1.9 seconds.

### Test Breakdown
- **Phase 1 API Tests (6):** `test_root_endpoint`, `test_health_endpoint`, `test_chat_*`.
- **Phase 2 Data & Ingestion Tests (4):** `test_rag_datasets_relational_integrity`, `test_html_parser`, `test_pdf_parser_fallback`, `test_chunker`.
- **Phase 3 Database & Query Tests (15):** `test_database_initialization`, `test_model_creation_and_repr`, `test_seeding_counts`, `test_seed_idempotency`, `test_standard_retrieval`, `test_product_retrieval_and_aliases`, `test_product_to_standard_relationship`, `test_product_to_qco_relationship`, `test_product_to_certification_scheme_relationship`, `test_laboratory_to_standard_relationship`, `test_products_for_standard_reverse_lookup`, `test_qco_and_scheme_direct_lookups`, `test_general_knowledge_lookup`, `test_nonexistent_references_handled_safely`, `test_foreign_key_enforcement`.
- **Phase 4 Embeddings Tests (5):** `test_embedder_initialization`, `test_embed_single_text`, `test_embed_batch_documents`, `test_embed_empty_and_whitespace_text`, `test_semantic_similarity_distance`.
- **Phase 4 Vector Store Tests (6):** `test_sanitize_metadata`, `test_vector_store_initialization`, `test_add_chunks_and_count`, `test_idempotent_upsert`, `test_query_semantic_search`, `test_get_by_id_and_reset`.
- **Phase 4 Retrieval & Benchmark Tests (7):** `test_semantic_retriever_basic_query`, `test_semantic_retriever_empty_query`, `test_semantic_retriever_document_type_filter`, `test_hybrid_retriever_empty_query`, `test_hybrid_retriever_standard_lookup`, `test_hybrid_retriever_product_and_qco_lookup`, `test_benchmark_evaluation_suite`.
- **Phase 5 Intent Classification Tests (10):** `test_intent_standard_lookup`, `test_intent_product_standard_query`, `test_intent_qco_compliance`, `test_intent_certification_scheme`, `test_intent_laboratory_query`, `test_intent_hallmarking_query`, `test_intent_consumer_service`, `test_intent_general_bis`, `test_intent_unknown_query`, `test_underspecified_query_requires_clarification`.
- **Phase 5 LLM Service Tests (4):** `test_llm_offline_fallback`, `test_llm_mock_successful_generation`, `test_llm_api_failure_raises_llm_error`, `test_llm_empty_response_raises_llm_error`.
- **Phase 5 Response Validation Tests (4):** `test_validation_valid_response`, `test_validation_detects_unsupported_is_number`, `test_validation_flags_unsupported_mandatory_claim`, `test_validation_empty_answer_replaced_with_fallback`.
- **Phase 5 Orchestrator & Chat Flow Tests (8):** `test_orchestrator_clarification_flow`, `test_orchestrator_insufficient_evidence_flow`, `test_orchestrator_successful_product_query`, `test_orchestrator_standard_lookup_flow`, `test_orchestrator_handles_llm_exception_gracefully`, `test_chat_valid_message`, `test_chat_underspecified_message_triggers_clarification`.
- **Phase 6 & 7 Frontend Conversational UI Tests (12):**
  - Initial state with starter suggestions
  - Clarification card rendering for ambiguous queries
  - API request dispatch with trimmed prompt
  - Markdown answer text & confidence badge rendering
  - Extracted entity chips display
  - Key evidence points summary
  - Clickable external source citations (`[View Source ↗]`)
  - Regulatory warning and caveat banners
  - Network/backend error recovery with retry
  - Prevention of empty/whitespace submissions
  - Conversational history clearing and state reset
  - SIH demo query starter click dispatch
- **Phase 7 SIH Evaluation Benchmark Tests (21):**
  - 20 structured benchmark cases in `tests/test_sih_evaluation.py`
  - 1 live `/api/chat` contract adherence test

---

## 10. Known Limitations

1. **Curated MVP Dataset Size:** The database currently contains 26 standards and 23 products covering high-priority SIH domains (appliances, electronics, lighting, cookware, steel, automotive, toys, solar, packaged water, cement, gold hallmarking). While sufficient for the hackathon demo, full national coverage requires scaling to thousands of standards.
2. **SQLite Write Concurrency:** SQLite is optimal for local development, fast read access, and demo evaluations. In high-concurrency production deployments with simultaneous multi-user writes, migration to PostgreSQL will be recommended.
3. **Gemini API Key Required For Real-Time LLM Synthesis:** Without `GEMINI_API_KEY`, the orchestrator defaults to high-precision offline factual synthesis. When an API key is provided, full Gemini generation is active.

---

## 11. Final MVP State & Handoff

### Project Completion Status
- **ALL PHASES (1 THROUGH 7) ARE COMPLETE AND 100% VERIFIED.**
- **102 automated tests pass** (90 backend pytest + 12 frontend Vitest) with zero failures.
- **Frontend production build passes** cleanly with zero TypeScript errors (`npm run build`).
- **Security Audit:** 0 API keys or secrets committed; `.env` is strictly git-ignored.
- **SIH Demo Checklist:** Ready in `docs/SIH_DEMO_CHECKLIST.md`.
- **Phase 7 Completion Report:** Available in `docs/PHASE_7_COMPLETION_REPORT.md`.

### Recommended Post-MVP Scope (Phase 8+)
- Multilingual regional language translation (Hindi, Tamil, Telugu, etc.).
- Web Speech API voice input / output for consumer accessibility.
- Stamped compliance dossier / PDF export with official BIS logos.
- Daily automated Gazette web-scraping pipeline.
