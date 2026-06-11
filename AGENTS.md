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

---

## Video Consultation Feature (June 2026)

We implemented a unified Video Consultation / Video Conferencing system.

### Core Component
* **Path**: [`frontend/src/app/consultation/page.tsx`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePal/JusticePal/frontend/src/app/consultation/page.tsx)
* **Design Pattern**:
  * Dual-perspective page that renders specialized layouts depending on the query parameter `?role=lawyer` or `?role=client`.
  * **Prerendering Rule**: Wrapped in a Next.js `<Suspense>` boundary to allow build-time optimization while using `useSearchParams`.

### Key Elements of the Consultation Room
1. **Role-Based Layouts**:
   * **Lawyer view**: Includes the lawyer dashboard sidebar navigation on the left, top header with details, and active consultation workspace in the middle.
   * **Client view**: Includes the top `ClientNavbar` and takes up the full width for the conference window.
2. **Secure Video Stream Panel**:
   * Large container displaying the remote participant (Sarah Chen for lawyers, Advocate Sarah Jenkins for clients).
   * Floating self-preview window in the corner.
   * Connection quality tags and End-to-End Encryption indicators.
   * Soundwave sound bars highlighting the active speaker.
3. **collapsible Workspace Sidebar**:
   * **Chat Tab**: Real-time communication feed with timestamped bubbles, text input, and mock file uploads.
   * **People Tab**: List of conference members, active organizer tags, and speaking status.
   * **Files Tab**: Legal document repository showing preview cards for case files (e.g. surveys, draft deeds).
4. **Lawyer Workspace Features**:
   * **Notes Scratchpad**: A textarea for lawyers to log details in real-time.
   * **AI Consultation Summary**: An analysis engine that outputs an executive summary, agreements reached, and actionable next steps.
5. **Interactive Simulation Hub**:
   * A footer control bar enabling real-time toggling of client/lawyer UI, camera feeds, speaking indicators, connection quality, and mock inbound messages for testing.

### Navigation Entry Points
* **Client Dashboard**: Clicking "Join Video Call" navigates to `/consultation?role=client`.
* **Lawyer Dashboard Schedule**: Clicking "Client Consultation: Sarah Chen" schedule row navigates to `/consultation?role=lawyer`.
* **Lawyer Calendar**: Clicking the Tuesday "Property Dispute Review" meeting block navigates to `/consultation?role=lawyer`.

---

## Style Guidelines

* **Colors**: Match the core system defined in [`frontend/src/app/globals.css`](file:///Users/harininandasena/Documents/SUSL%20ASSIGNMENTS/Capstone%20project/JusticePal/JusticePal/frontend/src/app/globals.css):
  * Navy Blue (Primary): `#1B3A6B`
  * Dark Navy: `#112549`
  * Orange Accent: `#F97316`
  * Light Background: `#F8FAFC`
  * Card BG: `#FFFFFF`
* **Icons**: Use the Lucide React library.
* **Component Styling**: Standardize layout wrappers, card shadows (`shadow-sm`, `border-gray-100`), and rounded borders (`rounded-2xl`, `rounded-3xl`).
