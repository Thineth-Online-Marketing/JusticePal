# JusticePal

JusticePal is an AI-powered legal assistance platform for Sri Lanka.

## Tech Stack
* **Frontend**: Next.js (App Router), Tailwind CSS, Lucide React
* **Backend**: Node.js/Express with TypeScript, Mongoose for MongoDB
* **Database**: MongoDB & Pinecone (for Vector storage)
* **AI Engine**: Python FastAPI microservice using LangChain, RAG architecture, Google Gemini API
* **Auth**: Firebase Authentication

## Project Structure
* `/frontend`: Next.js application
* `/backend`: Node.js Express server acting as the main API
* `/ai_service`: Python FastAPI microservice for LLM interaction and Legal FAQ logic
* `docker-compose.yml`: Orchestrates local development containers

## Running Locally

To run the entire suite, ensure Docker is installed and run:
```bash
docker compose up -d --build
```

### Manual Run
Alternatively, you can start the modules individually:

- **Frontend**:
```bash
cd frontend
npm run dev
```

- **Backend**:
```bash
cd backend
npm run dev
```

- **AI Service**:
```bash
cd ai_service
uvicorn main:app --reload
```
.
