# Smart India Hackathon (SIH) Demo Checklist & Playbook
## AI-Powered Intelligent Assistant for Indian Standards & BIS Services

This playbook is designed for live demonstrations, hackathon judging rounds, and stakeholder walkthroughs. It emphasizes **regulatory trust, zero hallucination, evidence traceability, and interactive clarification** over generic AI chat.

---

## 1. Pre-Demo Environment Startup

### Step A: Start FastAPI Backend
Open a terminal in the project root:
```bash
# Activate virtualenv
cd backend
.\.venv\Scripts\activate

# Start Uvicorn server on port 8000
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- Expected Terminal Output:
  - `Starting BIS Intelligent Assistant Backend v0.1.0 in [development] mode`
  - `Uvicorn running on http://127.0.0.1:8000`

### Step B: Verify Backend Health Check
Open browser or terminal and test:
```bash
curl http://127.0.0.1:8000/api/health
```
- Expected Response:
  ```json
  {"status":"ok","service":"bis-intelligent-assistant-backend","version":"0.1.0"}
  ```

### Step C: Start Vite Frontend Client
Open a second terminal:
```bash
cd Frontend
npm run dev -- --port 5173
```
- Open browser at: `http://localhost:5173/assistant`
- Verify the header badge shows: **`Operational / Backend Online`** (green).

---

## 2. Recommended 6-Step SIH Live Demo Sequence

Follow this exact sequence to showcase the system's core capabilities, evidentiary rigor, and regulatory safety:

### STEP 1: Product → Applicable Standard Lookup
- **Action:** Click the starter chip or type:
  > *"Which Indian Standard applies to pressure cookers?"*
- **What to Observe:**
  - Fast response identifying **IS 2347** (*Domestic Pressure Cookers - Specification*).
  - Extracted entity chips: Standard `IS 2347` and Product `Domestic Pressure Cooker`.
  - Confidence Badge: **`Confidence: High`** (evidence-grounded).
- **What to Tell the Judges:**
  > *"Notice how the assistant doesn't guess or fabricate an IS number. It deterministically resolves the statutory product entity and links it directly to IS 2347."*

---

### STEP 2: Statutory QCO & Mandatory Compliance
- **Action:** Type:
  > *"Is BIS certification mandatory for pressure cookers under QCO?"*
- **What to Observe:**
  - Clear confirmation that certification **is mandatory** under the *Domestic Pressure Cooker (Quality Control) Order, 2020* issued by the Department of Consumer Affairs.
  - Identification of **Scheme I (ISI Mark)** requirement.
  - Distinction between voluntary standards and mandatory statutory orders.
- **What to Tell the Judges:**
  > *"In the BIS regulatory landscape, having an Indian Standard does NOT automatically make compliance mandatory. Our system cross-references official Gazette Quality Control Orders (QCOs) to distinguish statutory legal mandates from voluntary standards."*

---

### STEP 3: Evidence Traceability & Verified Citations
- **Action:** Scroll down to the response metadata:
  - Point to **"Key Evidence & Standard Clauses"**.
  - Point to **"Verified Official Citations"**.
  - Click on the `[View Source ↗]` button for `Domestic Pressure Cooker (Quality Control) Order, 2020`.
- **What to Observe:**
  - Securely opens official government URL (`consumeraffairs.nic.in` or `bis.gov.in`) in a new browser tab with `rel="noopener noreferrer"`.
- **What to Tell the Judges:**
  > *"Every claim is grounded in our curated knowledge base. Every citation displayed is an authentic government URL—never an LLM hallucination."*

---

### STEP 4: Recognized Testing Laboratories
- **Action:** Click the starter chip or type:
  > *"Which recognized laboratory can test cement under IS 1489?"*
- **What to Observe:**
  - Retrieves recognized laboratories: **National Test House (NTH)** and **National Council for Cement and Building Materials (NCB)** with clause-level testing capabilities.
- **What to Tell the Judges:**
  > *"MSMEs frequently don't know where to get statutory pre-licence testing performed. Our assistant provides recognized laboratory names, test scopes, and direct links to BIS LIMS."*

---

### STEP 5: Interactive Clarification on Vague Query
- **Action:** Type an intentionally vague single word:
  > *"cooker"*
- **What to Observe:**
  - The assistant does **NOT** guess.
  - A prominent **Clarification Alert Card** appears:
    > *"You asked about 'cooker'. Are you looking for its applicable Indian Standard, mandatory certification status under Quality Control Orders (QCOs), or recognized testing laboratories?"*
  - `needs_clarification: True` is flagged.
- **What to Tell the Judges:**
  > *"Generic chatbots give hallucinated lectures when given ambiguous input. The BIS Sahayak asks clarifying questions to narrow down the user's exact regulatory requirement before giving formal advice."*

---

### STEP 6: Anti-Hallucination & Out-of-Scope Protection
- **Action:** Type an impossible or out-of-scope query:
  > *"What Indian Standard applies to commercial interstellar quantum spaceships?"*
- **What to Observe:**
  - Confidence Badge: **`Confidence: Insufficient Evidence`**.
  - Answer:
    > *"I could not locate sufficient official BIS evidence regarding your query in the current curated database. Please verify your product specifications or search directly on the official BIS portal (https://www.bis.gov.in)."*
  - **Zero hallucinated standard numbers** or false regulatory claims.
- **What to Tell the Judges:**
  > *"When evidence is absent, our system transparently communicates insufficient data rather than fabricating non-existent Indian Standards. This is paramount for legal and regulatory applications."*

---

## 3. Key Talking Points for Judges

1. **Problem Statement Solved:** Demystifies India's fragmented compliance landscape (gazettes, ministries, BIS portal, Manakonline, CRS, and LIMS) for MSMEs and consumers.
2. **Hybrid Retrieval Architecture:** Combines fast SQLite relational lookups (exact standard-to-product foreign keys) with dense vector semantic search (FastEmbed ONNX + ChromaDB).
3. **Double-Layer Anti-Hallucination Guard:** Responses generated by Google Gemini are validated by an independent post-generation validation layer (`ResponseValidator`) verifying IS numbers, mandatory claims, and citation URLs against retrieved facts.
4. **Offline Fallback Guarantee:** If the cloud LLM is offline or unkeyed, the system falls back seamlessly to deterministic factual synthesis from the database with 100% uptime.

---

## 4. Known Limitations & Transparent Disclaimers

- **Curated Dataset Size:** The MVP contains 26 core Indian Standards, 23 commercial products, 6 certification schemes, and 11 recognized laboratories across high-priority SIH sectors. National scaling across 22,000+ standards is planned for Phase 8.
- **Statutory Authority:** The assistant provides informational guidance. Legal compliance requires official verification on `bis.gov.in` and respective Ministry gazettes.

---

## 5. Quick Recovery & Backup Troubleshooting

| Symptom | Quick Fix |
| :--- | :--- |
| Frontend shows "Connecting..." | Ensure backend uvicorn process is running on `127.0.0.1:8000`. |
| Port 8000 already in use | Kill conflicting process: `Get-Process python -ErrorAction SilentlyContinue \| Stop-Process -Force` |
| Vite dev server fails to bind | Run `npm run dev -- --port 5173 --force` |
| Gemini rate limit / offline | The orchestrator automatically falls back to offline factual synthesis without throwing errors. |
