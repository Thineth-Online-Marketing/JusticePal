# JusticePal — Project Completion Plan

> Instructions for agents: work through Parts in order (Part 1 → Part 4). 
> Within Part 1, go feature by feature — for each one, check the actual code, 
> set its Status to Done / Partial / Missing, and if Partial or Missing, 
> implement it before moving to the next row. Stop and produce an Artifact 
> after each feature for human review. Do not skip ahead to the next Part 
> until all rows in the current Part are Done.

---

## Part 1 — Feature audit and completion

| # | Feature | Module owner | Status | Notes |
|---|---|---|---|---|
| 1 | AI case-intake form (NLP case analysis) | AI Core | Not checked | |
| 2 | Lawyer matching algorithm | AI Core | Not checked | |
| 3 | LLM + Pinecone vector DB integration returns real matches (not stub data) | AI Core | Not checked | |
| 4 | RAG pipeline pulls from a real knowledge base | Knowledge Base | Not checked | |
| 5 | AI Legal FAQ chat UI wired to ai_service, response time under ~5s | Knowledge Base | Not checked | |
| 6 | Sinhala UI strings | Frontend | Not checked | Explicit objective in proposal — easy to miss |
| 7 | Sinhala AI responses (chatbot + matching) | AI Core / Knowledge Base | Not checked | |
| 8 | Lawyer self-registration form | Frontend | Not checked | |
| 9 | Admin verification workflow (approve/reject lawyer) | Backend / Integration | Not checked | |
| 10 | Google Calendar integration creates real events | Backend / Integration | Not checked | |
| 11 | Payment gateway (Stripe or PayHere) processes a real test transaction | Backend / Integration | Not checked | |
| 12 | Video consultation session (WebRTC or Zoom SDK) — two browsers can join | Case Management / QA | Not checked | |
| 13 | AI document drafting feature | Backend / Integration | Not checked | |
| 14 | Secure file upload / case file storage | Case Management / QA | Done | Implemented secure Firebase Storage integration + PostgreSQL metadata sync in Express backend + active document tab upload/download interface in consultation room |
| 15 | Real-time notifications (booking, payment, meeting reminders) | Case Management / QA | Not checked | |
| 16 | Admin dashboard (user mgmt, lawyer verification, basic analytics) | Backend / Integration | Not checked | |

---

## Part 2 — End-to-end testing

| # | Test | Status | Notes |
|---|---|---|---|
| 1 | Full client journey: sign up → describe case → get matched → book → pay → join video call | Not checked | |
| 2 | Full lawyer journey: register → get verified → accept booking → access case file | Not checked | |
| 3 | Auth edge cases: wrong password, expired token, role-based access enforced (client can't reach admin routes) | Not checked | |
| 4 | `.env` / API keys are not committed to the repo; `.gitignore` actually excludes them | Not checked | |
| 5 | Mobile/responsive check: homepage, search, booking flow | Not checked | |

---

## Part 3 — Deployment readiness

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Vercel frontend points at the live backend, not localhost | Not checked | |
| 2 | Render backend and AI microservice are both up and not cold-starting badly | Not checked | |
| 3 | Database seeded with realistic demo data (verified lawyers, a sample case, a sample booking) | Not checked | |
| 4 | Backup demo video recorded in case live demo fails | Not checked | |

---

## Part 4 — Scope check before presenting

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Decide whether to present full PCI DSS compliance or scope it down to "test-mode payment integration" for the demo | Not checked | Flag this decision with supervisor — don't over-claim in front of evaluators |
| 2 | Decide whether to present 99.9% uptime claim as-is or soften it to a realistic SLA for a student project | Not checked | |
| 3 | Rehearse answers on ethical considerations and feasibility sections — these tend to get probed in viva | Not checked | |