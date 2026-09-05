# Phases.md — Development Roadmap

## Purpose

This file breaks the entire project into small, manageable, sequential development phases so that an AI coding agent does **not** attempt to build the whole application at once.

This is a **development roadmap** — it defines **WHAT** should be built and **WHEN**. It is not a coding-rules file and not an AI/RAG behavior specification. (`Rules.md`, if present, defines **HOW** the AI should develop software. Keep these responsibilities separate.)

**Project:** AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers.

There is currently **no existing application repository or codebase**. This document defines the plan before implementation begins. No technology stack is assumed unless explicitly decided in Phase 0 or later. No application code is written here.

---

## Status

- **Current Phase:** Phase 0
- **Status:** NOT STARTED
- **Completed Phases:** None
- **Blocked Phases:** None

Status values: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `READY FOR REVIEW`, `COMPLETE`

A phase is never marked `COMPLETE` merely because files were created — its functionality must actually be tested or verified against its Acceptance Criteria.

---

## How to Use This File

**When asked to "build the project":**
1. Read this file in full.
2. Determine the current phase from the Status section above.
3. Inspect the existing project state (do not assume prior work exists or is correct).
4. Do not skip phases unless explicitly instructed.
5. Do not implement future-phase functionality without permission.
6. Break the current phase into small implementation tasks.
7. Implement only the current phase.
8. Test the implementation.
9. Fix issues discovered during verification, then re-test.
10. Provide a Completion Report (see template below).
11. Stop and wait for approval before moving to the next phase.

**When the user says "Continue to the next phase":**
1. Verify the previous phase was actually completed.
2. Check its Acceptance Criteria were satisfied.
3. Identify dependencies for the next phase and confirm they are met.
4. Update the Status section.
5. Start the next phase, following the same process above.

**General rules:**
- Correctness > Completeness > Speed.
- A smaller working implementation is better than a large incomplete one.
- Never say "everything is implemented" unless it has actually been implemented and verified.
- Never hide failed tests or unresolved errors.
- Never silently skip a phase.
- Never assume a future feature already exists.
- Never create unnecessary code just to satisfy a phase checklist.
- When requirements are ambiguous, identify the ambiguity and ask for a decision rather than inventing requirements.
- Do not implement future-phase functionality prematurely.
- Do not create unnecessary infrastructure before it is required.
- Prefer a working MVP at every major milestone.
- If a phase becomes too large, split it into smaller sub-phases (e.g., Phase 8a, Phase 8b).

---

## Phase Template

Every phase in this document follows this structure:

- **Objective** — what this phase is supposed to accomplish
- **Scope** — what is included
- **Out of Scope** — functionality that must NOT be implemented during this phase
- **Tasks** — small implementation tasks
- **Deliverables** — files, features, components, APIs, schemas, or other outputs expected
- **Dependencies** — previous phases or decisions required before starting
- **Verification** — how the AI should verify the phase works
- **Acceptance Criteria** — clear conditions that must be satisfied before the phase can be marked COMPLETE

### Completion Report template (fill in at the end of every phase)

```
Completion Report — Phase X

What was implemented:
What was tested:
What passed:
What remains:
Blockers or decisions needed:
```

---

## Dependency Graph

```
Phase 0
  ↓
Phase 1 + Phase 2
  ↓
Phase 3
  ↓
Phase 4
  ↓
Phase 5
  ↓
Phase 6
  ↓
Phase 7
  ↓
Phase 8 + Phase 9 + Phase 10 + Phase 11
  ↓
Phase 12
  ↓
Phase 13
  ↓
Phase 14
  ↓
Phase 15
  ↓
Phase 16
  ↓
Phase 17
  ↓
Phase 18
```

Parallel development is allowed only when dependencies are satisfied. The AI must explicitly identify dependencies before starting any phase.

---

## Phase 0 — Project Foundation & Planning

### Objective
Establish the project structure, requirements, development conventions, documentation, and initial architecture before significant coding begins.

### Scope
- Confirm project requirements
- Define MVP scope
- Establish project structure (directories/repos, not implementation)
- Define architecture (high level, components and their relationships)
- Define development environment
- Define environment-variable strategy
- Define testing strategy
- Define documentation structure
- Establish Rules.md and Phases.md usage conventions
- Identify required external BIS sources
- Identify major technical unknowns and open decisions (e.g., tech stack choices, hosting, LLM provider)

### Out of Scope
- Building the complete application
- Writing any feature code
- Committing to a technology stack without explicit confirmation

### Tasks
1. Gather and confirm functional requirements from the problem statement.
2. Define the MVP scope (which phases/features are essential for a first working demo).
3. Propose a high-level project structure (folders/repos for frontend, backend, ingestion, etc.).
4. Draft a high-level architecture diagram/description covering all planned components.
5. Define local development environment requirements.
6. Define how secrets/config will be managed (without implementing it yet).
7. Define the testing approach to be used across later phases (unit, integration, evaluation).
8. Define where and how project documentation will live.
9. Confirm how Rules.md and Phases.md will be used together going forward.
10. Identify authoritative BIS/government sources to be used in later ingestion phases.
11. List open technical unknowns/decisions that must be resolved before or during relevant phases.

### Deliverables
- Confirmed requirements summary
- MVP scope definition
- Project structure proposal
- High-level architecture document
- Development environment definition
- Environment-variable strategy document
- Testing strategy document
- Documentation structure plan
- List of identified BIS/government sources
- List of open technical unknowns/decisions

### Dependencies
- None (first phase)

### Verification
- Review the planning documents for completeness against the project's stated components (frontend, backend, AI orchestration, RAG pipeline, knowledge base, vector DB, structured DB, hybrid retrieval, classification, certification/QCO intelligence, laboratory info, hallmarking info, evidence/citation system, admin/monitoring).
- Confirm no application code has been written.

### Acceptance Criteria
- A clear, written implementation plan and architecture exist before feature development begins.
- MVP scope is explicitly defined.
- Open technical unknowns are documented, not silently assumed.
- No functional code exists yet.

---

## Phase 1 — Frontend Foundation

### Objective
Create the initial user-facing application shell.

### Scope
- Application layout
- Navigation
- Home/dashboard
- Chat interface (UI only)
- Search interface (UI only)
- Basic responsive design
- Loading states
- Error states
- Empty states
- Basic accessibility

The frontend should initially work with mock/static data where backend functionality does not yet exist.

### Out of Scope
- Real backend integration
- Real AI/RAG responses
- Authentication
- Any certification/QCO/laboratory/hallmarking-specific UI logic beyond placeholders

### Tasks
1. Scaffold the frontend application shell.
2. Build layout and navigation components.
3. Build a home/dashboard view.
4. Build a chat interface using mock responses.
5. Build a search interface using mock/static data.
6. Implement responsive layout behavior.
7. Implement loading, error, and empty states for each view.
8. Apply basic accessibility practices (semantic markup, keyboard navigation, labels).

### Deliverables
- Frontend application shell with navigation
- Home/dashboard page
- Chat interface (mock data)
- Search interface (mock data)
- Documented loading/error/empty states

### Dependencies
- Phase 0 (architecture and structure decisions)

### Verification
- Manually navigate the interface and confirm all views render correctly with mock data.
- Confirm loading/error/empty states can be triggered and display correctly.
- Confirm basic responsiveness on at least mobile and desktop widths.

### Acceptance Criteria
- A user can navigate the interface and interact with the basic UI without requiring the complete AI backend.
- All planned shell views (home, chat, search) exist and are navigable.
- No dependency on live backend/AI functionality.

---

## Phase 2 — Backend Foundation

### Objective
Create the backend foundation and API structure.

### Scope
- Backend project structure
- API architecture
- Configuration
- Environment variables
- Health endpoint
- Error handling
- Request validation
- Logging
- Basic API response structure
- API documentation strategy

### Out of Scope
- The complete AI/RAG system
- Database-backed business logic beyond a basic test endpoint
- Authentication/authorization (see Phase 14)

### Tasks
1. Scaffold the backend project structure per Phase 0 decisions.
2. Implement configuration and environment-variable loading.
3. Implement a health-check endpoint.
4. Implement standard error-handling patterns.
5. Implement request validation for a basic test endpoint.
6. Implement logging conventions.
7. Define a consistent API response structure.
8. Define an API documentation strategy (e.g., how endpoints will be documented going forward).
9. Create a basic test endpoint the frontend can call.

### Deliverables
- Backend project skeleton
- Health endpoint
- One basic test endpoint
- Logging and error-handling conventions in place
- API documentation approach defined

### Dependencies
- Phase 0 (architecture, environment-variable strategy)

### Verification
- Call the health endpoint and confirm a correct response.
- Call the basic test endpoint from the frontend (Phase 1 shell) and confirm successful communication.
- Trigger an invalid request and confirm validation/error handling behaves as expected.

### Acceptance Criteria
- Frontend and backend can communicate through a basic test endpoint.
- Health endpoint returns a correct status.
- Errors are handled consistently and logged.

---

## Phase 3 — Database Foundation

### Objective
Establish persistent data storage.

### Scope
- Database architecture
- Core schemas: standards metadata, QCO metadata, certification metadata, laboratory metadata, source metadata
- User/session-related data if required
- Database connection
- Migrations/seeding strategy

Structured information is kept in a structured database.

### Out of Scope
- Vector database setup (Phase 5)
- Ingestion pipeline logic (Phase 4)
- Populating with real BIS data (only test records here)

### Tasks
1. Finalize database technology choice if not already decided in Phase 0.
2. Design core schemas for standards, QCO, certification, laboratory, and source metadata.
3. Design user/session schema only if required by confirmed requirements.
4. Implement database connection handling in the backend.
5. Implement a migrations/seeding strategy.
6. Write and run test read/write operations against each core schema.

### Deliverables
- Database schema definitions
- Migration/seed scripts
- Backend database connection module
- Test records demonstrating read/write for each schema

### Dependencies
- Phase 2 (backend foundation, configuration, environment variables)

### Verification
- Run migrations against a clean database and confirm success.
- Insert and retrieve test records for each core schema via the backend.

### Acceptance Criteria
- The backend successfully reads and writes test records for all core schemas.
- Migrations/seeding run repeatably without manual intervention.

---

## Phase 4 — BIS Knowledge Acquisition & Ingestion

### Objective
Build the pipeline that collects and processes authorized BIS knowledge sources.

### Scope
- Source inventory
- Source connectors
- Document downloading/importing
- PDF/HTML processing
- Text extraction
- Cleaning
- Metadata extraction
- Document version tracking
- Source timestamps
- Deduplication
- Ingestion logging

Only official BIS/government sources are treated as authoritative; arbitrary internet content is not treated as authoritative BIS information.

### Out of Scope
- Embedding generation / vector storage (Phase 5)
- Retrieval logic (Phase 5/6)
- Full-scale ingestion of the entire BIS corpus (start with a controlled sample)

### Tasks
1. Finalize the source inventory identified in Phase 0.
2. Build connectors/import mechanisms for each identified source type.
3. Implement document download/import handling.
4. Implement PDF/HTML text extraction.
5. Implement text cleaning routines.
6. Implement metadata extraction (title, source, date, version, etc.).
7. Implement document version tracking and source timestamps.
8. Implement deduplication logic.
9. Implement ingestion logging.
10. Run the pipeline against a controlled sample set of BIS documents.

### Deliverables
- Source inventory document
- Ingestion pipeline (connectors, extraction, cleaning, metadata, dedup, logging)
- A controlled sample of successfully ingested documents with metadata stored per Phase 3 schemas

### Dependencies
- Phase 3 (source metadata schema and database connection)
- Phase 0 (identified BIS/government sources)

### Verification
- Run the pipeline on the controlled sample and inspect extracted text, metadata, and logs.
- Confirm duplicate documents are correctly detected and handled.
- Confirm only designated authoritative sources are ingested.

### Acceptance Criteria
- A controlled sample of BIS documents successfully passes through the ingestion pipeline end to end.
- Extracted metadata is accurate and stored correctly.
- Ingestion logs exist and are inspectable.

---

## Phase 5 — RAG / Vector Search Foundation

### Objective
Create semantic retrieval over the processed BIS knowledge.

### Scope
- Chunking
- Embedding generation
- Vector database integration
- Metadata filtering
- Similarity search
- Retrieval API
- Retrieval testing
- Source/document references

The vector database is a retrieval component, not the source of truth — the structured database and original documents remain authoritative.

### Out of Scope
- Hybrid ranking/reranking (Phase 6)
- Orchestration/intent detection (Phase 7)

### Tasks
1. Finalize chunking strategy for ingested documents.
2. Generate embeddings for chunks.
3. Set up and populate the vector database.
4. Implement metadata filtering for vector queries.
5. Implement similarity search.
6. Build a retrieval API endpoint.
7. Ensure retrieved chunks carry source/document references.
8. Test retrieval against representative BIS questions.

### Deliverables
- Chunking implementation
- Embedding generation pipeline
- Populated vector database (from Phase 4 sample)
- Retrieval API endpoint
- Retrieval test results with source references

### Dependencies
- Phase 4 (ingested and processed documents)

### Verification
- Submit test BIS-related questions to the retrieval API and inspect returned chunks and metadata.
- Confirm each retrieved chunk includes traceable source metadata.

### Acceptance Criteria
- Given a test BIS-related question, the system retrieves relevant document chunks with source metadata.
- Retrieval API responds correctly and consistently for the test set.

---

## Phase 6 — Hybrid Retrieval & Reranking

### Objective
Improve retrieval accuracy by combining structured and semantic search.

### Scope
- Vector retrieval (from Phase 5)
- Structured database retrieval
- Keyword/exact matching where useful
- Metadata filtering
- Hybrid ranking
- Reranking
- Retrieval confidence
- Duplicate-result handling

### Out of Scope
- Intent detection/orchestration (Phase 7)
- Downstream feature logic (classification, certification, etc.)

### Tasks
1. Implement structured-database query paths alongside vector retrieval.
2. Implement keyword/exact-match retrieval where appropriate.
3. Combine retrieval sources into a hybrid ranking approach.
4. Implement reranking of combined results.
5. Implement a retrieval confidence indicator.
6. Implement duplicate-result detection/handling across sources.
7. Test hybrid retrieval against the same test set used in Phase 5.

### Deliverables
- Hybrid retrieval module combining vector + structured + keyword search
- Reranking logic
- Retrieval confidence scoring
- Comparative test results (hybrid vs. vector-only)

### Dependencies
- Phase 5 (vector retrieval)
- Phase 3 (structured database)

### Verification
- Run the same test queries used in Phase 5 through the hybrid pipeline and compare relevance/quality of results.
- Confirm duplicates across sources are correctly merged or removed.

### Acceptance Criteria
- Test queries retrieve relevant evidence more reliably than vector-only retrieval.
- Retrieval confidence and duplicate-handling behave as expected on the test set.

---

## Phase 7 — AI Orchestrator & Intent Detection

### Objective
Create the central intelligence layer that decides how a user query should be handled.

### Scope
Support intents such as:
- General BIS question
- Standard recommendation
- Certification guidance
- QCO/compliance question
- Laboratory search
- Hallmarking guidance
- Consumer service question
- Other supported BIS services

Include:
- Intent detection
- Query understanding
- Query rewriting
- Retrieval planning
- Tool selection
- Context construction

### Out of Scope
- Full implementation of each downstream service (Phases 8–11)
- Evidence/citation validation logic (Phase 12)

### Tasks
1. Define the intent taxonomy based on the supported intents above.
2. Implement intent detection.
3. Implement query understanding/rewriting.
4. Implement retrieval planning logic that selects retrieval strategy (from Phase 6) per intent.
5. Implement tool/service selection logic (stubs for services not yet built).
6. Implement context construction for downstream generation.
7. Test routing against representative queries covering each intent.

### Deliverables
- Intent taxonomy documentation
- Intent detection module
- Query rewriting module
- Retrieval planning/tool-selection logic
- Context construction module
- Routing test results

### Dependencies
- Phase 6 (hybrid retrieval)

### Verification
- Submit representative test queries for each supported intent and confirm correct routing.
- Confirm queries needing clarification are flagged appropriately (without implementing full downstream logic).

### Acceptance Criteria
- Representative test queries are correctly routed to the appropriate retrieval/service path.
- Each defined intent has a corresponding, testable routing behavior.

---

## Phase 8 — Product Classification & Standard Recommendation

### Objective
Allow users to describe a product naturally and receive relevant Indian Standard recommendations.

### Scope
Flow: Product description → Product understanding → Product classification → Candidate standards → Evidence retrieval → Relevance evaluation → Recommendation → Explanation → Sources

Include:
- Clarifying questions when necessary
- Candidate standard retrieval
- Relevance scoring
- Evidence-based recommendation
- Uncertainty handling

The AI must not confidently claim that a standard applies when available evidence is insufficient.

### Out of Scope
- Certification/QCO determination (Phase 9)
- Laboratory matching (Phase 10)

### Tasks
1. Implement product description understanding.
2. Implement product classification logic.
3. Implement candidate standard retrieval using Phase 6/7 infrastructure.
4. Implement relevance scoring for candidates.
5. Implement clarifying-question logic for ambiguous descriptions.
6. Implement evidence-based recommendation generation with explanation and sources.
7. Implement uncertainty handling for low-confidence cases.
8. Test against a representative set of product descriptions.

### Deliverables
- Product classification module
- Standard recommendation module with explanation and sources
- Clarifying-question logic
- Uncertainty-handling logic
- Test results for representative product descriptions

### Dependencies
- Phase 7 (orchestrator routing to this service)
- Phase 6 (retrieval)

### Verification
- Submit representative product descriptions and confirm recommendations are explainable and evidence-backed.
- Submit ambiguous/insufficient-evidence cases and confirm the system asks clarifying questions or expresses uncertainty rather than guessing.

### Acceptance Criteria
- Representative product descriptions produce explainable standard recommendations with evidence.
- Insufficient-evidence cases are handled with uncertainty, not false confidence.

---

## Phase 9 — Certification, QCO & Compliance Intelligence

### Objective
Determine applicable certification and regulatory information.

### Scope
- Certification scheme information
- QCO lookup
- Mandatory vs. voluntary distinction
- Product applicability
- Required documentation
- Testing requirements
- Application/licensing guidance
- Compliance workflow
- Effective-date/source-date awareness

Must clearly distinguish "Which Indian Standard may apply?" from "Is BIS certification legally mandatory?" and must not provide unsupported legal conclusions.

### Out of Scope
- Laboratory search (Phase 10)
- Hallmarking/consumer services (Phase 11)

### Tasks
1. Implement QCO lookup logic.
2. Implement mandatory-vs-voluntary distinction logic.
3. Implement product applicability checks.
4. Implement required-documentation and application/licensing guidance retrieval.
5. Implement compliance workflow explanation generation.
6. Implement effective-date/source-date awareness (surfacing when information may be outdated).
7. Test against representative compliance scenarios.

### Deliverables
- QCO/certification lookup module
- Compliance workflow guidance module
- Effective-date awareness logic
- Test results for representative compliance scenarios

### Dependencies
- Phase 7 (orchestrator routing)
- Phase 6 (retrieval)
- Phase 8 (standard identification, where compliance questions build on a recommended standard)

### Verification
- Submit representative compliance scenarios and confirm evidence-backed guidance is produced.
- Confirm the distinction between standard applicability and mandatory certification is clearly communicated.
- Confirm uncertain/outdated information is flagged.

### Acceptance Criteria
- Representative compliance scenarios produce evidence-backed guidance.
- Uncertainty and source-date limitations are clearly communicated.
- No unsupported legal conclusions are produced.

---

## Phase 10 — Laboratory & Testing Intelligence

### Objective
Help users identify relevant testing requirements and laboratories.

### Scope
- Testing requirement retrieval
- Laboratory search
- Standard-to-lab mapping where available
- Laboratory metadata
- Location/filtering if supported
- Source references
- Availability/data freshness indicators where applicable

### Out of Scope
- Hallmarking/consumer services (Phase 11)

### Tasks
1. Implement testing-requirement retrieval tied to identified standards/QCOs.
2. Implement laboratory search using laboratory metadata (Phase 3 schema).
3. Implement standard-to-lab mapping where source data supports it.
4. Implement location/filtering options if supported by available data.
5. Ensure all results carry source references and freshness indicators.
6. Test against representative testing/laboratory queries.

### Deliverables
- Testing-requirement retrieval module
- Laboratory search module
- Standard-to-lab mapping (where available)
- Test results for representative queries

### Dependencies
- Phase 7 (orchestrator routing)
- Phase 6 (retrieval)
- Phase 3 (laboratory metadata schema)

### Verification
- Submit representative "where can I get this tested" queries and confirm evidence-backed, source-referenced results.

### Acceptance Criteria
- A user can ask where a relevant test can be performed and receive evidence-backed results.

---

## Phase 11 — Hallmarking & Consumer Services

### Objective
Add consumer-facing BIS services.

### Scope
- Hallmarking guidance
- HUID-related information
- Consumer queries
- BIS service guidance
- Complaint/service navigation where supported
- Consumer-friendly explanations

### Out of Scope
- Any new certification/QCO logic beyond what Phase 9 already provides (this phase reuses/exposes it in consumer-friendly form)

### Tasks
1. Implement hallmarking guidance retrieval.
2. Implement HUID-related information retrieval.
3. Implement general consumer-query handling routed via Phase 7.
4. Implement complaint/service navigation guidance where supported by available sources.
5. Ensure responses use consumer-friendly, plain-language explanations.
6. Test against representative consumer-oriented questions.

### Deliverables
- Hallmarking/HUID guidance module
- Consumer service guidance module
- Test results for representative consumer questions

### Dependencies
- Phase 7 (orchestrator routing)
- Phase 6 (retrieval)

### Verification
- Submit representative consumer-oriented BIS questions and confirm understandable, source-backed responses.

### Acceptance Criteria
- Consumer-oriented BIS questions receive understandable, source-backed responses.

---

## Phase 12 — Evidence, Citations & Hallucination Controls

### Objective
Make trust and traceability a core part of every answer.

### Scope
- Source attribution
- Document references
- Clause/page references where available
- Citation validation
- Evidence-to-answer checking
- Unsupported-claim detection
- Confidence indicators
- "Insufficient information" handling
- Source freshness information

Core rule: if the system cannot support an important claim with retrieved evidence, it must not present that claim as established fact.

### Out of Scope
- New retrieval or intent features (this phase strengthens existing outputs from Phases 5–11)

### Tasks
1. Implement consistent source attribution formatting across all response types.
2. Implement clause/page-level references where source data supports it.
3. Implement citation validation (citations must map to actually retrieved evidence).
4. Implement evidence-to-answer checking (flag claims not backed by retrieved evidence).
5. Implement confidence indicators surfaced to the user.
6. Implement "insufficient information" responses for unsupported queries.
7. Implement source freshness display.
8. Test with deliberately difficult/unsupported questions across all prior feature phases.

### Deliverables
- Citation/attribution module used across Phases 8–11 outputs
- Evidence-to-answer / unsupported-claim detection logic
- Confidence indicator implementation
- "Insufficient information" handling logic
- Test results for deliberately difficult questions

### Dependencies
- Phases 5–11 (all retrieval and feature outputs this phase validates)

### Verification
- Run deliberately difficult/edge-case questions through the system and confirm it does not invent unsupported information.
- Confirm citations correctly map to retrieved evidence.

### Acceptance Criteria
- Deliberately difficult test questions result in the system refusing to invent unsupported information.
- All feature responses (Phases 8–11) carry proper source attribution and confidence/insufficiency indicators where applicable.

---

## Phase 13 — Full Frontend Integration

### Objective
Connect the completed intelligence backend to the production-style frontend.

### Scope
- Real chat (replacing Phase 1 mock data)
- Streaming/loading behavior if supported
- Search (real)
- Standard recommendation UI
- Certification/QCO UI
- Laboratory results UI
- Hallmarking flows UI
- Source/citation display
- Conversation history if required
- Error recovery
- Feedback mechanisms

### Out of Scope
- New backend intelligence features (all should already exist from Phases 7–12)
- Authentication/security hardening (Phase 14)

### Tasks
1. Replace mock chat/search data with real backend calls.
2. Implement streaming/loading behavior if the backend supports it.
3. Build UI for standard recommendations, certification/QCO results, laboratory results, and hallmarking flows.
4. Implement source/citation display in the UI.
5. Implement conversation history if required by confirmed requirements.
6. Implement error recovery flows in the UI.
7. Implement user feedback mechanisms (e.g., thumbs up/down on answers).
8. Test complete end-to-end workflows through the UI.

### Deliverables
- Fully integrated frontend using real backend/AI responses
- UI for each major feature (recommendation, certification/QCO, laboratory, hallmarking)
- Citation/source display in the UI
- Error recovery and feedback mechanisms

### Dependencies
- Phase 1 (frontend shell)
- Phases 7–12 (backend intelligence and evidence controls)

### Verification
- Manually complete each major end-to-end workflow through the frontend only.
- Confirm citations, confidence indicators, and error states display correctly in the UI.

### Acceptance Criteria
- A user can complete the major end-to-end workflows entirely through the frontend.

---

## Phase 14 — Authentication, Security & Privacy

### Objective
Secure the application before wider testing/deployment.

### Scope
- Authentication if required
- Authorization
- API security
- Input validation (hardening beyond Phase 2 basics)
- Secret management
- Rate limiting where appropriate
- Sensitive-data handling
- Logging controls
- Secure error messages
- Dependency/security checks

### Out of Scope
- New feature functionality

### Tasks
1. Implement authentication if confirmed as required.
2. Implement authorization rules for protected resources/endpoints.
3. Harden API security (headers, CORS, etc. as applicable).
4. Strengthen input validation across all endpoints.
5. Implement/verify secret management practices.
6. Implement rate limiting where appropriate.
7. Review and restrict sensitive-data logging.
8. Ensure error messages returned to clients do not leak sensitive internals.
9. Run dependency/security checks.

### Deliverables
- Authentication/authorization implementation (if required)
- Hardened API security configuration
- Secret management verification
- Rate limiting implementation
- Security check results

### Dependencies
- Phase 13 (full application to secure)

### Verification
- Run security checks (dependency scanning, basic penetration-style checks) and review results.
- Inspect logs and source code for exposed secrets.
- Attempt unauthorized access to protected resources and confirm it is blocked.

### Acceptance Criteria
- Security checks pass.
- Secrets are not exposed in source code or logs.

---

## Phase 15 — Testing & Evaluation

### Objective
Evaluate the system systematically.

### Scope
- Unit tests
- Integration tests
- API tests
- Retrieval evaluation
- RAG evaluation
- Intent classification evaluation
- Standard recommendation evaluation
- Compliance/QCO evaluation
- Citation validation
- Frontend testing
- Error/edge-case testing
- Regression testing

Create a representative evaluation dataset covering: easy questions, ambiguous questions, multi-intent questions, product descriptions, certification questions, QCO questions, laboratory questions, hallmarking questions, unsupported questions.

### Out of Scope
- New feature development

### Tasks
1. Build the representative evaluation dataset covering all listed categories.
2. Write/expand unit tests across backend modules.
3. Write/expand integration and API tests.
4. Run retrieval and RAG evaluation against the dataset.
5. Evaluate intent classification accuracy.
6. Evaluate standard recommendation quality.
7. Evaluate compliance/QCO guidance quality.
8. Validate citations against the dataset.
9. Run frontend tests.
10. Run error/edge-case and regression tests.
11. Compile measurable evaluation results.

### Deliverables
- Evaluation dataset
- Unit/integration/API test suites
- Evaluation results/report across all listed dimensions
- Regression test suite

### Dependencies
- Phase 14 (secured, feature-complete application)

### Verification
- Run the full test and evaluation suite and review results.

### Acceptance Criteria
- The project has measurable evaluation results instead of relying only on manual demonstrations.

---

## Phase 16 — Performance, Reliability & Observability

### Objective
Make the application stable enough for real-world demonstration and future scaling.

### Scope
- Response-time analysis
- Retrieval performance
- Caching where appropriate
- Database optimization
- API reliability
- Error monitoring
- Structured logs
- AI usage/cost monitoring
- Retrieval metrics
- Failure tracking

### Out of Scope
- New feature development

### Tasks
1. Measure and analyze response times across major workflows.
2. Analyze and optimize retrieval performance.
3. Implement caching where it meaningfully improves performance.
4. Optimize database queries/indexes as needed.
5. Improve API reliability based on findings from Phase 15 testing.
6. Implement error monitoring.
7. Implement structured logging.
8. Implement AI usage/cost monitoring.
9. Implement retrieval metrics tracking.
10. Implement failure tracking.

### Deliverables
- Performance analysis report
- Caching implementation (where applicable)
- Monitoring/observability setup (errors, structured logs, AI usage/cost, retrieval metrics, failures)

### Dependencies
- Phase 15 (testing/evaluation results identifying bottlenecks)

### Verification
- Review monitoring dashboards/logs after running representative workloads.
- Confirm previously identified bottlenecks are measurably improved.

### Acceptance Criteria
- Major bottlenecks and failure modes are identified and addressed.

---

## Phase 17 — Deployment & Production Readiness

### Objective
Prepare the system for deployment.

### Scope
- Production configuration
- Environment variables
- Build process
- Database deployment
- Backend deployment
- Frontend deployment
- Domain/configuration if required
- Health checks
- Logging
- Monitoring
- Backup/recovery strategy where applicable

### Out of Scope
- New feature development

### Tasks
1. Define production configuration and environment variables.
2. Set up build processes for frontend and backend.
3. Deploy the database.
4. Deploy the backend.
5. Deploy the frontend.
6. Configure domain/routing if required.
7. Verify health checks in the production environment.
8. Verify logging and monitoring in the production environment.
9. Define/implement a backup/recovery strategy where applicable.

### Deliverables
- Deployed database, backend, and frontend
- Production configuration documentation
- Verified health checks, logging, and monitoring in production
- Backup/recovery strategy documentation

### Dependencies
- Phase 16 (performance/reliability/observability)

### Verification
- Run the major MVP workflows against the deployed environment.
- Confirm health checks, logging, and monitoring work in production.

### Acceptance Criteria
- A clean deployment successfully runs the major MVP workflows.

---

## Phase 18 — SIH Demo & Final Polish

### Objective
Prepare the project for the Smart India Hackathon demonstration.

### Scope
Focus on the strongest end-to-end experience:

User describes product → AI understands product → Identifies applicable standard → Checks QCO/regulatory status → Determines certification path → Identifies testing requirements → Finds relevant laboratory → Produces answer → Shows evidence and sources

Include:
- Demo dataset
- Demo scenarios
- UI polish
- Error handling
- Performance improvements
- Presentation-ready dashboard
- Demo script
- Backup/fallback demo data
- Final documentation

### Out of Scope
- New core features not already built in Phases 1–17

### Tasks
1. Curate a demo dataset covering the flagship end-to-end scenario.
2. Define and rehearse demo scenarios.
3. Apply final UI polish.
4. Harden error handling for demo-critical paths.
5. Apply any final performance improvements needed for smooth demo playback.
6. Build a presentation-ready dashboard view if applicable.
7. Write a demo script.
8. Prepare backup/fallback demo data in case of live failures.
9. Finalize project documentation.

### Deliverables
- Demo dataset and scenarios
- Polished UI for the demo path
- Demo script
- Backup/fallback demo data
- Final project documentation

### Dependencies
- Phase 17 (deployed, production-ready system)

### Verification
- Run the complete demo flow end to end multiple times, including with backup data, and confirm reliability.

### Acceptance Criteria
- The complete demo flow works reliably from beginning to end.

---

*End of Phases.md. Do not implement any application functionality based solely on this file — implementation begins only when explicitly instructed, phase by phase, per the process defined above.*
