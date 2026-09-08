# BIS Intelligent Assistant — System Architecture

## 1. Overview

The **BIS Intelligent Assistant** is an AI-powered conversational system for helping consumers, MSMEs, manufacturers, industries, and researchers navigate Indian Standards and BIS-related services.

The system combines:

- Natural-language understanding
- Deterministic intent detection
- Structured BIS data
- Hybrid RAG retrieval
- Semantic vector search
- Relational database lookups
- Google Gemini-based response generation
- Evidence validation
- Anti-hallucination checks
- Multi-turn conversational context
- Source-backed responses

The core design principle is:

> **The LLM generates the response, but verified BIS evidence determines what the response is allowed to claim.**

---

# 2. High-Level Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                         USER                                │
│              Natural Language BIS Query                     │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Vite)                     │
│                                                              │
│  Chat UI │ Conversation │ Sources │ Confidence │ Clarification│
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                           │
│                                                              │
│  API Layer → Chat Service → AI Orchestrator                  │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                     AI ORCHESTRATOR                          │
│                                                              │
│  Intent Detection                                            │
│       ↓                                                      │
│  Entity / Context Extraction                                  │
│       ↓                                                      │
│  Retrieval Planning                                           │
│       ↓                                                      │
│  Hybrid Retrieval                                             │
│       ↓                                                      │
│  Evidence Assembly                                            │
│       ↓                                                      │
│  Gemini Response Generation                                   │
│       ↓                                                      │
│  Response Validation / Anti-Hallucination                    │
└────────────────────────────┬─────────────────────────────────┘
                             │
              ┌──────────────┴───────────────┐
              ▼                              ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│     STRUCTURED DATA      │    │        RAG KNOWLEDGE         │
│                          │    │                              │
│ SQLite + SQLAlchemy      │    │ JSON Knowledge Base          │
│                          │    │      ↓                       │
│ Standards                │    │ Chunking                     │
│ Products                 │    │      ↓                       │
│ QCOs                     │    │ Embeddings                   │
│ Certification Schemes   │    │      ↓                       │
│ Laboratories             │    │ ChromaDB                     │
│ General Knowledge        │    │      ↓                       │
└──────────────────────────┘    │ Hybrid Retrieval             │
                                └──────────────────────────────┘
```

The repository separates structured relational knowledge from semantic retrieval. The RAG layer combines vector search with SQLite-based relational expansion.

---

# 3. Architectural Layers

## 3.1 Presentation Layer

### Technology

- React
- Vite
- TypeScript

### Responsibilities

The frontend provides the user-facing interface for:

- Conversational BIS queries
- Displaying AI responses
- Showing retrieved sources
- Displaying confidence information
- Clarification prompts
- Multi-turn conversations
- BIS-related workflows

The frontend communicates with the backend through REST APIs.

```text
User
  │
  ▼
React UI
  │
  ▼
HTTP API
  │
  ▼
FastAPI
```

The repository contains the frontend separately under `Frontend/`.

---

# 4. API Layer

## Technology

- Python
- FastAPI
- Uvicorn
- Pydantic

The backend exposes the application API and handles:

- Request validation
- CORS
- Error handling
- Chat requests
- Health checks
- Service orchestration

### Main endpoints

```text
GET  /api/health
POST /api/chat
```

The `/api/chat` endpoint accepts a natural-language query and optionally a session identifier for conversational context.

---

# 5. Application Service Layer

The backend service layer separates API concerns from business logic.

```text
backend/app/services/

├── chat_service.py
├── query_service.py
├── intent_service.py
├── llm_service.py
├── orchestrator.py
└── response_validator.py
```

### Chat Service

Acts as the bridge between the API layer and AI orchestration pipeline.

### Query Service

Provides structured database operations such as:

- Standard lookup
- Product lookup
- QCO lookup
- Certification lookup
- Laboratory lookup
- Relationship traversal

### Intent Service

Determines what the user is trying to accomplish.

Examples:

```text
PRODUCT_STANDARD_QUERY
QCO_COMPLIANCE_QUERY
CERTIFICATION_QUERY
LABORATORY_QUERY
GENERAL_BIS_QUERY
```

It also extracts entities and resolves references from previous conversational turns.

### LLM Service

Provides the Google Gemini integration.

The LLM is responsible primarily for:

- Understanding retrieved evidence
- Synthesizing natural-language answers
- Explaining BIS information
- Handling conversational phrasing

The LLM should not be treated as the authoritative database.

### Orchestrator

The orchestrator is the central decision-making layer.

```text
Query
  ↓
Intent
  ↓
Entities / Context
  ↓
Retrieval
  ↓
Evidence Package
  ↓
LLM
  ↓
Validation
  ↓
Final Response
```

### Response Validator

Validates generated responses against retrieved evidence.

Its purpose is to prevent unsupported claims such as:

- Invented IS numbers
- Unsupported mandatory claims
- Unsupported certification requirements
- Unsupported BIS relationships

---

# 6. Structured Database Layer

## Technology

- SQLite
- SQLAlchemy 2.0

The structured database stores BIS entities and their relationships.

### Core entities

```text
Indian Standards
Products
Quality Control Orders
Certification Schemes
Testing Laboratories
General Knowledge
Sources
```

### Relationship model

The database supports relationships such as:

```text
Product
   │
   ├── Indian Standard
   │
   ├── QCO
   │
   └── Certification Scheme

Indian Standard
   │
   └── Testing Laboratory
```

This allows deterministic lookups that complement semantic retrieval.

For example:

```text
"Where can I test this product?"
              ↓
Product
              ↓
Applicable IS
              ↓
Recognized Laboratory
```

The backend uses SQLAlchemy models and an idempotent seed process to populate the database from the curated RAG datasets.

---

# 7. Knowledge Base

The curated BIS knowledge base is stored primarily under:

```text
rag/data/
```

The major datasets are:

```text
standards.json
products.json
qcos.json
certification_schemes.json
laboratories.json
general_knowledge.json
```

The data is relationally validated before being indexed.

The validation layer checks:

- Duplicate IDs
- Missing references
- Invalid IS references
- Product/standard relationships
- QCO relationships
- Certification relationships
- Laboratory relationships

This prevents inconsistent knowledge from entering the retrieval pipeline.

---

# 8. RAG Pipeline

The RAG subsystem is located under:

```text
rag/
```

Its main components are:

```text
rag/
├── ingestion/
├── chunking/
├── embeddings/
├── vector_store/
├── retrieval/
├── data/
├── raw/
├── processed/
├── sources/
├── index.py
└── validate_data.py
```

The repository's RAG design explicitly separates ingestion, chunking, embeddings, vector storage, and retrieval.

---

# 9. Data Ingestion

The ingestion layer handles source material processing.

```text
Official BIS/Government Sources
            ↓
        Fetcher
            ↓
     HTML / PDF Parser
            ↓
     Processed Documents
```

Components include:

- HTTP fetching
- Local caching
- PDF parsing
- HTML cleaning
- Source metadata preservation

The source registry maintains traceability to authoritative sources.

---

# 10. Semantic Chunking

Documents are divided into retrieval-friendly chunks.

```text
Document
   ↓
Semantic Chunker
   ↓
Chunk + Metadata
   ↓
Deterministic Chunk ID
```

Chunk metadata preserves the relationship between the chunk and its original document/source.

This is important because retrieval results must remain traceable to their original BIS source.

---

# 11. Embedding Layer

The project uses local embedding generation through FastEmbed/ONNX-based models.

Current architecture supports models such as:

```text
BAAI/bge-small-en-v1.5
all-MiniLM-L6-v2
```

The embedding model converts textual BIS knowledge into numerical vectors.

```text
Text
 ↓
Embedding Model
 ↓
Vector
```

Local embeddings reduce dependence on external embedding APIs and allow the retrieval system to operate locally.

The backend documentation identifies FastEmbed and ONNX Runtime as the embedding stack.

---

# 12. Vector Database

## Technology

**ChromaDB**

The vector store contains the embedded knowledge chunks.

```text
Knowledge Chunk
      ↓
Embedding
      ↓
ChromaDB
      ↓
Vector Similarity Search
```

The vector database supports:

- Persistent local storage
- Similarity search
- Metadata filtering
- Idempotent indexing
- Deterministic chunk identifiers

---

# 13. Hybrid Retrieval

Hybrid retrieval is one of the core architectural components.

Instead of relying exclusively on vector similarity, the system combines:

```text
                User Query
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
   Semantic Search      Structured Lookup
      ChromaDB             SQLite
          │                   │
          └─────────┬─────────┘
                    ▼
             Result Fusion
                    │
                    ▼
          Confidence Calculation
                    │
                    ▼
             Evidence Package
```

### Semantic Retrieval

Finds conceptually similar BIS information.

Useful for queries such as:

> "What standard applies to domestic cooking gas equipment?"

### Structured Retrieval

Uses deterministic database relationships.

Useful for:

> "Which laboratories test IS 4246?"

### Hybrid Retrieval

Combines both approaches to improve recall and precision.

The current implementation explicitly merges semantic chunks with SQLite relational expansion and produces structured entities, confidence information, and citations.

---

# 14. Retrieval Expansion

Once a relevant entity is identified, the system can expand through its relationships.

Example:

```text
User:
"What standard applies to LPG gas stoves?"

        ↓

Product Match
Domestic LPG Gas Stove

        ↓

Standard Lookup
IS 4246

        ↓

QCO Lookup
Applicable QCO

        ↓

Certification Lookup
Applicable Scheme

        ↓

Laboratory Lookup
Recognized Testing Facilities
```

This allows the assistant to answer connected questions instead of treating every query as an isolated document search.

---

# 15. Intent Detection

The system uses deterministic intent classification before response generation.

```text
User Query
    ↓
Intent Service
    ↓
Intent + Entities
```

Example:

```text
"Is BIS certification mandatory for LPG stoves?"

Intent:
QCO_COMPLIANCE_QUERY

Entities:
Product = LPG Stove
```

This prevents the LLM from having to independently determine the entire application workflow.

---

# 16. Conversational Context

The assistant supports multi-turn queries.

Example:

```text
Turn 1:
Which standard applies to domestic LPG stoves?

        ↓

IS 4246

Turn 2:
Is it mandatory?

        ↓

Resolve "it"
        ↓
Previous Product + IS context
        ↓
QCO lookup

Turn 3:
Where can I test it?

        ↓
Previous Product + IS context
        ↓
Laboratory lookup
```

The context-resolution layer allows follow-up questions to inherit relevant entities from previous turns.

---

# 17. LLM Generation

## Model

Google Gemini through the official Google GenAI SDK.

The LLM receives an evidence package rather than an unrestricted question alone.

Conceptually:

```text
User Query
+
Intent
+
Conversation Context
+
Retrieved Evidence
+
Structured Entities
+
Validation Rules
        ↓
      Gemini
        ↓
Natural Language Response
```

The generation layer is therefore responsible for **synthesis and explanation**, while retrieval and validation establish factual boundaries.

---

# 18. Evidence Package

The retrieval system produces an evidence package containing information such as:

```text
Evidence
├── Standards
├── Products
├── QCOs
├── Certification Schemes
├── Laboratories
├── Semantic Chunks
├── Source Metadata
└── Confidence
```

The evidence package is passed to the response generation and validation layers.

---

# 19. Anti-Hallucination Architecture

The system uses multiple defensive layers.

```text
                User Query
                    ↓
             Intent Detection
                    ↓
             Evidence Retrieval
                    ↓
          Evidence Sufficiency Check
                    ↓
              Gemini Response
                    ↓
          Response Validation
                    ↓
        ┌───────────┴───────────┐
        ▼                       ▼
    Supported                Unsupported
        │                       │
        ▼                       ▼
  Return Answer          Refuse to Guess /
                          Request Clarification
```

The validation layer should reject or flag claims that cannot be supported by retrieved evidence.

Examples:

### Unsupported IS number

```text
User:
"What does IS 99999 require?"

System:
No verified evidence found.
```

### Unsupported mandatory claim

```text
User:
"Is this product legally mandatory?"

System:
Only claim mandatory status when a verified QCO/regulatory
record supports the conclusion.
```

This is critical because BIS compliance information can have regulatory consequences.

---

# 20. Confidence Model

Retrieval results include a confidence score.

Conceptually:

```text
Confidence =
    Semantic Relevance
  + Structured Match
  + Entity Match
  + Source Quality
  + Evidence Coverage
```

The confidence score should influence response behavior.

```text
High confidence
      ↓
Direct evidence-backed answer

Medium confidence
      ↓
Answer with qualification / clarification

Low confidence
      ↓
Insufficient evidence response
```

Confidence should never be treated as a guarantee of correctness; it is a retrieval-quality signal.

---

# 21. Source Traceability

Every important factual answer should be traceable to supporting sources.

```text
Answer
  │
  ├── Indian Standard
  │     └── BIS Source
  │
  ├── QCO
  │     └── Government Gazette / Ministry Source
  │
  └── Laboratory
        └── BIS / Recognized Laboratory Source
```

This allows users to verify important information independently.

---

# 22. End-to-End Query Flow

A complete query follows this path:

```text
1. User enters question
          ↓
2. Frontend sends POST /api/chat
          ↓
3. FastAPI validates request
          ↓
4. ChatService receives request
          ↓
5. IntentService determines intent
          ↓
6. Entity/context extraction
          ↓
7. Hybrid Retriever searches:
       ├── ChromaDB
       └── SQLite
          ↓
8. Related BIS entities are expanded
          ↓
9. Evidence package is constructed
          ↓
10. Evidence sufficiency is checked
          ↓
11. Gemini synthesizes response
          ↓
12. ResponseValidator checks claims
          ↓
13. Sources + confidence + entities attached
          ↓
14. Response returned to frontend
          ↓
15. User sees answer + supporting evidence
```

---

# 23. Example Query

### User

> Which BIS standard applies to domestic LPG gas stoves? Is certification mandatory?

### Processing

```text
Intent Detection
        ↓
QCO_COMPLIANCE_QUERY

Entity Extraction
        ↓
Domestic LPG Gas Stove

Hybrid Retrieval
        ↓
Product
        ↓
IS 4246
        ↓
QCO
        ↓
Certification Scheme
        ↓
Sources

Evidence Validation
        ↓
Evidence sufficient

Gemini
        ↓
Natural-language explanation

Response Validator
        ↓
Claims verified

Frontend
        ↓
Answer + Sources + Confidence
```

---

# 24. Repository Architecture

The major repository components are organized as follows:

```text
BIS-agent/
│
├── Frontend/
│   └── React/Vite client
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   └── services/
│   │
│   ├── data/
│   │   ├── bis.db
│   │   └── chroma/
│   │
│   ├── tests/
│   └── requirements.txt
│
├── rag/
│   ├── data/
│   ├── raw/
│   ├── processed/
│   ├── sources/
│   ├── ingestion/
│   ├── chunking/
│   ├── embeddings/
│   ├── vector_store/
│   ├── retrieval/
│   ├── index.py
│   └── validate_data.py
│
├── tests/
│   └── rag/
│
├── docs/
│
├── Memory.md
├── Phases.md
├── README.md
└── Architecture.md
```

The repository currently separates the frontend, backend, RAG subsystem, tests, and project documentation into distinct areas.

---

# 25. Data Flow

## Knowledge Ingestion

```text
Official BIS / Government Sources
             ↓
        Source Registry
             ↓
       Data Extraction
             ↓
       Data Validation
             ↓
       Curated JSON
             ↓
      ┌──────┴───────┐
      ▼              ▼
   SQLite         RAG Index
                     ↓
                  Chunking
                     ↓
                 Embeddings
                     ↓
                  ChromaDB
```

## Query Processing

```text
User
 ↓
Frontend
 ↓
FastAPI
 ↓
Intent + Context
 ↓
Hybrid Retrieval
 ├── SQLite
 └── ChromaDB
 ↓
Evidence Package
 ↓
Gemini
 ↓
Response Validation
 ↓
Sources + Answer
```

---

# 26. Testing Architecture

Testing is divided across multiple layers.

```text
                Test Pyramid
                     │
        ┌────────────┴────────────┐
        │                         │
   Backend Tests             Frontend Tests
        │                         │
        ├── API                  ├── Components
        ├── Database             ├── UI behavior
        ├── RAG                  └── Integration
        ├── Retrieval
        ├── Intent
        ├── LLM
        ├── Orchestrator
        └── Validation
```

### RAG tests

Validate:

- Embedding generation
- Vector store behavior
- Semantic retrieval
- Hybrid retrieval
- Entity matching
- Source retrieval
- Confidence behavior

### Backend tests

Validate:

- API
- Database
- Services
- Intent detection
- LLM integration
- Orchestration
- Anti-hallucination validation

### Frontend tests

Validate:

- UI behavior
- Components
- Client-side interactions
- Production build integrity

---

# 27. Data Integrity

The knowledge base follows a relational integrity model.

Before indexing:

```text
JSON Knowledge Base
        ↓
validate_data.py
        ↓
Check:
├── Duplicate IDs
├── Missing standards
├── Broken product references
├── Broken QCO references
├── Broken scheme references
└── Broken laboratory references
        ↓
Valid Dataset
```

Only validated data should be seeded into SQLite and indexed into ChromaDB.

---

# 28. Indexing Strategy

The indexing process is designed to be deterministic and repeatable.

```bash
python -m rag.index
```

For a complete rebuild:

```bash
python -m rag.index --reset
```

The process:

```text
Curated Data
     ↓
Chunking
     ↓
Metadata
     ↓
Embeddings
     ↓
ChromaDB Upsert
```

Idempotent indexing prevents duplicate vector records during repeated development runs.

---

# 29. Security and Reliability Principles

The architecture follows these principles:

### 1. Never trust the LLM as the source of truth

The LLM explains retrieved information.

### 2. Prefer authoritative sources

BIS and government sources take priority.

### 3. Never fabricate regulatory requirements

Unsupported mandatory claims must not be generated.

### 4. Preserve source traceability

Important factual claims should map to supporting evidence.

### 5. Validate structured relationships

Broken references should be detected before indexing.

### 6. Fail safely

When evidence is insufficient:

```text
No verified evidence
        ↓
Do not guess
        ↓
Explain limitation
        ↓
Ask for clarification / provide safe next step
```

---

# 30. Scalability

The current architecture is designed to scale from the curated MVP dataset to a much larger BIS knowledge base.

Potential future improvements include:

- Larger BIS standard coverage
- Additional government sources
- Automatic source refresh
- Versioned standards
- Amendment tracking
- Multilingual retrieval
- Better reranking models
- Distributed vector databases
- PostgreSQL for production deployments
- Redis-based caching
- Background ingestion workers
- Observability and analytics

The existing separation between structured data, vector retrieval, orchestration, and presentation makes these upgrades possible without redesigning the entire application.

---

# 31. Architectural Design Principles

The BIS Agent follows five major principles:

## Grounded

Answers should originate from verified BIS evidence.

## Deterministic where possible

Structured relationships should be resolved through the database rather than probabilistic generation.

## Semantic where necessary

Natural-language queries should be handled through vector retrieval when exact keyword matching is insufficient.

## Conversational

Users should be able to ask follow-up questions without repeatedly specifying the same product or standard.

## Verifiable

Important answers should expose supporting sources and evidence.

---

# 32. Final Architecture

```text
                         ┌─────────────────┐
                         │      USER       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ React / Vite UI │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    FastAPI      │
                         │   REST Layer    │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │     AI ORCHESTRATOR      │
                    │                          │
                    │ Intent + Context         │
                    │ Retrieval Planning       │
                    │ Evidence Assembly        │
                    │ Response Generation      │
                    │ Response Validation      │
                    └────────────┬─────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
                ▼                                 ▼
       ┌─────────────────┐              ┌─────────────────┐
       │   SQLite / ORM  │              │  Hybrid RAG     │
       │                 │              │                 │
       │ Standards       │              │ ChromaDB        │
       │ Products        │              │ Embeddings      │
       │ QCOs            │              │ Semantic Search │
       │ Schemes         │              │ Chunking        │
       │ Laboratories    │              │ Metadata        │
       └────────┬────────┘              └────────┬────────┘
                │                                │
                └───────────────┬────────────────┘
                                ▼
                       ┌──────────────────┐
                       │ Evidence Package │
                       │                  │
                       │ Sources          │
                       │ Entities         │
                       │ Confidence       │
                       │ Retrieved Text   │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Google Gemini    │
                       │ Response Layer   │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Validation /     │
                       │ Anti-Hallucination│
                       └────────┬─────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Answer + Sources │
                       │ + Confidence     │
                       └──────────────────┘
```

---

## 33. Summary

The BIS Intelligent Assistant is a **hybrid AI + deterministic knowledge system**, rather than a conventional chatbot.

Its architecture combines:

**React/Vite**
→ **FastAPI**
→ **AI Orchestrator**
→ **Intent & Context Resolution**
→ **Hybrid Retrieval**
→ **SQLite + ChromaDB**
→ **Evidence Package**
→ **Gemini**
→ **Anti-Hallucination Validation**
→ **Source-Backed Response**

This architecture allows the system to combine the strengths of:

- Relational databases for exact BIS relationships
- Vector search for natural-language discovery
- Deterministic intent handling for predictable workflows
- LLMs for explanation and conversational interaction
- Evidence validation for reliability
- Source citations for transparency

The result is an architecture designed specifically for **BIS standards and compliance intelligence**, rather than a generic RAG chatbot.