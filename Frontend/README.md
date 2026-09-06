# BIS Intelligent Assistant (BIS Sahayak) — Frontend

Web application client for the AI-Powered Intelligent Assistant for Indian Standards and BIS Services. Built with React 19, TypeScript, and Vite, styled with custom modular CSS adhering to official BIS / Government of India design aesthetics.

---

## Features (Phase 6 Implementation)

- **Conversational Assistant UI (`/assistant`)**:
  - Direct live communication with FastAPI backend (`POST /api/chat`).
  - Strict zero mock response policy in production.
  - Streaming-feel real-time interaction with loading indicator and duplicate submission prevention.
  - Interactive suggested query starters based on real SIH BIS problem statements.
  - Clarification card with direct prompt suggestions when queries are underspecified.
  - Qualitative confidence badges (`High`, `Medium`, `Low`) based on evidence grounding.
  - Extracted entity badges displaying identified Standards, Products, QCOs, and HUIDs.
  - Evidence point summary list detailing verified standard clauses and facts.
  - Clickable external source citations (`[View Source ↗]`) with secure `rel="noopener noreferrer"`.
  - Regulatory caveat and legal disclaimer banners.
  - Network error handling with retry functionality.
  - Session clear / reset capability.

---

## Technology Stack

- **Framework**: React 19 + Vite + TypeScript
- **Icons**: Lucide React
- **HTTP Client**: Native `fetch` with `AbortController` (35s timeout)
- **Testing**: Vitest + React Testing Library + jsdom + `@testing-library/jest-dom`

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- Running BIS backend on `http://127.0.0.1:8000`

### 2. Environment Variables
Create a `.env` file in `Frontend/`:
```bash
VITE_API_URL=http://127.0.0.1:8000
```

### 3. Installation
```bash
npm install
```

### 4. Development Server
```bash
npm run dev
```
Open `http://localhost:5173/assistant` in your browser.

### 5. Running Tests
```bash
npm test
```
Executes all 11 automated Vitest tests covering conversational UI workflows.

### 6. Production Build
```bash
npm run build
```
Type checks and bundles the client into `Frontend/dist/`.

---

## Component Architecture

```
Frontend/src/
├── components/
│   ├── ai/
│   │   ├── ChatMessage.tsx       # Main message component rendering answer & metadata
│   │   ├── ClarificationCard.tsx # Interactive clarifying question card
│   │   ├── EntityBadges.tsx      # Chips for Standards, Products, QCOs
│   │   ├── SourceList.tsx        # Verified citations with external links
│   │   └── WarningBanner.tsx     # Disclaimer and caveat alerts
│   └── common/
│       └── ConfidenceBadge.tsx   # Grounding confidence rating badge
├── pages/
│   └── Assistant.tsx             # Main conversational interface & session state
├── services/
│   └── aiService.ts              # Real API integration layer (POST /api/chat)
├── types/
│   └── ai.ts                     # TypeScript schemas matching Phase 5 ChatResponse
└── __tests__/
    ├── Assistant.test.tsx        # 11 unit & integration test scenarios
    └── setup.ts                  # jsdom & jest-dom setup
```
