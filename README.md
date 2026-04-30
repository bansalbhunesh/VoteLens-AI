# 🗳️ VoteLens AI

**An AI Election Mentor that Simulates, Explains, and Verifies the Indian Election Process.**

> Not a chatbot. An interactive learning experience for every citizen.

[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Deployed on Cloud Run](https://img.shields.io/badge/Deployed%20on-Cloud%20Run-4285F4?style=flat-square&logo=googlecloud)](https://cloud.google.com/run)

---

## 🎯 Chosen Vertical

**Election Process Education** — Create an assistant that helps users understand the election process, timelines, and steps in an interactive and easy-to-follow way.

---

## 💡 Approach & Logic

### The Problem
People don't struggle because election information is *unavailable* — they struggle because they feel **overwhelmed, intimidated, and confused**. Especially first-time voters, elderly users, and digitally inexperienced citizens.

### Our Solution
VoteLens AI is a **human-centered AI election experience** that goes beyond Q&A. It creates an immersive, emotionally intelligent learning journey using three pillars:

| Pillar | What It Does | Gemini Feature Used |
|--------|-------------|-------------------|
| **🗳️ Simulate** | Interactive virtual polling booth walkthrough with clickable EVM | Streaming generation |
| **🔍 Verify** | Fact-check election rumors and analyze voter documents | Google Search grounding + Multimodal vision |
| **💬 Explain** | Conversational AI mentor with voice support and emotional intelligence | Streaming chat + Web Speech API |

### Key Differentiator
**"Google Maps for voting"** — not "ChatGPT for elections." Users don't just get answers — they *experience* the voting process.

---

## ✨ Features

### 1. Interactive Voting Simulation (Killer Feature)
- Step-by-step walkthrough of the complete voting process (7 stages)
- **Clickable EVM** with candidate buttons, red indicator lights, and beep confirmation
- **VVPAT paper slip animation** (7-second display, auto-cut)
- AI-narrated descriptions for each step via Gemini streaming

### 2. Misinformation Verifier
- Paste any election claim or WhatsApp rumor
- AI fact-checks using **Google Search grounding** for real-time verification
- Returns verdict (✅ Verified / ⚠️ Partially True / ❌ False) with cited sources
- Upload screenshots for visual analysis

### 3. Document Analyzer
- Upload voter ID, election notice, polling slip, or booth photo
- **Gemini multimodal vision** analyzes and explains the document
- Provides actionable next steps

### 4. AI Election Mentor Chat
- Streaming conversational AI with full conversation memory
- **"Nervous First-Time Voter Mode"** — calmer, more reassuring, step-by-step guidance
- **Voice input** via Web Speech API (en-IN)
- **Text-to-speech** for AI responses
- Pre-built quick prompts for common scenarios

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│              Cloud Run                   │
│  ┌─────────────────────────────────────┐ │
│  │     Express.js Server               │ │
│  │  ┌──────────┐  ┌────────────────┐   │ │
│  │  │ API      │  │ Static Files   │   │ │
│  │  │ Routes   │  │ (React Build)  │   │ │
│  │  └────┬─────┘  └────────────────┘   │ │
│  └───────┼─────────────────────────────┘ │
│          │                               │
│     ┌────▼─────────┐                     │
│     │ Gemini 2.0   │                     │
│     │ Flash API    │                     │
│     │ • Chat       │                     │
│     │ • Vision     │                     │
│     │ • Grounding  │                     │
│     └──────────────┘                     │
└─────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite | UI framework |
| Styling | Tailwind CSS v4 | Design system |
| Animations | Framer Motion | Micro-interactions, page transitions |
| Backend | Express.js (Node 20) | API server, static file serving |
| AI | Gemini 2.0 Flash (`@google/genai`) | Chat, vision, grounding |
| Voice | Web Speech API | Browser-native STT/TTS |
| Deployment | Google Cloud Run + Docker | Serverless containers |
| Security | Helmet, express-rate-limit, CORS | Production hardening |

---

## 🔐 Google Services Used

1. **Google Gemini 2.0 Flash** — Core AI engine
   - Streaming text generation (chat, simulation narration)
   - Multimodal vision (document/image analysis)
   - Google Search grounding (fact-checking with live sources)
2. **Google Cloud Run** — Serverless container deployment
3. **Google Cloud Build** — Container image building

---

## 🚀 How to Run

### Prerequisites
- Node.js 20+
- A [Gemini API key](https://aistudio.google.com/apikey)

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/votelens-ai.git
cd votelens-ai

# Set up environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Install dependencies
npm install
cd client && npm install && cd ..

# Start development servers
npm run dev
```

The app will be available at `http://localhost:5173` with API proxied to `http://localhost:3001`.

### Production Build

```bash
npm run build
npm start
```

### Deploy to Cloud Run

```bash
# Build and push container
gcloud builds submit --tag gcr.io/PROJECT_ID/votelens-ai

# Deploy
gcloud run deploy votelens-ai \
  --image gcr.io/PROJECT_ID/votelens-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key
```

---

## ♿ Accessibility

- **Keyboard navigation** — All interactive elements are keyboard-accessible
- **ARIA labels** — Screen reader support throughout
- **Skip link** — "Skip to main content" for keyboard users
- **Voice mode** — Speech input/output for users who can't type
- **Reduced motion** — Respects `prefers-reduced-motion` media query
- **High contrast** — Dark theme with sufficient color contrast ratios
- **Semantic HTML** — Proper heading hierarchy, landmarks, and roles

---

## 🔒 Security

- **API keys server-side only** — Gemini API key never exposed to client
- **Helmet.js** — HTTP security headers (CSP, HSTS, etc.)
- **Rate limiting** — 100 requests/minute per IP
- **Input validation** — All API inputs validated and sanitized
- **File upload limits** — 10MB max, image-only MIME type filtering
- **Non-root Docker** — Container runs as unprivileged user
- **CORS** — Configured for production origin

---

## 📝 Assumptions

1. The app focuses on the **Indian election process** (ECI guidelines, EVM/VVPAT procedures)
2. Voice features require a **Chromium-based browser** (Chrome/Edge) for full functionality
3. The Gemini API key has access to the `gemini-2.0-flash` model with Google Search grounding
4. Users have a modern browser with JavaScript enabled
5. The app is **non-partisan** — it educates about process, not politics

---

## 📁 Project Structure

```
votelens-ai/
├── server.js            # Express server (API + static serving)
├── api/
│   ├── gemini.js        # Gemini SDK wrapper
│   ├── prompts.js       # Engineered system prompts
│   └── routes.js        # API endpoints
├── client/
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Route pages
│       ├── hooks/       # Custom React hooks
│       └── utils/       # API client + constants
├── Dockerfile           # Multi-stage production build
└── package.json         # Project configuration
```

---

## License

MIT — Built for the Virtual PromptWars Hackathon 2026.
