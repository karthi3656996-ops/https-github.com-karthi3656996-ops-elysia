<div align="center">

<img src="https://img.shields.io/badge/Elysia-AI%20Sign%20Language%20Translator-7C3AED?style=for-the-badge&logo=hand-pointer&logoColor=white" alt="Elysia" />

<h1>🤟 Elysia — AI Sign Language Translator</h1>

<p><strong>Breaking communication barriers through real-time AI-powered sign language translation</strong></p>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-FF6F00?style=flat-square&logo=google)](https://mediapipe.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br />

> **Elysia** helps bridge communication between deaf/mute individuals and everyone else by translating sign language into text and speech in real time — no app downloads, no special hardware, just your hands and a browser.

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤚 **Real-Time Translation** | MediaPipe Hands detects 21 hand landmarks at <100ms latency |
| 🧠 **Custom AI Training** | Record & train your own gesture model using KNN classification |
| 🔊 **Voice Output** | Web Speech API converts recognized gestures to natural speech |
| 📊 **Dashboard** | Personal stats — total gestures, sessions, weekly activity charts |
| 📚 **Gesture Library** | Browse 15+ built-in ASL gestures + your custom trained ones |
| 🎓 **Learn Mode** | Interactive guide with tips for every gesture |
| 🤖 **AI Chat Assistant** | Ask anything about sign language |
| 🎥 **Video Calls** *(coming soon)* | WebRTC video calls with live subtitle translation |
| 🔐 **Auth** | Supabase Auth — Email/Password + Google OAuth |
| 💾 **Cloud Sync** | All translations saved to Supabase with Row Level Security |

---

## 🖥️ Tech Stack

### Frontend
- **React 18** + **TypeScript** — type-safe component architecture
- **Vite 5** — lightning-fast dev server with HMR
- **Tailwind CSS** — utility-first styling with glassmorphism design
- **Framer Motion** — smooth page & element animations
- **React Router v6** — client-side routing with lazy loading
- **Recharts** — dashboard activity charts

### AI & Vision
- **MediaPipe Hands** (CDN) — real-time 21-point hand landmark detection
- **Custom KNN Classifier** — trained in-browser, stored in localStorage
- **Rule-based ASL Classifier** — 15+ built-in ASL hand shapes
- **Web Speech API** — browser-native text-to-speech

### Backend & Database
- **Supabase** — PostgreSQL database, Auth, and Row Level Security
- **Node.js + Express** — REST API + Socket.io for real-time features
- **4 database tables**: `users`, `translations`, `history`, `favorites`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- A free [Supabase](https://supabase.com) account

### 1. Clone the repository

```bash
git clone https://github.com/karthi3656996-ops/https-github.com-karthi3656996-ops-elysia.git
cd https-github.com-karthi3656996-ops-elysia
```

### 2. Set up the database

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (free tier is fine)
3. Open **SQL Editor** → **New query**
4. Copy and run the contents of [`frontend/src/lib/supabase-schema.sql`](frontend/src/lib/supabase-schema.sql)
5. Enable Google OAuth *(optional)*: **Authentication → Providers → Google**

### 3. Configure environment variables

```bash
cd frontend
cp .env .env.local    # or just edit .env directly
```

Edit `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

Find these values in: **Supabase Dashboard → Project Settings → API**

### 4. Install dependencies and run

```bash
# Install frontend dependencies
cd frontend
npm install
npm run dev

# In a separate terminal — run the backend (optional, needed for video calls)
cd ..
npm install
node server.js
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 📁 Project Structure

```
elysia/
├── frontend/                    # React + TypeScript app
│   ├── src/
│   │   ├── components/
│   │   │   ├── features/        # CameraFeed, SubtitleBar, GestureCard, etc.
│   │   │   ├── layout/          # Navbar
│   │   │   └── ui/              # PageLoader, etc.
│   │   ├── hooks/               # useMediaPipe, useGestureClassifier, useSettings, useSentenceBuilder
│   │   ├── pages/               # All route pages
│   │   ├── services/            # supabase, authService, translationService, historyService, favoritesService
│   │   ├── store/               # AuthContext (Supabase auth state)
│   │   ├── types/               # TypeScript types + Supabase database schema types
│   │   └── lib/
│   │       └── supabase-schema.sql   # ← Run this in Supabase SQL Editor
├── routes/                      # Express API routes
├── sockets/                     # Socket.io handlers
└── server.js                    # Node.js backend entry point
```

---

## 🗄️ Database Schema

```
users         → profile data, linked to auth.users (auto-created by trigger)
translations  → every recognized gesture with confidence score + session ID
history       → complete translation sessions (start/end time, full sentence)
favorites     → bookmarked gestures per user
```

All tables use **Row Level Security (RLS)** — users can only access their own data.

---

## 🎯 How It Works

```
Camera → MediaPipe Hands → 21 Landmarks → KNN / ASL Classifier
      → Gesture Name → useSentenceBuilder (hold 1.5s to confirm)
      → Sentence → Web Speech API (text-to-speech)
      → Supabase (translations table + history session)
```

1. **Camera** streams to `CameraFeed` component
2. **MediaPipe** extracts 21 3D hand landmarks per frame
3. **Classifier** runs KNN (custom gestures) + rule-based ASL matching
4. **Sentence builder** requires holding a gesture for 1.5s to confirm a word
5. **Speech** reads the completed sentence aloud
6. **Supabase** persists every confirmed word for logged-in users

---

## 🤖 Training Custom Gestures

1. Go to **Train AI** page
2. Enter a gesture name (e.g. "Water", "Food", "Stop")
3. Click **Set** then **Start Recording** — hold the gesture
4. 20 samples are captured automatically
5. Click **Train Model** — your gesture is immediately recognized!
6. Export/import your model as JSON for backup

---

## 🔐 Security

- Supabase **Row Level Security** on all 4 tables
- Users can **only** read/write their own rows
- `.env` file is excluded from git via `.gitignore`
- No API keys are ever exposed to the client (only the `anon` public key)

---

## 🛠️ Available Scripts

```bash
# Frontend
npm run dev        # Start Vite dev server (port 5173)
npm run build      # Build for production
npm run preview    # Preview production build

# Backend
node server.js     # Start Express + Socket.io server (port 5000)
```

---

## 🗺️ Roadmap

- [x] Real-time MediaPipe hand detection
- [x] KNN + ASL rule-based classification
- [x] Custom gesture training
- [x] Supabase Auth (Email + Google)
- [x] Translation history saved to database
- [x] Personal dashboard with charts
- [x] Gesture library & learn mode
- [x] AI chat assistant
- [ ] WebRTC video calls with live subtitles
- [ ] Multi-language support (ASL → BSL → ISL)
- [ ] Mobile app (React Native / Capacitor)
- [ ] Sentence-level AI correction (GPT)

---

## 👤 Author

**Karthikeyan** — [@karthi3656996-ops](https://github.com/karthi3656996-ops)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for the deaf and mute community</p>
  <p><em>Communication is a human right.</em></p>
</div>
