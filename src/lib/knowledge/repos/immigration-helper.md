# Immigration Helper – RAG Assistant

**Repository:** https://github.com/Dheeraj2k4/Immigration-Helper
**Primary Languages:** TypeScript (64%), Python (33%)
**Year:** 2026

## Purpose
Full-stack visa/immigration assistance platform with an AI chatbot that answers immigration queries using Retrieval-Augmented Generation. Features include live news feed, interactive checklists, and multi-language support (English, Spanish, Hindi, Telugu).

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + i18next (internationalization)
- **Backend:** Node.js + Express + TypeScript
- **RAG Service:** Python + FastAPI + LangChain + ChromaDB
- **LLM Providers:** Groq (recommended, free/fast), Ollama (local), OpenAI (paid)
- **Embeddings:** HuggingFace sentence-transformers (avoids API costs)

## Architecture
3-service microservices design:
1. **Client** (port 5173) — React SPA with Vite
2. **Server** (port 5000) — Express API handling auth, news, checklists
3. **RAG Service** (port 8000) — FastAPI with LangChain pipeline

Vector store built from markdown visa guide documents via `ingest_documents` script. Documents cover H1B, F1, UK, Canada, Australia visa processes.

## Design Tradeoffs
- **Multi-LLM support:** Supports 3 providers (Groq free/fast recommended, Ollama local for privacy, OpenAI for quality). Chose flexibility over simplicity.
- **HuggingFace embeddings over OpenAI:** Avoids per-token embedding costs. Slightly lower quality but free.
- **Markdown documents as source:** Easy to extend (just add .md files and re-ingest). Tradeoff: less structured than a database.
- **Microservices over monolith:** Better separation of concerns (Python ML tools vs TypeScript web). Tradeoff: more complex deployment.
- **ChromaDB over Pinecone:** Local, free, no cloud dependency. Tradeoff: no distributed scaling.

## What I'd Do Differently
- Add authentication and user-specific query history
- Use a more powerful embedding model (e.g., Cohere embed-v3) for better retrieval
- Add citation/source display in the chat UI
- Implement conversation memory for follow-up questions
- Deploy as a single Docker Compose setup for easier onboarding

## Key Features
- Natural language Q&A over immigration policies
- Live news filtering by country and category
- Interactive visa application checklists
- Multi-language support (EN/ES/HI/TE)
- Document ingestion pipeline for expanding knowledge base
