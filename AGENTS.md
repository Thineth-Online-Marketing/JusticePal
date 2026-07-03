# JusticePal - Developer Log & Agent Memory

This file provides context and guidance for developers and AI agents working on the JusticePal platform.

---

## Project Overview

JusticePal is a legal assistance platform in Sri Lanka that connects clients with legal professionals.
* **Frontend**: Next.js (App Router, Tailwind CSS v4, TypeScript)
* **Backend**: Express.js (Node.js, TypeScript, Prisma ORM, PostgreSQL)

---

## Developer Commands

### Frontend (`/frontend`)
* Start local dev server: `npm run dev` (Runs on `http://localhost:3000` by default)
* Build application: `npm run build`
* Lint check: `npm run lint`

### Backend (`/backend`)
* Start local dev server: `npm run dev` (Runs on `http://localhost:5000` by default)
* Prisma database generate: `npx prisma generate`
* Prisma migration deploy: `npx prisma migrate deploy`
* Prisma db push (for syncing changes directly): `npx prisma db push`

---

## Video Consultation Feature (June-July 2026)

We implemented a unified, real-time Video Consultation / Video Conferencing system with a working database and message persistence backend.

### Core Components
* **Frontend Consultation Page**: [`frontend/src/app/consultation/page.tsx`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/frontend/src/app/consultation/page.tsx)
* **Backend Entry & Socket Server**: [`backend/src/index.ts`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/backend/src/index.ts)
* **Backend Database Schema**: [`backend/prisma/schema.prisma`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/backend/prisma/schema.prisma)
* **Backend Routes & Logic**: 
  * [`backend/src/routes/consultationRoutes.ts`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/backend/src/routes/consultationRoutes.ts)
  * [`backend/src/controllers/consultationController.ts`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/backend/src/controllers/consultationController.ts)
  * [`backend/src/services/consultationService.ts`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/backend/src/services/consultationService.ts)

### Design Pattern & Architecture
1. **Prerendering Rule**: The consultation page uses query params (`role`, `appointmentId`) and is wrapped in a Next.js `<Suspense>` boundary to allow build-time optimization while using `useSearchParams`.
2. **Database Models**:
   * `ConsultationRoom`: Stores metadata of the room, connected to `Appointment` via `appointmentId`. Tracks status (`waiting`, `active`, `ended`), join times, and AI generated summary.
   * `ConsultationMessage`: Stores messages with `senderUserId`, `senderRole`, and text.
3. **Real-time WebSockets (Socket.io)**:
   * Upgraded Express entry to use Node's `http.createServer()` hosting both the Express app and a Socket.io server.
   * Connection authentication middleware: Checks the Firebase ID token sent via `socket.handshake.auth.token` and queries the database user profile to set socket properties (`userId`, `userName`, `firebaseUid`).
   * Events:
     * `join_consultation` (`appointmentId`): Assigns socket to room `consultation:<appointmentId>` if access check passes, broadcasting `participant_joined`.
     * `send_message` (`appointmentId`, `text`): Persists message to `ConsultationMessage` and broadcasts `new_message` to everyone in the room.
     * `typing` (`appointmentId`, `isTyping`): Broadcasts `participant_typing` for visual typing indicators.
4. **AI Summary Engine**:
   * Powered by Google Gemini (`@google/generative-ai` with `gemini-1.5-flash`).
   * Fetches room chat history and parses it alongside the lawyer's notes to return a structured JSON summary (case details, discussion summary, key outcomes, next steps).

### Key Elements of the Consultation Room
1. **Role-Based Layouts**:
   * **Lawyer view**: Includes the lawyer dashboard sidebar navigation on the left, top header with details, and active consultation workspace in the middle.
   * **Client view**: Includes the top `ClientNavbar` and takes up the full width for the conference window.
2. **Secure Video Stream Panel**:
   * Large container displaying the remote participant (derived from real user profiles).
   * Floating self-preview window in the corner.
   * Soundwave sound bars highlighting the active speaker.
3. **Collapsible Workspace Sidebar**:
   * **Chat Tab**: Real-time communication feed with timestamped bubbles, text input with typing indicator, and case file updates.
   * **People Tab**: List of active conference members.
   * **Files Tab**: Case file repository.
4. **AI Summary**: Lawyer workspace includes a notes pad and a trigger button to compile discussions using Gemini.

### Navigation Entry Points
* **Client Dashboard**: Queries upcoming scheduled/confirmed appointments dynamically. "Join Video Call" routes to `/consultation?role=client&appointmentId=<id>` (falls back to demo room without ID).
* **Lawyer Dashboard Schedule**: Queries upcoming scheduled/confirmed appointments dynamically. Clicking the schedule card routes to `/consultation?role=lawyer&appointmentId=<id>`.

---

## Style Guidelines

* **Colors**: Match the core system defined in [`frontend/src/app/globals.css`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/frontend/src/app/globals.css):
  * Navy Blue (Primary): `#1B3A6B`
  * Dark Navy: `#112549`
  * Orange Accent: `#F97316`
  * Light Background: `#F8FAFC`
  * Card BG: `#FFFFFF`
* **Icons**: Use the Lucide React library.
* **Component Styling**: Standardize layout wrappers, card shadows (`shadow-sm`, `border-gray-100`), and rounded borders (`rounded-2xl`, `rounded-3xl`).
