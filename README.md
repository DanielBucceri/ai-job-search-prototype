# AI Job Search Prototype

A full-stack demo application that lets users search remote job listings with optional AI-powered filtering.

* **Frontend** – React (Vite) SPA
* **Backend** – Node.js + Express
* **AI** – OpenAI Chat Completions for semantic filtering
* **Jobs Source** – [Remotive API](https://remotive.com/api/remote-jobs) or local JSON mock data

---

## Features

| Layer    | Capability                                                                                         |
|----------|----------------------------------------------------------------------------------------------------|
| Backend  | • Fetch jobs from Remotive  
           | • Keyword filtering in either mode (Remotive or local)  
           | • AI filtering via OpenAI ("INCLUDE/EXCLUDE")                                                     |
| Frontend | • Keyword search form with optional AI criteria textarea  
           | • Disabled button & inline errors for empty searches  
           | • Results list with truncated HTML descriptions, company logo, etc.                               |


## Architecture

```txt
ai-job-search-prototype/
├── backend/               Express API (PORT 5000)
│   ├── server.js          app bootstrap & middleware
│   ├── routes/
│   │   └── jobs.js        /jobs router + OpenAI logic
│   └── data.json          sample dataset (used when USE_LOCAL_DATA='true')
└── frontend/              React SPA (Vite dev server PORT 5173)
    ├── src/App.jsx        Main UI
    ├── src/App.css        Styling
    └── public/logo.svg
```

## Directory Layout

```
backend/
  package.json
  .env               # NOT committed – see below
  data.json          # optional local dataset

frontend/
  package.json
  .env               # points React to backend
```

## Environment Variables

### Backend (`backend/.env`)
| Name                | Example                                       | Required | Description                                    |
|---------------------|-----------------------------------------------|----------|------------------------------------------------|
| `PORT`              | `5000`                                        | No       | Server port (default 5000)                     |
| `FRONTEND_URL`      | `http://localhost:5173`                       | Yes      | CORS allow-origin                              |
| `OPENAI_API_KEY`    | `sk-…`                                        | Yes*     | Needed for AI filtering                        |
| `REMOTIVE_API_URL`  | `https://remotive.com/api/remote-jobs`        | No       | Override default Remotive endpoint            |
| `USE_LOCAL_DATA`    | `true` \| `false`                             | No       | `true` ⇒ read `data.json` instead of Remotive |

\*The server refuses to start if `OPENAI_API_KEY` is missing or incorrect.

### Frontend (`frontend/.env`)

```
VITE_BACKEND_URL=http://localhost:5000
```

## Getting Started

1. **Clone & install**

   ```bash
   git clone <repo>
   cd ai-job-search-prototype
   
   # Backend deps
   cd backend && npm install
   
   # Frontend deps
   cd ../frontend && npm install
   ```

2. **Configure env files**

   ```bash
   # backend/.env
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
   USE_LOCAL_DATA='true' # or !'true' string to hit Remotive API
   
   # frontend/.env
   VITE_BACKEND_URL=http://localhost:5000
   ```

## Running in Development

Terminal 1 – **backend**
```bash
cd backend
npm run dev    # nodemon server.js
```

Terminal 2 – **frontend**
```bash
cd frontend
npm run dev    # vite dev server
# automatically opens http://localhost:5173
```

## Switching Between Live & Mock Data

| Scenario                      | Setting                     |
|-------------------------------|-----------------------------|
| Use Remotive production API   | `USE_LOCAL_DATA=false`      |
| Develop offline / small set   | `USE_LOCAL_DATA=true`       |

When `USE_LOCAL_DATA` is **true**, keyword filtering is done locally in `server.js` and AI filtering is **skipped** unless a non-empty `filter` textarea is supplied.

## Scripts

Backend (inside `backend/`):
- `npm run dev` – start with nodemon

Frontend (inside `frontend/`):
- `npm run dev` – Vite dev server
- `npm run build` – production build
- `npm run preview` – preview built site

## Deployment Notes

- **Frontend** can be deployed to Netlify, Vercel, etc. – just serve the static `dist/` folder.
- **Backend** can run on Render, Railway, Fly, etc.  Set env vars via provider UI.
- Remember to add the deployed front-end URL to `FRONTEND_URL` for CORS.

## Roadmap / Ideas
- Pagination (`page` & `limit` query params) with "Load More" button
- Category list dropdown (live from Remotive)
- Queue / batch calls for OpenAI to reduce latency & cost
- Unit tests (Jest) & CI
- Accessibility & responsive improvements
- Resume upload → LLM similarity match
- Fairness & Bias Audits - Run periodic checks for biased filtering outcomes (e.g., gender-coded language)
- Confidence Scoring & Explainability - Show users why jobs were included or excluded, increasing transparency
- User Feedback Loop - Let users rate result relevance to continuously improve filtering accuracy
- Company Research Integration — Option to let AI summarise employer reviews, culture, or additional job context

## License
MIT
