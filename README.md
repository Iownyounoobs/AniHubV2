```
                                                     █████╗ ███╗   ██╗██╗██╗  ██╗██╗   ██╗██████╗
                                                    ██╔══██╗████╗  ██║██║██║  ██║██║   ██║██╔══██╗
                                                    ███████║██╔██╗ ██║██║███████║██║   ██║██████╔╝
                                                    ██╔══██║██║╚██╗██║██║██╔══██║██║   ██║██╔══██╗
                                                    ██║  ██║██║ ╚████║██║██║  ██║╚██████╔╝██████╔╝
                                                    ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝
```

<div align="center">

**`[ FULL-STACK ANIME & DONGHUA STREAMING PLATFORM ]`**

![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=node.js&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-11.0.0-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Stripe](https://img.shields.io/badge/Stripe-18.1.0-635BFF?style=flat-square&logo=stripe&logoColor=white)

*A solo capstone project. Educational use only.*

</div>

---

## `> WHAT IS ANIHUB?`

AniHub is a full-stack anime streaming platform built from scratch as a CS capstone. It aggregates content from **AniWatchTV** through a custom scraping API and delivers it through a cyberpunk-themed React frontend — complete with user auth, a personal watchlist, and Stripe-powered premium subscriptions.

Three independent servers. One cohesive experience.

> **Educational Use Only** — Built as a capstone for Metropolitan State University. Not intended for public distribution or commercial use.

---

## `> ARCHITECTURE`

```
┌─────────────────────────────────────────────────────────┐
│                      ANIHUB SYSTEM                      │
├───────────────┬──────────────────┬──────────────────────┤
│   anihub-ui   │  aniwatchtv-api  │   stripe-backend     │
│   PORT 3000   │    PORT 3001     │     PORT 3002         │
│               │                  │                      │
│  React 19     │  Node.js +       │  Express 5 +         │
│  Styled-Comp  │  TypeScript 5    │  Stripe SDK 18       │
│  Firebase SDK │  Cheerio +       │  Firebase Admin 13   │
│  Axios        │  Puppeteer 24    │                      │
│  Redux TK     │  Crypto-JS       │                      │
│  HLS.js       │  node-cache      │                      │
└───────────────┴──────────────────┴──────────────────────┘
         │               │                    │
         └───────────────┴────────────────────┘
                         │
              ┌──────────┴──────────┐
              │  Firebase / Stripe  │
              │  Firestore  Auth    │
              └─────────────────────┘
```

---

## `> FEATURES`

| Feature | Description |
|---|---|
| **Search & Browse** | Search by title, browse by genre, or filter by origin (Japan / China) |
| **Inline Episode Streaming** | MegaCloud sources iframed directly — plays in-page with a custom overlay player |
| **MegaCloud Decryption** | Custom Crypto-JS pipeline decrypts MegaCloud stream sources on the backend |
| **My List** | Save/remove shows to a personal watchlist stored in Firestore |
| **Premium Access** | Stripe subscription gates Movies and full content — monthly or yearly plan |
| **Auth & Role System** | Firebase Auth + Firestore roles (`isPremium`) with protected routes |
| **Chinese Donghua** | Dedicated `/origin/china` page using studio-keyword detection to filter Chinese anime |
| **Category Browsing** | Top-Airing, Most Popular, Genre pages, Subtype filtering |
| **Latest Episodes** | Live feed of recently updated episodes |
| **Image & M3U8 Proxy** | Backend proxies images and M3U8 playlists to bypass CORS |
| **Rate Limiting & Caching** | `express-rate-limit` + `node-cache` + `p-limit` for stable scraping |

---

## `> TECH STACK`

### Frontend — `anihub-ui`

| Package | Version | Purpose |
|---|---|---|
| React | 19.0.0 | UI framework |
| React Router DOM | 7.3.0 | Client-side routing + protected routes |
| Redux Toolkit | 2.6.0 | Global state management |
| Styled-Components | 6.1.15 | CSS-in-JS for cyberpunk UI |
| Axios | 1.8.2 | HTTP requests to local API |
| Firebase | 11.10.0 | Auth + Firestore client |
| HLS.js | 1.6.15 | HLS stream support |
| React Icons | 5.5.0 | Icon set |

### Anime API — `aniwatchtv-api`

| Package | Version | Purpose |
|---|---|---|
| Express | 5.1.0 | HTTP server |
| TypeScript | 5.8.3 | Type safety across all routes/scrapers |
| Cheerio | 1.0.0 | HTML parsing / scraping |
| Axios | 1.8.4 | HTTP requests to AniWatchTV |
| Puppeteer | 24.8.0 | Browser automation for JS-heavy pages |
| puppeteer-extra-plugin-stealth | — | Bot detection bypass |
| Crypto-JS | 4.2.0 | MegaCloud stream decryption |
| node-cache | 5.1.2 | In-memory response caching |
| p-limit | 6.2.0 | Concurrency throttling |
| express-rate-limit | 7.5.0 | Request rate limiting |

### Stripe Backend — `stripe-backend`

| Package | Version | Purpose |
|---|---|---|
| Express | 5.1.0 | HTTP server |
| Stripe | 18.1.0 | Checkout session + payment handling |
| Firebase Admin | 13.3.0 | Verify ID tokens + write Firestore |

### Cloud Services

| Service | Use |
|---|---|
| **Firebase Authentication** | Email/password login, session management |
| **Firestore** | User profiles, premium status, My List subcollection |

---

## `> API REFERENCE`

All routes served from `http://localhost:3001`

```
GET  /                                            → Health check + AniWatchTV status
GET  /aniwatchtv                                  → Homepage: spotlight, top10, trending, genres
GET  /aniwatchtv/search?keyword=X&page=Y          → Search results with pagination
GET  /aniwatchtv/anime/:id                        → Full anime metadata
GET  /aniwatchtv/episodes/:id                     → Episode list
GET  /aniwatchtv/servers                          → Available streaming servers
GET  /aniwatchtv/episode-srcs                     → Decrypted MegaCloud stream URL
       ?id=X&ep=Y&server=MegaCloud&category=sub
GET  /aniwatchtv/latest                           → Recently updated episodes
GET  /aniwatchtv/:category                        → Category pages (top-airing, most-popular…)
GET  /aniwatchtv/genre/:genre                     → Genre-filtered anime
GET  /aniwatchtv/subtype/:subtype                 → Subtype-filtered anime
GET  /aniwatchtv/donghua?page=Y                   → Chinese anime (studio-keyword filtered)
GET  /aniwatchtv/img?url=X                        → Image proxy (CORS bypass)
GET  /aniwatchtv/proxy?url=X                      → M3U8 stream proxy
```

### Stripe Backend — `http://localhost:3002`

```
POST /create-checkout-session   { uid, plan }          → Stripe checkout URL
POST /mark-premium              Bearer {idToken}        → Sets isPremium: true in Firestore
                                { uid, plan }
```

**Plans:** Monthly — $18/mo &nbsp;|&nbsp; Yearly — $250/yr

---

## `> FIRESTORE SCHEMA`

```
users/
  {uid}/
    ├── email:               string
    ├── isPremium:           boolean
    ├── subscriptionPlan:    "monthly" | "yearly"
    ├── subscribedAt:        Timestamp
    ├── subscriptionEndsAt:  Timestamp
    └── myList/              (subcollection)
          {animeId}/
            └── ...anime card data
```

---

## `> INTERNAL ARCHITECTURE — API`

The scraping API follows a strict layered pattern:

```
Route → Controller → Scraper → Extractor (Cheerio) → Typed Response
```

```
src/
├── routes/          Express router definitions
├── controllers/     Request handlers — orchestrate scraper calls
├── scrapers/        Fetch + parse aniwatchtv.to pages
├── extractors/      Cheerio selectors that pull specific data shapes
├── types/           TypeScript interfaces for every response shape
├── utils/           MegaCloud pipeline, proxies, caching, status checks
└── config/          HTTP headers (User-Agent, cookies, etc.)
```

---

## `> SUBSCRIPTION FLOW`

```
  User clicks "Subscribe"
         │
         ▼
  POST /create-checkout-session
  { uid, plan: "monthly" }
         │
         ▼
  Stripe Checkout ──► Payment ──► Redirect to /subscribed?uid=X&plan=monthly
                                          │
                                          ▼
                               POST /mark-premium
                               Authorization: Bearer {idToken}
                                          │
                                          ▼
                            Firestore: isPremium = true
                            subscriptionEndsAt = now + 30 days
                                          │
                                          ▼
                            ProtectedRoute unlocks Movies + full content
```

---

## `> WHAT I LEARNED`

Building AniHub solo taught me things no classroom could fully replicate:

- **Full-stack separation** — keeping UI, API, and payments as independent servers forces clean interfaces
- **Web scraping at scale** — Cheerio parsing, Puppeteer stealth, rate limiting to avoid blocks
- **Stream decryption** — reverse-engineering MegaCloud's Crypto-JS encryption pipeline
- **Auth + role gating** — Firebase ID tokens, Firestore rules, and ProtectedRoute logic working together
- **Stripe integration** — checkout sessions, webhooks, and syncing payment state back to Firestore
- **TypeScript discipline** — typing every scraper response shape catches bugs before runtime
- **Debugging... a lot. A LOT.** — I now speak `console.log()` as a second language

---

## `> PROJECT PAGES`

| Route | Page | Access |
|---|---|---|
| `/` | Home — spotlight, trending, genres | Public |
| `/search` | Search with pagination | Public |
| `/anime/:id` | Anime details + episode list | Public |
| `/watch` | Inline MegaCloud episode player | Auth |
| `/latest` | Latest episode feed | Auth |
| `/movies` | Movie catalog | **Premium** |
| `/my-list` | Personal watchlist | Auth |
| `/origin/:country` | Japan / China origin filter | Public |
| `/subscribe` | Subscription plans | Auth |
| `/subscribed` | Post-payment confirmation | Auth |
| `/profile` | User profile | Auth |
| `/login` | Login | Public |
| `/signup` | Register | Public |

---

## `> RUNNING LOCALLY`

You need three terminals.

```bash
# Terminal 1 — React UI
cd anihub-ui
npm install
npm start
# → http://localhost:3000

# Terminal 2 — Anime API
cd aniwatchtv-api
npm install
npm run dev
# → http://localhost:3001

# Terminal 3 — Stripe Backend
cd stripe-backend
npm install
node index.js
# → http://localhost:3002
```

**Required `.env` files:**

`anihub-ui/.env`
```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

`stripe-backend/.env`
```
STRIPE_SECRET_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## `> DEVELOPER`

**Jimmie Xiong**
B.S. Computer Science — Metropolitan State University, 2025

Built solo. Late nights. Lots of caffeine. Zero shortcuts.

---

## `> DISCLAIMER`

AniHub is a student capstone project. It does not host, store, or own any video content. All anime data and streams are fetched from third-party sources for educational purposes only. Please support the original content creators and official streaming platforms.

---

<div align="center">

`[ ANIHUB — BUILT WITH CAFFEINE AND CONSOLE.LOG() ]`

</div>
