# BIS Knowledge Base Expansion Plan

**Date:** September 2026  
**Status:** Approved — Phase 1 implemented  
**Repository:** BIS Intelligent Assistant (BIS Agent)

---

## 1. Current Baseline (Pre-Expansion)

| Entity | Count | Notes |
|---|---|---|
| Standards | 26 | All electrical/consumer-heavy |
| Products | 23 | Prototype coverage only |
| QCOs | 16 | Major compulsory-certification products |
| Certification Schemes | 20 | Scheme I and II only |
| Laboratories | 20 | ~5 BIS + ~15 recognized |
| General Knowledge | 12 | Key regulatory topics |
| Source Registry | 16 | Official BIS URLs |
| ChromaDB Chunks | ~121 | 6 document types |

**Coverage gaps identified:**
- No BIS organizational / services knowledge (hallmarking centres, regional offices, BIS Act summary, etc.)
- No Scheme IV (CoC), Scheme X (Management System Certification), or hallmarking scheme detail
- No industrial/mechanical products beyond pressure cookers and TMT
- No chemical, textiles, food, automotive, or medical products
- No general knowledge on BIS services: BIS Care, Manakonline portal help, consumer rights
- No amendment/corrigendum tracking
- Missing QCOs for many active product categories
- Lab coverage shallow (no NABL/LRS information for specific test scopes)
- index.py has a field-name mismatch — chunks are not fully populated

---

## 2. Expansion Goals

> The goal is NOT to index every BIS document.
> The goal is structured, authoritative coverage that allows the assistant to:
> (a) answer the broadest set of common BIS questions accurately,
> (b) cite an official source,
> (c) explicitly say when evidence is insufficient.

---

## 3. Priority Tiers

### PRIORITY 1 — Implement Now (Highest Value/Coverage)

**P1.1: Fix index.py field-name mismatch**  
The indexer references `item.get("content")`, `item.get("key_points")`, `item.get("name")` etc., but the JSON files use `text`, no `key_points`, and entity-specific names (`qco_name`, `laboratory_name`). This means all non-GK chunks are sparsely embedded. Fix the field mapping.

**P1.2: Expand Standards coverage — 26 → 80+**  
Target categories currently missing:
- Mechanical engineering (IS 4985 PVC pipes, IS 1239 MS pipes, IS 3600 series)
- Chemical/plastics (more IS numbers)
- Food/agro (packaged goods standards)
- Textile (important for QCO coverage)
- Healthcare/medical devices
- Civil/construction (beyond rebar + cement)

**P1.3: Expand QCOs — 16 → 40+**  
Currently active QCOs issued by DPIIT, MoPNG, MoRTH, Ministry of Steel, Ministry of Textiles, MoH, FSSAI that are not yet covered.

**P1.4: Expand Products — 23 → 60+**  
Match every standard and QCO with a product entry (with aliases, category, subcategory).

**P1.5: Expand General Knowledge — 12 → 30+**  
Add articles for:
- BIS as an organization (history, mandate, BIS Act 2016)
- Hallmarking in detail (AHC, HUID process, obligations)
- BIS Care app capabilities
- Regional offices and their role
- Management System Certification (Scheme X)
- ISI Mark vs CE/UL/etc. international equivalence
- Certification renewal process
- Surveillance inspections and market raids
- Standards development process
- Consumer complaint process

**P1.6: Add BIS Services knowledge entity type**  
New document type `"bis_service"` for services like:
- Know Your Standard portal
- Manakonline portal
- BIS Care app
- CRS Registration portal
- Hallmarking portal
- e-BIS standards purchase
- Training / NITS
- Standards Clubs

**P1.7: Data validation tool**  
The `rag/validate_data.py` already exists. Verify it runs correctly and output a clean report.

---

### PRIORITY 2 — Implement in Phase 2

**P2.1: Industrial/electrical products**
- IS 694 PVC cables, IS 1554 heavy electrical cables
- IS 3043 earthing
- IS 5 colours for safety

**P2.2: Construction and civil products**
- IS 383 aggregates, IS 432 mild steel, IS 516 concrete testing
- IS 650 standard sand, IS 2430 natural aggregate sampling

**P2.3: Chemical and plastics**
- IS 4985 uPVC pipes for water supply
- IS 12235 HDPE pipes
- IS 2508 low density polyethylene films
- IS 7328 HDPE materials

**P2.4: Food and agriculture**
- IS 1446 spices and condiments
- IS 1116 food-grade packaging
- Packaged commodity rules interactions

**P2.5: Automotive and transport**
- More IS numbers under IS 2512, IS 5082, AIS standards
- Interaction with CMVR

**P2.6: Medical devices**
- Selected mandatory device categories

**P2.7: Textile and apparel**
- QCO-driven mandatory textile standards

**P2.8: Deeper laboratory scopes**
- Test-method to lab mapping (which lab can perform which specific test)
- State-wise lab coverage
- NABL accreditation scope details

---

### PRIORITY 3 — Long-term

**P3.1: Amendments and corrigenda tracking**
- Amendment model in SQLite
- Amendment-aware query logic

**P3.2: Standards Committee knowledge**
- Technical division coverage (ETD, CED, CHD, MHD, etc.)
- Which committees handle which product categories

**P3.3: International harmonisation tracking**
- IS ↔ IEC / ISO / EN equivalent mappings

**P3.4: Archived/superseded standards**
- Superseded IS numbers with redirect to current version

**P3.5: Automated freshness monitoring**
- Scheduled check against BIS KYS API / Gazette RSS
- Alert when QCO enforcement dates change

---

## 4. Data Quality Standards

Every record added must have:
- `id` — stable, unique, human-readable slug
- `source_url` — valid official government/BIS URL
- `retrieved_at` — ISO timestamp of when data was verified
- No fabricated IS numbers, QCO dates, or mandatory status claims
- Status field: `CURRENT` / `SUPERSEDED` / `AMENDED` / `REPEALED` / `UPCOMING`

---

## 5. Architecture Changes Required

| Component | Change | Priority |
|---|---|---|
| `rag/index.py` | Fix field-name mismatch for all 6 document types | P1 — critical |
| `rag/data/standards.json` | Expand from 26 to 80+ records | P1 |
| `rag/data/products.json` | Expand from 23 to 60+ records | P1 |
| `rag/data/qcos.json` | Expand from 16 to 40+ records | P1 |
| `rag/data/general_knowledge.json` | Expand from 12 to 30+ records | P1 |
| `rag/data/bis_services.json` | New file: BIS digital services | P1 |
| `backend/app/db/models.py` | Add `BISService` model | P1 |
| `backend/app/db/seed.py` | Seed `bis_services.json` | P1 |
| `backend/app/services/query_service.py` | Add `BISServiceQueryService` | P1 |
| `rag/index.py` | Index `bis_services.json` | P1 |
| `rag/validate_data.py` | Verify and extend coverage report | P1 |
| `backend/app/db/models.py` | Add `keywords`, `status` columns to Standard | P2 |
| `backend/app/db/models.py` | Add `Amendment` model | P3 |

---

## 6. What This Expansion Does NOT Do

- Does not bypass BIS access controls or download paid/protected standards
- Does not scrape arbitrary web content
- Does not fabricate technical specifications, test clauses, or regulatory dates
- Does not add content without a verifiable official source URL
- Does not break the existing retrieval architecture
- Does not lower similarity thresholds to compensate for data gaps
