# Dheeraj AI — Personal AI Representative

An AI persona that you can **call**, **chat with**, and use to **book an interview** — end to end, with no human in the loop.

> Built for the Scaler AI Engineer Screening Assignment.

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTIONS                             │
├─────────────────────────────┬────────────────────────────────────────┤
│        📞 VOICE             │              💬 CHAT                    │
│   (Phone Call via Vapi)     │     (Web UI at public URL)             │
└─────────────┬───────────────┴──────────────────┬─────────────────────┘
              │                                  │
              ▼                                  ▼
┌─────────────────────────┐     ┌───────────────────────────────────────┐
│       VAPI PLATFORM      │     │        NEXT.JS APP (Vercel)           │
│                          │     │                                       │
│  • Deepgram STT          │     │  /api/chat  → RAG Pipeline → LLM     │
│  • Groq LLM (70B)       │     │  /api/vapi  → Webhook for tools       │
│  • ElevenLabs TTS        │     │  /          → Chat UI (React)         │
│  • Barge-in handling     │     │                                       │
└─────────────┬────────────┘     └───────────────────┬───────────────────┘
              │                                      │
              │    Server URL (tool calls)            │
              └──────────────────────────────────────►│
                                                     │
              ┌──────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        RAG PIPELINE                                   │
│                                                                       │
│  User Query → Upstash Vector (semantic search) → Top-5 chunks        │
│            → Augmented Prompt → Llama 3.3 70B (OpenRouter) → Answer   │
│                                                                       │
│  Knowledge Base:                                                      │
│    • resume.md (education, experience, skills, projects)              │
│    • repos/*.md (5 GitHub repo summaries with tech stacks,            │
│      design tradeoffs, architecture, what I'd do differently)         │
└─────────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CALENDAR BOOKING                                  │
│                                                                       │
│  Cal.com API → Check availability → Propose slots → Book meeting     │
│  (Connected to real Google Calendar)                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 Live Demo

| Channel | Link |
|---------|------|
| **Chat** | [Deployed Vercel URL] |
| **Voice** | Call: [Phone Number from Vapi] |
| **Book Interview** | https://cal.com/dheeraj-talapala-uzhigt/30min |

## ✨ Features

### Part A: Voice Agent
- Phone number via Vapi with inbound call handling
- Introduces as AI representative, answers background/skills/fit questions
- Handles interruptions and barge-in natively (Vapi + Deepgram)
- Graceful recovery when it doesn't know something
- Real calendar booking via Cal.com during the call
- First response latency <2s (Groq + Deepgram)

### Part B: Chat Interface
- RAG-grounded over actual resume and GitHub repos (Upstash Vector)
- Semantic search retrieval — no hardcoded answers
- Knows all 12 public repos: tech stacks, purpose, design tradeoffs, improvements
- Accurate resume details: education, experience, projects, skills
- Calendar booking directly from chat
- Adversarial prompt injection resistance + honest "I don't know" responses
- Streaming responses for low perceived latency

### RAG Pipeline
- **Vector DB:** Upstash Vector (BAAI/bge-base-en-v1.5 embeddings)
- **Chunking:** Section-based splitting by `##` headings (~50-100 chunks)
- **Retrieval:** Top-5 semantic search with relevance scoring
- **Generation:** Llama 3.3 70B via OpenRouter (free tier)
- **Fallback:** Keyword-based search if vector DB unavailable

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| LLM | Meta Llama 3.3 70B (via OpenRouter) |
| Vector DB | Upstash Vector (BAAI/bge-base-en-v1.5) |
| Voice | Vapi (Deepgram STT + Groq LLM + ElevenLabs TTS) |
| Calendar | Cal.com (API + real Google Calendar integration) |
| Hosting | Vercel (serverless) |
| AI SDK | Vercel AI SDK (@ai-sdk/openai) |

## 💰 Cost Breakdown

| Service | Cost |
|---------|------|
| **Per voice call** (~3 min avg) | ~$0.15 (Vapi at $0.05/min) |
| **Per chat session** | $0 (Llama 3.3 70B free on OpenRouter + Upstash free tier) |
| **Hosting (Vercel)** | $0 (free tier) |
| **Vector DB (Upstash)** | $0 (free tier: 10K vectors, 10K queries/day) |
| **Calendar (Cal.com)** | $0 (free tier) |
| **Voice number** | ~$1/month (Vapi) |
| **7-day total estimate** | ~$5–10 depending on call volume |

## 📦 Setup Instructions

### Prerequisites
- Node.js 18+
- npm
- Accounts: OpenRouter, Upstash, Cal.com, Vapi

### 1. Clone & Install

```bash
git clone https://github.com/Dheeraj2k4/ai-persona.git
cd ai-persona
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
# OpenRouter (free) - https://openrouter.ai/keys
OPENROUTER_API_KEY=your_key_here

# Upstash Vector - https://console.upstash.com
UPSTASH_VECTOR_REST_URL=your_url_here
UPSTASH_VECTOR_REST_TOKEN=your_token_here

# Cal.com - https://cal.com/settings/developer/api-keys
CAL_COM_API_KEY=your_key_here
CAL_EVENT_TYPE_ID=your_event_id
```

### 3. Ingest Knowledge Base

```bash
npm run ingest
```

This chunks all documents in `src/lib/knowledge/` and pushes them to Upstash Vector.

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### 5. Deploy to Vercel

```bash
npx vercel --prod
```

Set environment variables in Vercel dashboard.

### 6. Connect Voice Agent

1. Create assistant in [Vapi dashboard](https://dashboard.vapi.ai)
2. Set Server URL to `https://your-domain.vercel.app/api/vapi`
3. Buy a phone number and assign to assistant

## 📂 Project Structure

```
ai-persona/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main chat interface
│   │   ├── api/chat/route.ts     # Chat API (RAG + streaming)
│   │   └── api/vapi/route.ts     # Vapi webhook (voice tools)
│   ├── components/               # UI components
│   ├── lib/
│   │   ├── knowledge/
│   │   │   ├── resume.md         # Full resume data
│   │   │   └── repos/*.md        # GitHub repo summaries
│   │   ├── retriever.ts          # RAG retrieval (vector + fallback)
│   │   ├── vector.ts             # Upstash Vector client
│   │   └── prompts.ts            # System prompts (chat + voice)
│   └── ...
├── scripts/
│   └── ingest.ts                 # Vector DB ingestion script
├── .env.local.example            # Environment template
└── package.json
```

## 🔒 Safety & Guardrails

- System prompt hardened against prompt injection attempts
- Never reveals system instructions or breaks character
- Only answers from retrieved context — admits gaps honestly
- Refuses off-topic, harmful, or manipulation attempts
- No hardcoded answers — everything retrieved dynamically via RAG

## 📊 Eval Methodology

See `EVALS.pdf` for the full evaluation report covering:
- Voice: first-response latency, transcription accuracy, booking success rate
- Chat: hallucination rate, retrieval precision/recall on golden Q&A set
- 3 failure modes discovered + root cause + fix
- Key tradeoff: cost vs latency (chose Groq for voice, OpenRouter for chat)
- What I'd build with 2 more weeks

---

Built by [Dheeraj Talapagala](https://github.com/Dheeraj2k4)
