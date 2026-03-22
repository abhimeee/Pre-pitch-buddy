# Pitch Twin - Project Context for AI Assistants

## Project Overview

**Pitch Twin** is an AI-powered sales pitch preparation tool that helps users prepare for B2B sales calls 5 minutes before meeting clients. It gathers prospect intelligence and enables voice-based roleplay practice where AI acts as the client.

**Hackathon**: 11Labs Hackathon 2026

**GitHub**: https://github.com/abhimeee/Pre-pitch-buddy

---

## Core Features

1. **Company Research Pipeline**
   - Scrapes company website using Firecrawl API
   - Searches for news, funding, leadership info
   - Gathers financial data and market signals
   - Generates AI-powered pitch strategy using Anthropic Claude

2. **Intelligence Dashboard**
   - Company Intelligence (about, products, hiring signals)
   - Leadership & Decision Makers profiles
   - Financial Status (funding, valuation, investors)
   - Market Signals (recent news, partnerships, launches)
   - AI-generated pitch strategy with talking points, objections, discovery questions

3. **Voice Practice Mode**
   - AI acts as the prospect in a voice conversation
   - Currently uses browser SpeechSynthesis API
   - ElevenLabs integration prepared (API key slot ready)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Vite |
| UI Framework | Ant Design 6 + Framer Motion |
| Backend | Node.js + Express (ES Modules) |
| AI/LLM | Anthropic Claude (claude-haiku-4-5-20251001) |
| Web Scraping | Firecrawl API (scrape + search endpoints) |
| Voice | Browser SpeechSynthesis (ElevenLabs ready) |
| HTTP Client | Axios |

---

## Project Structure

```
pitch-twin/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server, CORS enabled, port 4000
│   │   └── routes/
│   │       ├── research.js       # Research endpoints (scrape, search, summarize, full-research)
│   │       └── agent.js          # Voice agent endpoints (voices, conversation-config, synthesize)
│   ├── .env                      # FIRECRAWL_API_KEY, ANTHROPIC_API_KEY, ELEVENLABS_API_KEY, PORT
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main component, 4 states: input, researching, intel, practice
│   │   ├── App.css               # Component styles, Stripe-inspired white design
│   │   └── index.css             # Global styles, animations, agent orb styles
│   └── package.json
├── package.json                  # Root workspace, concurrently for dev
└── README.md
```

---

## API Endpoints

### Research Routes (`/api/research`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/scrape` | Scrape single URL, extract sales intel |
| POST | `/search` | Search for company mentions/news |
| POST | `/summarize` | Generate pitch summary from intel |
| POST | `/full-research` | Complete pipeline: scrape + search + leadership + financial + market + summarize |

### Agent Routes (`/api/agent`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/voices` | List ElevenLabs voices |
| POST | `/conversation-config` | Get voice agent config |
| POST | `/synthesize` | Text-to-speech |

---

## Key Implementation Details

### Frontend App States
1. **input** - User enters company URL, prospect name, product info
2. **researching** - Shows 6-step agentic activity log with progress
3. **intel** - Displays intelligence dashboard with 4 enhanced cards + pitch strategy
4. **practice** - Voice conversation mode with AI prospect

### Backend Research Flow (`/full-research`)
1. Scrape company website → `scrapedData`
2. Search news/funding → `searchResults`
3. Search leadership info → `leadershipData`
4. Search financial data → `financialData`
5. Search market signals → `marketSignals`
6. Generate AI summary → `summary`

### Anthropic API Integration
- Uses direct axios POST (SDK had compatibility issues)
- Model: `claude-haiku-4-5-20251001`
- JSON extraction from markdown code blocks via regex
- Demo fallback when no API key

### Voice Practice
- Uses browser `SpeechSynthesisUtterance` API
- Male voice selection logic
- Conversation state management
- Modal for typed responses

---

## Environment Variables

**backend/.env**:
```env
FIRECRAWL_API_KEY=fc-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
ELEVENLABS_API_KEY=         # Optional, prepared for integration
PORT=4000
```

---

## Development Commands

```bash
# Root (runs both)
npm run dev

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev

# Build frontend
cd frontend && npm run build
```

---

## UI Design System

- **Theme**: Stripe-inspired white modern design
- **Colors**: Purple/indigo gradients (#6366f1, #8b5cf6, #a855f7)
- **Animations**: slide-up-fade, expand-in, gradient-flow, pulse-soft, shimmer
- **Components**: Glassmorphic cards, gradient buttons, activity log with status icons
- **Agentic Elements**: Animated orb, real-time activity log, LIVE badges

---

## Known Limitations

1. **LinkedIn Scraping**: Firecrawl blocks LinkedIn and social media. Leadership/financial data uses general web search instead.
2. **Voice**: Currently uses browser SpeechSynthesis. ElevenLabs integration prepared but not implemented.
3. **Demo Mode**: Without API keys, returns mock data with helpful messages.

---

## Files to Read First

1. `frontend/src/App.tsx` - Main application logic, state management, voice practice
2. `backend/src/routes/research.js` - All research endpoints, Firecrawl + Anthropic integration
3. `frontend/src/App.css` - Component styling
4. `frontend/src/index.css` - Global styles, animations, agent orb

---

## Recent Changes (March 22, 2026)

- Added enhanced intelligence cards (Company, Leadership, Financial, Market)
- Updated research activity log to 6 steps
- Fixed icon imports (`TrendingUpOutlined` → `RiseOutlined`)
- UI animations: staggered card entry, gradient hover effects, LIVE badge pulse

---

## Deployment Notes

- Frontend: Static files, can be served via Vite build output
- Backend: Node.js Express server, requires environment variables
- CORS enabled for localhost development
- No database - all data is ephemeral/request-based
