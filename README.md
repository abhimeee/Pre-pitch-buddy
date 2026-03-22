# 🎯 Pitch Twin

**Practice with their AI twin before the real call.**

An AI-powered sales pitch preparation tool that researches your prospects and lets you practice with a voice AI that acts as your client.

> Built for the 11Labs Hackathon 2026

---

## 🚀 What It Does

1. **Research**: Enter a company website → AI scrapes and analyzes company intel using Firecrawl
2. **Intel**: Get a pitch-ready brief with:
   - Company Intelligence (about, products, hiring signals)
   - Leadership & Decision Makers info
   - Financial Status (funding, valuation, investors)
   - Market Signals (recent news, partnerships, launches)
   - AI-generated pitch strategy with talking points, objections, discovery questions
3. **Practice**: Voice conversation with an AI that acts as your prospect (browser Speech API)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript + Vite |
| **UI** | Ant Design 6 + Framer Motion |
| **Backend** | Node.js + Express |
| **AI Intelligence** | Anthropic Claude (Haiku 4.5) |
| **Web Scraping** | Firecrawl API |
| **Voice** | ElevenLabs (ready for integration) |

---

## 📦 Quick Start

### Prerequisites

- Node.js 20+
- API keys for:
  - [Anthropic](https://console.anthropic.com/)
  - [Firecrawl](https://firecrawl.dev/)
  - [ElevenLabs](https://elevenlabs.io/) (optional for voice practice)

### Backend Setup

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your API keys

# Run server
npm run dev
```

Server runs on http://localhost:4000

### Frontend Setup

```bash
cd frontend
npm install

# Run dev server
npm run dev
```

Frontend runs on http://localhost:5173

---

## 📡 API Endpoints

### Research

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/research/scrape` | Scrape a company website |
| `POST` | `/api/research/search` | Search for company news |
| `POST` | `/api/research/summarize` | Generate pitch summary from intel |
| `POST` | `/api/research/full-research` | Complete research pipeline (scrape + search + summarize) |

### Agent

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agent/voices` | List available ElevenLabs voices |
| `POST` | `/api/agent/conversation-config` | Get voice agent configuration |
| `POST` | `/api/agent/synthesize` | Text-to-speech endpoint |

---

## 🎯 Usage Flow

1. **Enter prospect info**
   - Company website URL
   - Prospect name (optional)
   - Your product description

2. **AI Research** (automatic)
   - Scrapes company website
   - Searches for recent news & funding
   - Analyzes with Claude to generate pitch strategy

3. **Review Intelligence**
   - Company Intelligence (about, team, products, hiring)
   - Leadership & Decision Makers
   - Financial Status (funding, investors, valuation)
   - Market Signals (recent news, partnerships)
   - Pitch Strategy:
     - Company overview
     - Pain points
     - Talking points
     - Expected objections
     - Discovery questions
     - Buying signals (green/red flags)

4. **Voice Practice**
   - Click "Start Voice Practice"
   - AI greets you as the prospect
   - Practice your pitch with voice responses
   - Get comfortable before the real call

---

## 🔧 Configuration

### Backend Environment Variables

```env
FIRECRAWL_API_KEY=fc-xxx    # Firecrawl API key
ELEVENLABS_API_KEY=         # ElevenLabs API key (optional)
ANTHROPIC_API_KEY=sk-ant-xxx # Anthropic API key
PORT=4000                   # Backend port
```

### Frontend

No configuration needed. The frontend connects to `http://localhost:4000` by default.

To change the API URL, update `API_URL` in `frontend/src/App.tsx`.

---

## 📁 Project Structure

```
pitch-twin/
├── backend/
│   ├── src/
│   │   ├── index.js           # Express server entry
│   │   └── routes/
│   │       ├── research.js    # Research endpoints
│   │       └── agent.js       # Voice agent endpoints
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main React component
│   │   ├── App.css            # Styles
│   │   └── index.css          # Global styles
│   ├── .gitignore
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🎨 Features

- **Enhanced Intelligence Dashboard** - Agentic white modern UI with:
  - Company Intelligence (about, products, hiring signals)
  - Leadership & Decision Makers profiles
  - Financial Status (funding, valuation, investors)
  - Market Signals (recent news, partnerships, launches)
- **Clean, modern UI** - Stripe-inspired white design with smooth animations
- **Agentic AI feel** - Real-time activity log showing 6-step research progress
- **Voice practice** - Practice your pitch with AI-powered voice responses
- **Actionable intel** - Claude-generated talking points and objections
- **Responsive design** - Works on desktop and mobile

---

## 🚧 Roadmap

- [ ] ElevenLabs Conversational Agent integration
- [ ] Calendar sync for upcoming calls
- [ ] Multi-prospect comparison
- [ ] Pitch feedback scoring
- [ ] Conversation history & replay
- [ ] Custom prospect personas

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the 11Labs Hackathon 2026
