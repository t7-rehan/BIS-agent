# RAG Knowledge Base & Ingestion Foundation (Phase 2)

Curated, authoritative, source-traceable knowledge dataset and document ingestion foundation for the **AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers**.

> 📌 **Phase Status: Phase 2 — BIS Knowledge Data Collection & Ingestion Foundation**  
> This directory houses the curated datasets, source registries, ingestion pipeline utilities, and semantic chunking foundation.  
> **Note:** Vector databases, embeddings, neural retrievers, and LLM integrations are strictly out of scope for Phase 2 and will be layered on in subsequent phases.

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
├── ingestion/                      # Reusable document ingestion utilities
│   ├── __init__.py
│   ├── fetch.py                    # Safe HTTP fetcher with retries, backoff, and local disk cache
│   ├── pdf_parser.py               # PDF parser extracting text, page markers, and standard clauses
│   └── html_parser.py              # Zero-dependency HTML cleaner using Python standard library
│
├── chunking/                       # Retrieval chunking foundation
│   ├── __init__.py
│   └── chunker.py                  # Semantic text chunker preserving parent source traceability
│
├── validate_data.py                # Automated integrity and foreign-key relational validation script
└── README.md                       # This documentation file
```

---

## 2. Authoritative Data Sources

In strict compliance with the project's source policy, every record originates from official, authoritative government and statutory portals:

1. **Bureau of Indian Standards (BIS):** [https://www.bis.gov.in/](https://www.bis.gov.in/)
2. **Know Your Standard (KYS) Directory:** [https://www.services.bis.gov.in/...](https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails)
3. **Products Under Compulsory Certification:** [https://www.bis.gov.in/product-certification/...](https://www.bis.gov.in/product-certification/products-under-compulsory-certification/)
4. **Manakonline e-BIS Portal:** [https://www.manakonline.in/](https://www.manakonline.in/)
5. **Compulsory Registration Scheme (CRS) Portal:** [https://www.crsbis.in/BIS/](https://www.crsbis.in/BIS/)
6. **Laboratory Information Management System (LIMS):** [https://www.lims.bis.gov.in/](https://www.lims.bis.gov.in/)
7. **Official Gazette Notifications:** DPIIT, Ministry of Steel, MeitY, MoRTH, Ministry of Consumer Affairs, and FSSAI.

---

## 3. Dataset Scope & Statistics

| Dataset | File | Record Count | Description |
| :--- | :--- | :---: | :--- |
| **Source Registry** | `sources/sources.json` | 16 | Central index of authoritative domains & gazettes |
| **Indian Standards** | `data/standards.json` | 26 | IS numbers, titles, technical departments, KYS URLs |
| **Products** | `data/products.json` | 23 | Products mapped to standards, QCOs, and schemes |
| **Quality Control Orders** | `data/qcos.json` | 16 | Mandatory Gazette orders with enforcement dates |
| **Certification Schemes** | `data/certification_schemes.json` | 20 | Scheme-I (ISI), Scheme-II (CRS), Hallmarking |
| **Testing Laboratories** | `data/laboratories.json` | 20 | Central/Regional labs, testing scopes, validities |
| **General Knowledge** | `data/general_knowledge.json` | 12 | In-depth regulatory, SIT, and consumer guides |

### End-to-End Demo Flow Alignment
The dataset is curated to enable the complete vertical compliance path across diverse industries:

```
User Query ("What BIS standard applies to electric mixers?")
  │
  ▼
Product: Electric Food Mixer and Kitchen Grinder (PROD-ELECTRIC-MIXER)
  │
  ▼
Applicable Standards: IS 302 (Part 1) : 2024 & IS 302 (Part 2/Sec 14) : 2009
  │
  ▼
Mandatory QCO: Electrical Appliances for Domestic Purposes QCO, 2024 (QCO-APPLIANCES-2024)
  │
  ▼
Certification Scheme: Scheme I - Product Certification (ISI Mark) (SCHEME-ISI-KITCHEN-MACHINES)
  │
  ▼
Recognized Testing Labs: BIS Central Lab (Sahibabad), SROL (Chennai), NTH (Southern Region)
  │
  ▼
Evidence & Knowledge: Step-by-step Manakonline filing guide + SIT requirements
```

---

## 4. Schemas & Integrity Rules

All records are validated using `rag/validate_data.py`. Integrity rules enforce:
1. **Uniqueness:** No duplicate record IDs or duplicate IS numbers.
2. **Mandatory Source Traceability:** Every record contains an active `source_url` starting with `http`.
3. **Foreign Key Cross-Referencing:**
   - Every `applicable_is_numbers` in `products.json` must exist in `standards.json`.
   - Every `qco_ids` in `products.json` must exist in `qcos.json`.
   - Every `certification_scheme_ids` in `products.json` must exist in `certification_schemes.json`.
   - Every `is_numbers` in `qcos.json` and `certification_schemes.json` must exist in `standards.json`.
   - Every `applicable_is_numbers` in `laboratories.json` must reference a valid standard.

---

## 5. Ingestion Pipeline & Chunking Utilities

### Fetcher (`rag/ingestion/fetch.py`)
- Polite HTTP fetching with custom User-Agent, socket timeouts, and exponential backoff retry.
- Automatic disk caching to `rag/raw/<sha256_hash>.html|.pdf` to prevent redundant network requests.

### Parsers
- **HTML Parser (`rag/ingestion/html_parser.py`):** Uses Python standard library `html.parser.HTMLParser` to eliminate scripts, styles, and boilerplate navigation while preserving heading structure and clean paragraphs.
- **PDF Parser (`rag/ingestion/pdf_parser.py`):** Structured PDF text reader that identifies standard clause markers (e.g. `Clause 4.1 Material Specification`, `Clause 7.1 Hydrostatic Test`).

### Chunking Foundation (`rag/chunking/chunker.py`)
- Splits documents along semantic boundaries (paragraphs, sentences, clauses).
- Default chunk size: 500 characters, overlap: 50 characters.
- **Preserves metadata on every chunk:** `document_id`, `document_title`, `source_url`, `source_type`, `chunk_index`, and character span offsets for precise citation attribution in future RAG phases.

---

## 6. How to Run Data Validation

Run the standalone validation script:
```powershell
python rag/validate_data.py
```

Or execute via the project's automated test suite:
```powershell
pytest backend/tests/test_rag_data.py -v
```

---

## 7. How to Add a New BIS Source

1. **Register the Source:** Add an entry to `rag/sources/sources.json` with `source_id`, `title`, `url`, `source_type`, `authority`, and `retrieved_at`.
2. **Add Standards:** If the source introduces new standards, add their metadata and `is_number` to `rag/data/standards.json`.
3. **Add Products / QCOs / Labs:** Ensure that any newly referenced standard codes exactly match `is_number` in `standards.json`.
4. **Validate Integrity:** Run `python rag/validate_data.py` to ensure all foreign key relationships and schema constraints pass without errors.

---

## 8. Limitations & Future Scope

- **Prototype Scope:** The dataset currently covers 26 major Indian Standards across high-priority SIH domains (lighting, electronics, cookware, steel, automotive, toys, solar, water, hallmarking). Full nationwide coverage entails tens of thousands of standards.
- **No Vector Embeddings Yet:** Embeddings and vector database ingestion are intentionally deferred to subsequent phases as per project roadmap.
