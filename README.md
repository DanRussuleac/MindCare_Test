# 🧠 MindCare – AI‑Powered Mental‑Health Companion

MindCare is a **full‑stack mental‑health application** that combines an AI chatbot, evidence–based self‑care tools and rich personal analytics in a single web experience.
It is built as a two‑package monorepo:

```
mindcare-backend   ←  Node / Express REST + internal AI API  
mindcare-frontend  ←  React 18 SPA  
```

The project is designed for students, clinicians and researchers who want a transparent, self‑hostable platform for experimenting with digital mental‑health interventions.

---

## ✨ Core Features (Frontend – 12 pages)

| Page                        | Highlights                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| **Welcome**                 | Animated ParticleWave landing screen, quick SOS access                                        |
| **Auth**                    | JWT‑secured login / register with bcrypt; password strength meter                             |
| **Home Dashboard**          | *At‑a‑glance* mood, sleep & habit widgets and today’s quick actions                           |
| **Chat (AI Companion)**     | GPT‑powered CBT‑inspired chatbot, conversation history, **text‑to‑speech** & auto‑suggestions |
| **Journal**                 | Rich‑text / Markdown editor, mood tagging, sentiment colour‑coding                            |
| **Mood Tracker**            | Daily slider input, *Chart.js* trend visualisations, correlation with sleep                   |
| **Sleep Tracker**           | Sleep session logger, goal setting and automated quality analytics                            |
| **Daily Tasks & Reminders** | Habit checklist, cron‑style reminders, push‑notification support                              |
| **Analytics**               | Aggregated insights across mood, sleep & habits, interactive charts                           |
| **Community Forum**         | Public / anonymous posts, threaded replies, up‑vote & report system                           |
| **Profile**                 | Avatar upload, GDPR data export / delete, personal preferences                                |
| **Admin**                   | Admin dashboard for user moderation & global stats                                            |

> 🆘 An **SOS modal** floats above every route – one click surfaces helplines and emergency contacts.

---

## ⚙️  Tech Stack

| Layer     | Technologies                                                                                  |
| --------- | --------------------------------------------------------------------------------------------- |
| Frontend  | React 18 · React Router v6 · **MUI 6** · Chart.js · Axios                                     |
| Backend   | Node 20+ · **Express 4** · PG connection pool · Multer uploads · JSON Web Tokens · OpenAI SDK |
| Database  | **PostgreSQL 15** – schema in [`/Database/MindcareDB.sql`](Database/)                         |
| Dev & Ops | Nodemon · ESLint · VS Code Counter · GitHub Actions (Qodana static analysis)                  |

---

## 🗒️ Project Structure

```
├── mindcare-frontend/         # React client
│   ├── src/Pages/             # 12 main page components
│   ├── src/components/        # Re‑usable UI + SOS modal
│   └── public/
├── mindcare-backend/          # Express API
│   ├── routes/                # Modular REST resources
│   ├── middleware/            # Auth, logging, error handling
│   ├── uploads/               # User avatars & exports
│   └── server.js
├── Database/                  # *.sql schema & seed files
└── Project_Resources/         # Proposal, interim report, logs
```

---

## 🔌 REST & Internal API

| Method | Endpoint                                                  | Purpose                                             |
| ------ | --------------------------------------------------------- | --------------------------------------------------- |
| `POST` | `/api/auth/register`                                      | Register user                                       |
| `POST` | `/api/auth/login`                                         | Obtain JWT                                          |
| `POST` | `/api/bot/:conversationId/send`                           | **Internal** – proxy to OpenAI, logs & stores reply |
| `GET`  | `/api/journal`                                            | List journal entries                                |
| `POST` | `/api/moods`                                              | Create mood entry                                   |
| `GET`  | `/api/analytics/overview`                                 | Personal analytics bundle                           |
| `GET`  | `/api/forum`                                              | Public posts                                        |
| …      | see [`mindcare-backend/routes/`](mindcare-backend/routes) |                                                     |

All protected routes expect an \`\` header issued by `/api/auth/login`.

---

## 🔑 Environment Variables

Create `mindcare-backend/.env`:

```dotenv
PORT=5000

# PostgreSQL
DB_USER=postgres
DB_PASSWORD=secret
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mindcare

# JWT
JWT_SECRET=thisIsSuperSecret

# OpenAI or compatible provider
API_KEY=sk-...
OPENAI_BASE_URL=https://api.aimlapi.com/v1

# CORS
CLIENT_URL=http://localhost:3000
```

---

## 🚀 Getting Started (local)

```bash
# 1. Clone & install
git clone https://github.com/<you>/MindCare.git
cd MindCare_Test-main

# Backend
cd mindcare-backend && npm ci

# Frontend
cd ../mindcare-frontend && npm ci

# 2. Database
createdb mindcare          # or psql -f Database/MindcareDB.sql
psql -d mindcare -f ../Database/MindcareDB.sql

# 3. Configure .env (see above)

# 4. Run
# In two terminals, or use concurrently:
npm --prefix mindcare-backend run dev
npm --prefix mindcare-frontend start
```

Frontend lives on `and proxies API requests to`.

---

## 🧪 Tests & Quality

```bash
# Lint
npm run lint --workspaces

# Unit tests (Jest / React‑Testing‑Library)
npm test --workspaces
```

GitHub Actions run **Qodana** analysis on every push.

---

