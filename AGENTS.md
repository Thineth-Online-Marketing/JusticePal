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
* **Case File Routes & Controller**:
  * [`backend/src/routes/caseFileRoutes.ts`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/backend/src/routes/caseFileRoutes.ts)
  * [`backend/src/controllers/caseFileController.ts`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/backend/src/controllers/caseFileController.ts)

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
4. **Chat Message Sending (Optimistic UI)**:
   * Messages are added to local state immediately (optimistic copy) so they appear in the UI without waiting for a server round-trip.
   * If socket is connected and `appointmentId` exists, the message is also emitted via `send_message` for persistence and broadcast.
   * The `new_message` socket handler replaces the optimistic copy when the server echo arrives (matched by `senderRole` + `text` + `id.startsWith("optimistic-")`), preventing duplicates.
   * If no `appointmentId` (demo mode), messages are shown locally only — no server call.
5. **AI Summary Engine**:
   * Powered by Google Gemini (`@google/generative-ai` with `gemini-1.5-flash`).
   * Fetches room chat history and parses it alongside the lawyer's notes to return a structured JSON summary (case details, discussion summary, key outcomes, next steps).

### Case File Upload & Download Architecture
> **Critical**: Firebase Storage does NOT allow browser-direct PUT/GET due to CORS restrictions in development. All file operations MUST be proxied through the Express backend using the Firebase Admin SDK.

* **Upload flow** (`POST /api/case-files/upload`):
  * Frontend sends file as `multipart/form-data` (do NOT set `Content-Type` header — browser sets boundary automatically).
  * Backend uses `multer` (memory storage, 10MB limit) to receive the file buffer.
  * `uploadCaseFileMultipart` controller uploads the buffer to Firebase Storage via Admin SDK, stores the raw storage path (`cases/<appointmentId>/<timestamp_filename>`) as `url` in the `CaseFile` DB record.
  * Falls back to base64 `data:` URL if Firebase Storage is unavailable.
* **Download flow** (`GET /api/case-files/download/:fileId`):
  * Frontend sends a fetch with auth token — **never use `window.open(doc.url)` directly** (the `url` field is a raw path, not a public URL).
  * `proxyDownloadFile` controller verifies auth, checks if file exists in storage, pipes the Firebase Storage read stream directly to the HTTP response with `Content-Disposition: attachment`.
  * Frontend converts the streamed response to a `Blob`, creates an `objectURL`, and clicks a hidden `<a download>` element.
  * Legacy `data:` URLs (base64 fallback) are handled by the same controller, decoded from the DB and sent as a buffer.

### Key Elements of the Consultation Room
1. **Role-Based Layouts**:
   * **Lawyer view**: Uses the standard `LawyerConsultationHeader` component (defined at the bottom of `page.tsx`) — pixel-perfect match to the `lawyer-dashboard/layout.tsx` header including nav links, search bar, notification bell, and profile dropdown. **No separate left sidebar.**
   * **Client view**: Uses the top `ClientNavbar` and takes up the full width for the conference window.
2. **Secure Video Stream Panel**:
   * Large container displaying the remote participant (derived from real user profiles).
   * Floating self-preview window in the corner.
   * Soundwave sound bars highlighting the active speaker.
3. **Collapsible Workspace Sidebar** (right panel):
   * **Chat Tab**: Real-time communication feed with timestamped bubbles, text input with typing indicator, and case file updates.
   * **People Tab**: List of active conference members.
   * **Files Tab**: Case file repository with upload (Add File button) and download (⬇ button per file) support.
4. **AI Summary**: Lawyer workspace includes a notes pad and a trigger button to compile discussions using Gemini.

### Navigation Entry Points
* **Client Dashboard**: Queries upcoming scheduled/confirmed appointments dynamically. "Join Video Call" routes to `/consultation?role=client&appointmentId=<id>` (falls back to demo room without ID).
* **Lawyer Dashboard Schedule**: Queries upcoming scheduled/confirmed appointments dynamically. Clicking the schedule card routes to `/consultation?role=lawyer&appointmentId=<id>`.

### Known Gotchas
* **Firebase Storage CORS**: Browser cannot PUT or GET directly from `storage.googleapis.com`. Always route through the Express backend using Admin SDK (`proxyDownloadFile` / `uploadCaseFileMultipart`).
* **Multer dependency**: `multer` and `@types/multer` must be installed in `/backend` for multipart upload to work.
* **`doc.url` is a storage path, not a URL**: The `url` field in the `CaseFile` DB record stores a raw Firebase Storage object path (e.g. `cases/apptId/filename.pdf`). Never pass it directly to `window.open()` or `<a href>`. Always call `/api/case-files/download/:fileId` to get the actual content.
* **Optimistic chat messages**: The `id` of optimistic messages starts with `"optimistic-"`. The `new_message` socket handler uses this prefix to detect and replace them with the persisted server copy.


---

## Calendar Pages & Dashboard Navigation Features (July 2026)

We implemented client calendar views, resolved dashboard calendar redirect navigation routes, and fixed required dev dependencies.

### Key Changes
1. **Client Calendar Page**:
   * **New Page**: Created [`frontend/src/app/(client)/client-dashboard/calendar/page.tsx`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/frontend/src/app/(client)/client-dashboard/calendar/page.tsx) to provide a monthly calendar interface for clients.
   * **Features**: Displays client appointments with interactive status indicators (scheduled, confirmed, completed, cancelled, pending), a sidebar showing upcoming appointments, and a **"Join Video Call"** CTA matching the consultation status context.
2. **Dashboard Navigation Fixes**:
   * **Lawyer Dashboard**: Wired the "View Full Calendar" button to route correctly to `/lawyer-dashboard/calendar`.
   * **Client Dashboard**: Wired the "View Calendar" button to route correctly to `/client-dashboard/calendar`.
3. **Backend Environment & Dependencies**:
   * Fixed critical missing dependencies (`pdfkit`, `@types/pdfkit`) required for generating documents in backend controllers.
   * Google OAuth integration requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` setup in the backend `.env`.

---

## Cal.com Integration & Backend Stability (August 2026)

We replaced the paid Google Calendar OAuth2 integration with Cal.com REST API v2 and resolved backend startup & database synchronization issues.

### Key Changes
1. **Cal.com Integration**:
   * **Backend Service & Controller**: Created [`backend/src/services/calComService.ts`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/backend/src/services/calComService.ts), [`backend/src/controllers/calComController.ts`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/backend/src/controllers/calComController.ts), and [`backend/src/routes/calComRoutes.ts`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/backend/src/routes/calComRoutes.ts) (`/api/cal-com/status`, `/api/cal-com/bookings`, `/api/cal-com/bookings/:uid/cancel`).
   * **Frontend Lawyer Calendar**: Updated [`frontend/src/app/lawyer-dashboard/calendar/page.tsx`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/frontend/src/app/lawyer-dashboard/calendar/page.tsx) to display Cal.com bookings and manage local schedule events.
   * **Configuration**: Set `CAL_COM_API_KEY` in `backend/.env`.
2. **Backend Startup & Database Fixes**:
   * **Lazy Stripe Client**: Converted Stripe initialization in [`backend/src/controllers/paymentController.ts`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/backend/src/controllers/paymentController.ts) to a lazy getter to prevent server crashes when `STRIPE_SECRET_KEY` is omitted.
   * **Prisma & DB Sync**: Added `DIRECT_URL` in `backend/.env` and synced database schema (`reminderSent` column on `Appointment` model) via `npx prisma db push`.
   * **Dependencies**: Installed `nodemailer` & `@types/nodemailer`.
3. **UI Enhancements**:
   * **User Guide Footer**: Added shared `Footer` component to [`frontend/src/app/(client)/guide/page.tsx`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePalNew/JusticePal-/frontend/src/app/(client)/guide/page.tsx) and removed bottom whitespace gaps.


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
