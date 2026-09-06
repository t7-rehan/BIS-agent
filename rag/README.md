# RAG Knowledge Base, Vector Store & Retrieval Engine (Phase 4)

Curated, authoritative, source-traceable knowledge dataset, local vector store, and hybrid retrieval engine for the **AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers**.

> 📌 **Phase Status: Phase 4 — RAG + Vector Search (COMPLETED)**  
> This directory houses the curated datasets, source registries, document ingestion utilities, semantic chunking pipeline, local ChromaDB vector store, ONNX sentence-transformer embeddings, and unified hybrid retrieval service.

---

## 1. Directory Structure

```
rag/
├── sources/
│   └── sources.json                # Authoritative source registry tracking official portals & gazettes
│
├── raw/                            # Directory for cached raw HTML / PDF / JSON documents
│   └── .gitkeep
│
├── processed/                      # Intermediate parsed text files
│   └── .gitkeep
│
├── data/                           # Curated, relationally verified JSON knowledge datasets
│   ├── standards.json              # 26 Indian Standards with technical divisions & official KYS URLs
│   ├── products.json               # 23 Products with relational links to standards, QCOs, and schemes
│   ├── qcos.json                   # 16 Gazette Quality Control Orders with enforcement dates & ministries
│   ├── certification_schemes.json  # 20 Certification Scheme records (Scheme I, Scheme II, Hallmarking)
│   ├── laboratories.json           # 20 BIS Central, Regional, and recognized NABL testing laboratories
│   └── general_knowledge.json     # 12 Foundational articles explaining regulatory & consumer workflows
│
├── ingestion/                      # Document ingestion utilities
│   ├── __init__.py
│   ├── fetch.py                    # Safe HTTP fetcher with retries, backoff, and local disk cache
│   ├── pdf_parser.py               # PDF parser extracting text, page markers, and standard clauses
│   └── html_parser.py              # Zero-dependency HTML cleaner using Python standard library
│
├── chunking/                       # Retrieval chunking foundation
│   ├── __init__.py
│   └── chunker.py                  # Semantic text chunker preserving parent source traceability
│
├── embeddings/                     # Local embedding generator
│   ├── __init__.py
│   └── embedder.py                 # BISEmbedder using all-MiniLM-L6-v2 (384 dims, local ONNX/CPU)
│
├── vector_store/                   # Persistent local vector database
│   ├── __init__.py
│   └── chroma_store.py             # ChromaStore wrapping ChromaDB with idempotent upserts & sanitization
│
├── retrieval/                      # Retrieval engines
│   ├── __init__.py
│   ├── retriever.py                # SemanticRetriever executing dense vector searches with cosine similarity
│   └── hybrid.py                   # BISHybridRetriever merging vector search with SQLite relational lookups
│
├── index.py                        # Deterministic CLI & programmatic indexing pipeline
├── validate_data.py                # Automated integrity and foreign-key relational validation script
└── README.md                       # This documentation file
```

---

## 2. RAG Architecture & Ingestion Flow

```
Curated Data (rag/data/*.json)
        │
        ▼
Semantic Chunker (rag/chunking/chunker.py)
   [Document to 600-char chunks with 60-char overlap + metadata]
        │
        ▼
Deterministic IDs ({doc_id}-chk-{index})
        │
        ▼
Local Embeddings (rag/embeddings/embedder.py)
   [all-MiniLM-L6-v2 via ONNX Runtime, 384 dimensions, CPU mode]
        │
        ▼
ChromaDB Vector Store (backend/data/chroma/)
   [Cosine metric, HNSW index, metadata filtering]
        │
        ▼
Hybrid Retriever (rag/retrieval/hybrid.py)
   ├── 1. Semantic vector search (top-k chunks)
   ├── 2. Relational expansion via SQLite (BISQueryService)
   │      - Extracted IS numbers & product aliases
   │      - Linked standards, products, QCOs, schemes, labs
   └── 3. Merged output with confidence score & deduplicated citations
```

---

## 3. Dataset Scope & Statistics

| Dataset | File | Record Count | Chunks Indexed | Description |
| :--- | :--- | :---: | :---: | :--- |
| **Indian Standards** | `data/standards.json` | 26 | 30 | IS numbers, titles, technical departments, KYS URLs |
| **Products** | `data/products.json` | 23 | 23 | Products mapped to standards, QCOs, and schemes |
| **Quality Control Orders** | `data/qcos.json` | 16 | 16 | Mandatory Gazette orders with enforcement dates |
| **Certification Schemes** | `data/certification_schemes.json` | 20 | 20 | Scheme-I (ISI), Scheme-II (CRS), Hallmarking |
| **Testing Laboratories** | `data/laboratories.json` | 20 | 20 | Central/Regional labs, testing scopes, validities |
| **General Knowledge** | `data/general_knowledge.json` | 12 | 12 | In-depth regulatory, SIT, and consumer guides |
| **TOTAL** | | **117** | **121** | **Indexed in ChromaDB `bis_knowledge` collection** |

---

## 4. How to Run Indexing

### Standard Idempotent Indexing:
```powershell
python -m rag.index
```

### Full Re-index (Drop & Recreate Collection):
```powershell
python -m rag.index --reset
```

Execution takes ~4 to 7 seconds locally on standard CPU hardware.

---

## 5. Retrieval Usage Examples

### Semantic Search:
```python
from rag.retrieval.retriever import SemanticRetriever

retriever = SemanticRetriever()
results = retriever.retrieve("domestic plugs and socket outlets safety", top_k=3)
for r in results:
    print(f"[{r['score']}] {r['chunk_id']}: {r['source_title']} -> {r['source_url']}")
```

### Hybrid Search (Vector + SQLite):
```python
from rag.retrieval.hybrid import BISHybridRetriever

retriever = BISHybridRetriever()
result = retriever.search("What standard applies to electric food mixers?")

print("Confidence:", result.confidence_score)
print("Semantic chunks:", len(result.semantic_chunks))
print("Matched products:", [p["product_name"] for p in result.structured_entities.get("products", [])])
print("Matched QCOs:", [q["name"] for q in result.structured_entities.get("qcos", [])])
print("Sources:", [s["source_url"] for s in result.sources])
```

---

## 6. Evaluation Benchmark Suite

A benchmark evaluation suite with 15 real-world queries across 5 categories is defined in `tests/rag/evaluation_queries.json` and tested in `backend/tests/test_retrieval.py`:

- Standard Lookups (`IS 1293`, `IS 302`, `IS 2347`, `IS 10322`)
- QCO Mandates (`QCO-APPLIANCES-2024`, `QCO-TOYS-2020`, `QCO-PLUGS-2020`)
- Certification Schemes (`SCHEME-1-ISI`, `SCHEME-2-CRS`, `SCHEME-FMCS`)
- Laboratory Testing Facilities (`LAB-BIS-CENTRAL`, `LAB-NTH-KOL`, `LAB-CL-MUMBAI`)
- General Knowledge & Hallmarking (ISI vs CRS, Jewellery Hallmarking)

All 15 benchmark queries achieve 100% precision with positive confidence scores and verified official source citations.

---

## 7. Testing

Run all RAG and retrieval test suites:
```powershell
pytest backend/tests/test_embeddings.py -v
pytest backend/tests/test_vector_store.py -v
pytest backend/tests/test_retrieval.py -v
```

Run entire test suite (all 45 tests across Phases 1-4):
```powershell
pytest backend/tests/ -v
```
