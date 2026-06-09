<div align="center">

<img src="https://img.shields.io/badge/EcoTrack-Carbon%20Intelligence%20Platform-10b981?style=for-the-badge&logo=leaf&logoColor=white" alt="EcoTrack" />

# 🌿 EcoTrack — Carbon Intelligence Platform

### _Track. Analyze. Reduce. Powered by Google Cloud._

[![Live Demo](https://img.shields.io/badge/🌍%20Live%20Demo-ecotrack--carbon--platform.web.app-10b981?style=for-the-badge)](https://ecotrack-carbon-platform.web.app)
[![Cloud Run](https://img.shields.io/badge/☁️%20API-Cloud%20Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://ecotrack-api-957855819260.us-central1.run.app)
[![Firebase](https://img.shields.io/badge/🔥%20Hosted-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://ecotrack-carbon-platform.web.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge)](LICENSE)

<br/>

> **EcoTrack** is a full-stack carbon footprint intelligence platform that helps individuals measure their monthly CO₂ emissions, benchmark against global targets, and receive personalized AI-driven reduction strategies — all powered by Google Cloud infrastructure.

<br/>

![EcoTrack Demo](https://img.shields.io/badge/React%2018-Framer%20Motion-61DAFB?style=flat-square&logo=react) ![Vertex AI](https://img.shields.io/badge/Vertex%20AI-Gemini%201.5%20Flash-4285F4?style=flat-square&logo=google) ![BigQuery](https://img.shields.io/badge/Google-BigQuery-4285F4?style=flat-square&logo=google-cloud) ![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)

</div>

---

## 📌 Table of Contents

- [🎯 Chosen Vertical](#-chosen-vertical)
- [✨ Features](#-features)
- [🏗️ Architecture & Approach](#️-architecture--approach)
- [🧠 How the Solution Works](#-how-the-solution-works)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🌐 Deployment](#-deployment)
- [💡 Assumptions Made](#-assumptions-made)
- [🔮 Future Roadmap](#-future-roadmap)

---

## 🎯 Chosen Vertical

**Climate Tech / Sustainability Intelligence**

Carbon emissions from individual lifestyle choices account for **~30% of global greenhouse gas emissions** — yet most people have no idea what their personal footprint looks like or how to reduce it effectively.

EcoTrack targets this gap by providing:

- **Immediate awareness** — Calculate your carbon footprint in under 2 minutes
- **Contextual benchmarking** — See how you compare to Paris Agreement targets and global averages
- **Intelligent action** — AI-generated, personalized reduction strategies ranked by impact

The platform is designed for **individual users**, **sustainability-conscious teams**, and **educational institutions** that want to track and reduce their environmental impact.

---

## ✨ Features

| Feature                   | Description                                                                |
| ------------------------- | -------------------------------------------------------------------------- |
| 🌿 **Carbon Calculator**  | 4-category monthly survey: transport, diet, home energy, shopping          |
| 📊 **Live Scoring**       | Real-time CO₂e estimate updates as you fill in the form                    |
| 🏆 **Grade System**       | A+ to F grading with colour-coded benchmarks (Paris target, world average) |
| 🤖 **Vertex AI Insights** | Gemini 1.5 Flash generates personalised, ranked reduction tips             |
| 📅 **30-Day Challenge**   | Select and save pledges to Cloud Firestore                                 |
| 🔐 **Google OAuth**       | Secure sign-in via Firebase Authentication                                 |
| 📈 **BigQuery Analytics** | Cohort-level footprint logging for trend analysis                          |
| 🎨 **Premium UI**         | Glassmorphism design with Framer Motion animations                         |
| 📱 **Responsive**         | Mobile-first, works across all screen sizes                                |
| ♿ **Accessible**         | ARIA roles, skip links, keyboard navigation                                |
| 🛡️ **Code Quality**       | 100% Test Coverage (159/159), strict ESLint and Prettier configs           |

---

## 🏗️ Architecture & Approach

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│                                                             │
│   Landing Page → Login Page → Dashboard                     │
│   (React 18 + Vite + Framer Motion + Glassmorphism CSS)     │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTPS
          ┌────────────────┴─────────────────┐
          │                                  │
          ▼                                  ▼
┌─────────────────┐               ┌──────────────────────┐
│ Firebase Hosting│               │  Cloud Run (Express)  │
│  (Global CDN)   │               │   ecotrack-api        │
│                 │               │   us-central1         │
│  React SPA      │               └──────┬───────────────┘
│  dist/ files    │                      │
└─────────────────┘               ┌──────┴───────┐
          │                       │              │
          ▼                       ▼              ▼
┌─────────────────┐    ┌──────────────┐  ┌─────────────┐
│ Firebase Auth   │    │  Vertex AI   │  │  BigQuery   │
│ Google OAuth    │    │ Gemini Flash │  │  Analytics  │
│ Anonymous Auth  │    │  Insights    │  │  Logging    │
└─────────────────┘    └──────────────┘  └─────────────┘
          │
          ▼
┌─────────────────┐
│ Cloud Firestore │
│ footprints/     │
│ pledges/        │
└─────────────────┘
```

### Design Philosophy

**1. Security-first API design**
All Vertex AI and BigQuery calls happen **server-side** in Cloud Run. The frontend never exposes GCP credentials — it only calls our own Express API endpoint.

**2. Graceful degradation**
Every external service (Vertex AI, BigQuery, Firestore) has a local fallback. The app works in full demo mode with zero credentials configured.

**3. Separation of concerns**

- `src/` — Pure React frontend, no Node.js APIs
- `server/` — Pure Express backend, no React code
- `src/services/` — Thin HTTP clients that call the backend
- `src/utils/` — Pure calculation functions (fully unit tested)

**4. Real-time UX**
Carbon footprint recalculates live as the user types — using React `useMemo` so calculations only run when relevant inputs change.

---

## 🧠 How the Solution Works

### Step 1 — Landing & Authentication

```
User opens app
  └─► Stunning landing page (hero, features, how-it-works, CTA)
      └─► "Get Started" → Login page
          └─► Google OAuth via Firebase Auth
              └─► JWT token issued, user lands on Dashboard
```

### Step 2 — Carbon Survey (Calculate Tab)

The user fills in a **4-category monthly survey**:

| Category       | Inputs                                   | Emission Factor Source           |
| -------------- | ---------------------------------------- | -------------------------------- |
| 🚗 Transport   | km by car, bus, train; flight hours/year | IPCC AR6 transport factors       |
| 🥗 Diet        | Diet pattern (vegan → meat-heavy)        | Our World in Data food emissions |
| ⚡ Home Energy | kWh/month + energy source                | IEA grid intensity factors       |
| 🛍️ Shopping    | Clothing items + electronics/year        | Ellen MacArthur Foundation data  |

**Live calculation formula (simplified):**

```js
total_kg_CO2e =
  (kmCar × 0.21) +                          // petrol car
  (kmBus × 0.089) +                          // average bus
  (kmTrain × 0.041) +                        // rail
  (flightHours × 90) +                       // aviation per hour
  DIET_FACTORS[dietType] +                   // 50–200 kg/month
  (kwhHome × GRID_INTENSITY[energySource]) + // energy grid
  (clothingItems × 8.5 / 12) +              // fast fashion
  (electronicsItems × 70 / 12)              // electronics mfg
```

### Step 3 — Results & Benchmarking

After calculating, the user sees:

- **Personal score** (kg CO₂e/month) with letter grade A+ → F
- **Animated breakdown bars** per category
- **3-way comparison**: You vs Paris Target (167 kg/mo) vs World Average (450 kg/mo)
- **Annual projection** automatically calculated

**Grading thresholds:**

```
A+  ≤ 100 kg   Exceptional
A   ≤ 167 kg   Paris-aligned
B   ≤ 300 kg   Below average
C   ≤ 450 kg   World average
D   ≤ 650 kg   Above average
F   > 650 kg   High impact
```

### Step 4 — Vertex AI Insights

```
Frontend → POST /api/insights → Cloud Run Express
                                     └─► Vertex AI Gemini 1.5 Flash
                                         Prompt: footprint breakdown
                                         Response: JSON tips array
                                     ← Personalised tips ranked by saving
Frontend displays InsightCard components
User selects pledges → saved to Cloud Firestore
```

**AI Prompt Strategy:**
The backend sends a structured prompt with the user's exact breakdown values and requests a JSON response with:

- 3 specific, ranked action tips
- Estimated kg CO₂e saved per tip
- Priority level (high/medium/low)
- Largest impact category identified

### Step 5 — Analytics Pipeline

Every footprint calculation is logged to BigQuery for aggregate analytics:

```
User calculates → POST /api/analytics → Cloud Run
                                            └─► BigQuery
                                                dataset: carbon_metrics
                                                table:   footprint_logs
                                                 schema:  userId, total,
                                                          transport, diet,
                                                          energy, shopping,
                                                          cohort, timestamp
```

---

## 🛠️ Tech Stack

### Frontend

| Technology    | Version | Purpose                            |
| ------------- | ------- | ---------------------------------- |
| React         | 18.3    | UI framework                       |
| Vite          | 5.4     | Build tool & dev server            |
| Framer Motion | 12.x    | Animations & page transitions      |
| Tabler Icons      | 3.x     | Icon library                       |
| Vitest & RTL      | 1.x     | 100% Unit & Integration testing    |
| ESLint & Prettier | —       | Static code analysis & formatting  |
| Vanilla CSS       | —       | Custom glassmorphism design system |
| Google Fonts      | —       | Outfit (display) + Inter (body)    |

### Backend

| Technology             | Version     | Purpose               |
| ---------------------- | ----------- | --------------------- |
| Node.js                | 22 (Alpine) | Runtime               |
| Express                | 5.x         | HTTP server & routing |
| @google-cloud/vertexai | 1.x         | Gemini AI client      |
| @google-cloud/bigquery | 8.x         | Analytics logging     |
| dotenv                 | 17.x        | Environment config    |
| cors                   | 2.x         | Cross-origin requests |

### Google Cloud Services

| Service                          | Role                                        |
| -------------------------------- | ------------------------------------------- |
| **Firebase Hosting**             | Frontend CDN + HTTPS                        |
| **Firebase Authentication**      | Google OAuth 2.0                            |
| **Cloud Firestore**              | Footprint & pledge storage                  |
| **Cloud Run**                    | Backend API (containerised, scales to zero) |
| **Vertex AI (Gemini 1.5 Flash)** | AI insights generation                      |
| **Google BigQuery**              | Aggregate analytics warehouse               |
| **Cloud Build**                  | Docker image CI/CD                          |
| **Artifact Registry**            | Container image storage                     |

---

## 📁 Project Structure

```
EcoTrack/
│
├── 📂 server/                     ← Node.js / Express BACKEND
│   ├── index.js                      Server entry + routes
│   ├── vertex.js                     Vertex AI (Gemini) service
│   └── bigquery.js                   BigQuery analytics logger
│
├── 📂 src/                        ← React FRONTEND (Vite)
│   ├── main.jsx                      App entry point
│   ├── App.jsx                       Multi-page router
│   ├── index.css                     Glassmorphism design system
│   │
│   ├── 📂 pages/
│   │   ├── Landing.jsx               Public landing page
│   │   ├── Login.jsx                 Google OAuth login card
│   │   └── Dashboard.jsx             Main app (survey→results→AI)
│   │
│   ├── 📂 components/
│   │   ├── 📂 layout/
│   │   │   ├── Header.jsx            Sticky app header
│   │   │   └── GCPBanner.jsx         Google Cloud banner
│   │   ├── 📂 sections/
│   │   │   ├── SurveySection.jsx     Carbon survey form
│   │   │   ├── ResultsSection.jsx    Score + breakdown
│   │   │   ├── InsightsSection.jsx   AI tips + 30-day pledge
│   │   │   └── LiveTicker.jsx        Real-time CO₂ counter
│   │   └── 📂 ui/
│   │       ├── AuthBadge.jsx         User avatar badge
│   │       ├── BreakdownBar.jsx      Animated emission bar
│   │       ├── InputField.jsx        Number input field
│   │       ├── InsightCard.jsx       AI tip card
│   │       ├── ProgressRing.jsx      SVG circular ring
│   │       └── SelectField.jsx       Dropdown select
│   │
│   ├── 📂 context/
│   │   └── AuthContext.jsx           Global Firebase auth state
│   │
│   ├── 📂 hooks/
│   │   ├── useAuth.js                Firebase auth + state
│   │   └── useFootprint.js           Calculation state + memos
│   │
│   ├── 📂 services/
│   │   ├── firebase.js               Firebase SDK init
│   │   ├── firestore.js              Firestore CRUD
│   │   └── vertexAI.js               Cloud Run API client
│   │
│   ├── 📂 constants/
│   │   └── emissions.js              Emission factors + grades
│   │
│   └── 📂 utils/
│       ├── calculations.js           CO₂ formulas (pure functions)
│       └── calculations.test.js      Vitest unit tests
│
├── 📂 public/                     ← Static assets
├── 📂 dist/                       ← Production build output
├── .env.example                   ← Environment template
├── .gitignore
├── Dockerfile                     ← Cloud Run container
├── firebase.json                  ← Hosting + Firestore config
├── firestore.rules                ← Security rules
├── vite.config.js                 ← Vite + path aliases
└── package.json                   ← Scripts + dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud SDK (optional — for backend)

### 1. Clone the repository

```bash
git clone https://github.com/Afuu-coder/EcoTrack.git
cd EcoTrack
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Firebase (from Firebase Console → Project Settings)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc

# Cloud Run (after deploying the backend)
VITE_CLOUD_RUN_API_URL=https://your-api.run.app
```

### 4. Run frontend (demo mode — no backend needed)

```bash
npm run dev
```

➜ Open **http://localhost:5173**

> 💡 The app runs in full demo mode without any credentials — Vertex AI uses a local fallback and Firestore uses in-memory storage.

### 5. Run backend server

```bash
npm run server
# API available at http://localhost:8080
```

### 6. Run both together

```bash
npm run dev:all
```

### 7. Run tests

```bash
npm test
```

---

## 🌐 Deployment

### Backend → Cloud Run

```bash
gcloud run deploy ecotrack-api \
  --source . \
  --project YOUR_PROJECT_ID \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

### Frontend → Firebase Hosting

```bash
npm run build
firebase deploy --only hosting --project YOUR_PROJECT_ID
```

### Live URLs

| Service             | URL                                                                  |
| ------------------- | -------------------------------------------------------------------- |
| 🌍 Frontend         | https://ecotrack-carbon-platform.web.app                             |
| ☁️ Backend API      | https://ecotrack-api-957855819260.us-central1.run.app                |
| 📊 Firebase Console | https://console.firebase.google.com/project/ecotrack-carbon-platform |

---

## 💡 Assumptions Made

| Assumption                       | Rationale                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Monthly footprint scope**      | Monthly is the most relatable time unit for lifestyle tracking — bills, commutes, and diet are all monthly habits                    |
| **IPCC emission factors**        | Used AR6 2023 values which are the most current internationally accepted factors                                                     |
| **Flight hours as proxy**        | Total flight hours/year is simpler to self-report than exact km; 90 kg CO₂e/hour covers an average mix of short/long haul            |
| **Diet as categorical**          | People relate to diet patterns (vegan, vegetarian, etc.) more than to grams of specific food consumed                                |
| **Grid intensity by source**     | Three buckets (coal, mixed, renewable) covers the major real-world cases without requiring users to know their grid intensity factor |
| **Paris target = 167 kg/month**  | 2 tonnes CO₂e/year ÷ 12 — the IPCC 1.5°C compatible per-capita budget                                                                |
| **World average = 450 kg/month** | ~4.5 tonnes/year from Our World in Data 2023 global average                                                                          |
| **Anonymous auth as default**    | Reduces friction — users can explore before committing to sign in. Anonymous UIDs can later be linked to Google accounts             |
| **Server-side AI calls**         | Keeps GCP credentials off the client — critical for security in a production app                                                     |
| **BigQuery fires-and-forgets**   | Analytics failures should never block the user experience, so they're non-blocking async calls                                       |

---

## 🔮 Future Roadmap

- [ ] **Historical tracking** — Dashboard showing footprint trend over months
- [ ] **Team/org accounts** — Company-level aggregate dashboards
- [ ] **Scope 3 supply chain** — Include purchased goods & services emissions
- [ ] **Carbon offset marketplace** — Integrate verified offset providers
- [ ] **Mobile app** — React Native version with push reminders
- [ ] **Social sharing** — Share your grade + reduction tips on social media
- [ ] **BigQuery ML** — Predict future footprint based on historical trends
- [ ] **Multi-language** — Hindi, Spanish, French localisation

---

## 📄 License

MIT © 2025 [Afjal Quraishi](https://github.com/Afuu-coder)

---

<div align="center">

**Built with ❤️ and ☁️ Google Cloud**

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white)](https://cloud.google.com)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)

_If this project helped you, please ⭐ star the repository!_

</div>
