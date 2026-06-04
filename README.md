# AlgoArena — Deployment Readiness Report

> **Full-Stack LeetCode-style Competitive Coding Platform**  
> Stack: Node.js / Express / MongoDB / Redis · React 19 / Vite / Redux Toolkit · Judge0 / Gemini AI / Cloudinary

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Tech Stack & Services](#2-tech-stack--services)
3. [How the App Works (Full Flow)](#3-how-the-app-works-full-flow)
4. [API Route Map](#4-api-route-map)
5. [Data Models](#5-data-models)
6. [🔴 Critical Bugs (App-Breaking)](#6--critical-bugs-app-breaking)
7. [🟡 Security Vulnerabilities](#7--security-vulnerabilities)
8. [🟠 Functional Issues](#8--functional-issues)
9. [🟢 Minor Issues & Code Quality](#9--minor-issues--code-quality)
10. [⚙️ Deployment Blockers](#10-️-deployment-blockers)
11. [Environment Variables Reference](#11-environment-variables-reference)
12. [Improvement Roadmap (Priority Order)](#12-improvement-roadmap-priority-order)

---

## 1. Project Architecture

```
AlgoArena/
├── backend/                    # Node.js / Express REST API
│   └── src/
│       ├── index.js            # App entry — Express setup, CORS, routes
│       ├── config/
│       │   ├── db.js           # MongoDB connection (Mongoose)
│       │   └── redis.js        # Redis Cloud connection (ioredis)
│       ├── controllers/        # Business logic per domain
│       ├── middleware/         # JWT auth, admin guard, rate limiter
│       ├── models/             # Mongoose schemas (7 models)
│       ├── routes/             # Express routers (6 route groups)
│       └── utils/              # Judge0 submission helper, Zod validators
│
└── frontend/                   # React 19 + Vite SPA
    └── src/
        ├── App.jsx             # React Router v7 route definitions
        ├── main.jsx            # Redux Provider + Router setup
        ├── authSlice.js        # Redux — user session state
        ├── submissionSlice.js  # Redux — code run/submit results
        ├── store/store.js      # Redux store configuration
        ├── utils/axiosClient.js# Axios instance (baseURL, withCredentials)
        ├── pages/              # 10 route-level page components
        └── components/         # 8 reusable components
```

**Architecture Pattern:** Classic Client–Server SPA  
- Frontend is a pure React SPA (no SSR) served from a CDN or static host  
- Backend is a stateless REST API (session state lives in JWT cookies + Redis blocklist)  
- No WebSockets — real-time-like behavior is achieved via polling (Judge0 result polling)

---

## 2. Tech Stack & Services

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 19 + Vite | UI rendering, fast HMR dev experience |
| Routing | React Router v7 | SPA client-side navigation |
| State Management | Redux Toolkit | Auth state, submission results |
| HTTP Client | Axios | API calls with cookie credentials |
| UI | Tailwind CSS v4 + DaisyUI | Utility-first styling + component library |
| Code Editor | Monaco Editor | In-browser code editor (VSCode engine) |
| Backend Runtime | Node.js + Express | REST API server |
| Database | MongoDB Atlas | Persistent data store |
| Cache / Session | Redis Cloud | JWT blocklist (logout), rate limiting |
| Authentication | JWT (cookie-based) | Stateless auth with server-side invalidation |
| Code Execution | Judge0 CE via RapidAPI | Multi-language code execution sandbox |
| AI Chat | Google Gemini 2.5 Flash | Contextual AI hints for problems |
| Video Storage | Cloudinary | Solution video hosting + direct browser upload |
| Password Hashing | bcrypt | Secure password storage |
| Validation | Zod (backend) + react-hook-form + Zod (frontend) | Input validation on both sides |

---

## 3. How the App Works (Full Flow)

### Authentication Flow
1. User registers (`POST /user/register`) — password is bcrypt-hashed, JWT issued as `httpOnly` cookie
2. On every protected request — `userMiddleware` decodes JWT from cookie, checks Redis blocklist, attaches user to `req.result`
3. Logout — JWT added to Redis blocklist with TTL matching token expiry (cannot be reused even if stolen)

### Problem Solving Flow
1. User opens a problem (`GET /problem/problemById/:id`) — gets problem details + starter code templates
2. User writes code in Monaco editor (supports JS, Java, C++)
3. **Run** — sends code + visible test cases to `/submission/run/:id` → backend calls Judge0 batch API → polls until done → returns per-test results
4. **Submit** — sends code + hidden test cases to `/submission/submit/:id` → same Judge0 flow → if all pass, user's `problemSolved[]` array is updated + streak logic runs
5. Results stored in `Submission` collection and displayed in Submission History tab

### Judge0 Execution Flow
```
Client → POST /submission/submit/:id
       → Backend builds batch payload (one per test case)
       → POST to Judge0 batch endpoint
       → Poll GET /submissions/batch?tokens=... every 2s
       → Until all statuses are not "Processing"
       → Evaluate pass/fail, update DB, return response
```

### Daily Problem (POTD) Flow
- `DailyProblem` collection has one document per date (`YYYY-MM-DD`)
- Admin must manually set POTD (no auto-assignment logic exists)
- When a user solves the POTD, `solvedPOTDDates[]` in their user document is updated and streak increments

### Video Editorial Flow
1. Admin requests upload signature from `/video/create/:problemId` (server-side signed)
2. Browser uploads video **directly** to Cloudinary (not through backend server — correct pattern)
3. After upload, browser calls `/video/save` to store metadata (URL, publicId, duration) in DB
4. Users view via custom video player in the Editorial tab

### AI Chat Flow
- User sends message in ChatAi component → `POST /ai/chat` with message + problem context
- Backend calls Gemini 2.5 Flash API → streams plain-text response back
- Chat history maintained in component local state (not persisted)

---

## 4. API Route Map

| Mount | Endpoint | Method | Auth | Handler |
|---|---|---|---|---|
| `/user` | `/register` | POST | None | Register new user |
| `/user` | `/login` | POST | None | Login, set JWT cookie |
| `/user` | `/logout` | POST | User | Invalidate token in Redis |
| `/user` | `/check` | GET | User | Returns current user from cookie |
| `/user` | `/me` | GET | User | Full user profile |
| `/user` | `/admin/register` | POST | Admin | Create admin account |
| `/user` | `/deleteProfile` | DELETE | User | Delete own account |
| `/problem` | `/create` | POST | Admin | Create new problem |
| `/problem` | `/update/:id` | PUT | Admin | Update problem |
| `/problem` | `/delete/:id` | DELETE | Admin | Delete problem |
| `/problem` | `/problemById/:id` | GET | User | Get single problem |
| `/problem` | `/getAllProblem` | GET | User | Get all problems |
| `/problem` | `/problemSolvedByUser` | GET | User | Get problems solved by user |
| `/problem` | `/submittedProblem/:pid` | GET | User | Get user submissions for problem |
| `/problem` | `/potd` | GET | None | Get today's problem of the day |
| `/problem` | `/previous` | GET | None | Get previous 3 POTDs |
| `/submission` | `/submit/:id` | POST | User + RateLimit (3/min) | Submit code for evaluation |
| `/submission` | `/run/:id` | POST | User + RateLimit (5/min) | Run code against visible tests |
| `/ai` | `/chat` | POST | User | Chat with Gemini AI |
| `/video` | `/create/:problemId` | GET | Admin | Generate Cloudinary upload signature |
| `/video` | `/save` | POST | Admin | Save video metadata after upload |
| `/video` | `/delete/:problemId` | DELETE | Admin | Delete video |
| `/discuss` | `/all` | GET | None | Get all discussions |
| `/discuss` | `/get/:id` | GET | None | Get single discussion |
| `/discuss` | `/create` | POST | User | Create new discussion post |
| `/discuss` | `/comment/:id` | POST | User | Add comment to discussion |
| `/discuss` | `/vote/:id` | PUT | User | Upvote/downvote discussion |
| `/discuss` | `/delete/:id` | DELETE | User | Delete own discussion |
| `/discuss` | `/comment/:id` | DELETE | User | Delete own comment |

---

## 5. Data Models

### User
```
firstName, emailId (unique, immutable), password (bcrypt),
role (user/admin), problemSolved[], streak { current, longest, lastSolvedDate },
solvedPOTDDates[], createdAt, updatedAt
```

### Problem
```
title, description, difficulty (easy/medium/hard),
tags (array/linkedList/graph/dp), visibleTestCases[],
hiddenTestCases[], startCode[], referenceSolution[], problemCreator
```

### Submission
```
userId, problemId, code, language, status (pending/accepted/wrong/error),
runtime, memory, errorMessage, testCasesPassed, testCasesTotal
```

### Discussion
```
title, content, category (6 types), author,
upvotes[], downvotes[], views, comments[]
```

### Comment
```
content, author, discussionId
```

### SolutionVideo
```
problemId (unique), userId, cloudinaryPublicId (unique),
secureUrl, thumbnailUrl, duration
```

### DailyProblem
```
date (unique YYYY-MM-DD string), problemId
```

---

## 6. 🔴 Critical Bugs (App-Breaking)

These will cause **crashes, data loss, or complete feature failure** in production.

---

### BUG-01 — Login crashes when user doesn't exist

**File:** `backend/src/controllers/userAuthent.js` — `login` function  
**Impact:** App crashes with unhandled TypeError, leaks raw error to client

**What happens:**  
When a user enters an email that doesn't exist in the database, `User.findOne()` returns `null`. The very next line calls `bcrypt.compare(password, user.password)` — since `user` is `null`, this throws `TypeError: Cannot read properties of null (reading 'password')`. The error is caught and sent as `res.status(401).send("Error: " + err)` — exposing the raw error string to the client.

**Fix needed:** Add a null check before `bcrypt.compare`. If `!user`, throw a generic "Invalid credentials" error immediately.

---

### BUG-02 — Double response crash in `submittedProblem`

**File:** `backend/src/controllers/userProblem.js` — `submittedProblem` function  
**Impact:** Node.js "Cannot set headers after they are sent to the client" error every time a user has zero submissions for a problem

**What happens:**
```js
if (ans.length == 0)
  res.status(200).json([]);  // ← response sent here
res.status(200).send(ans);   // ← SECOND response sent immediately after (no return)
```
Missing `return` before the first `res.send` causes a double-response error on every empty result.

**Fix needed:** Add `return` before `res.status(200).json([])`.

---

### BUG-03 — Rate limiter is completely non-functional (per-user limiting broken)

**File:** `backend/src/middleware/rateLimiter.js`  
**Impact:** Per-user rate limiting doesn't work at all; users can bypass limits trivially

**What happens:**  
The rate limiter reads `req.user._id` to build the Redis key, but the auth middleware sets `req.result` (not `req.user`). `req.user` is always `undefined`, so the limiter always falls back to IP-based limiting. Any user with a VPN or dynamic IP can bypass submission rate limits entirely and flood Judge0 with requests.

**Fix needed:** Change `req.user` to `req.result` in the rate limiter middleware.

---

### BUG-04 — Judge0 polling has no timeout (infinite loop)

**File:** `backend/src/utils/problemUtility.js` — `submitToken` function  
**Impact:** If Judge0 is slow or down, the Node.js request hangs forever, tying up server resources until the process is killed

**What happens:**
```js
while (true) {
  // polls Judge0 every 2 seconds
  // no maximum retry count, no timeout
}
```
If Judge0 returns a queued/processing status indefinitely, this loop never exits.

**Fix needed:** Add a max retry counter (e.g., 15 retries = 30s timeout) and throw a timeout error if exceeded.

---

### BUG-05 — `deleteProfile` does not clean up submissions (cascade broken)

**File:** `backend/src/controllers/userAuthent.js` — `deleteProfile`  
**Impact:** Orphaned submission documents accumulate in the database permanently

**What happens:**  
The `Submission.deleteMany({ userId })` cleanup call is commented out. Additionally, the `User` model has a `post('findOneAndDelete')` hook to clean submissions, but `deleteProfile` uses `findByIdAndDelete` — so that hook never fires.

**Fix needed:** Uncomment the `Submission.deleteMany` call. Also clean up `Discussion` and `Comment` documents authored by the deleted user.

---

### BUG-06 — Video thumbnails are broken in Editorial

**File:** `backend/src/controllers/videoSection.js` — `saveVideoMetadata`  
**Impact:** The `poster` image on every solution video player is broken

**What happens:**  
`cloudinary.image()` returns an HTML `<img>` tag string (e.g., `<img src="..." />`), not a URL. This HTML string is stored in MongoDB as `thumbnailUrl` and passed as the `poster` attribute to the `<video>` element — which expects a URL, not HTML. Every video poster will be blank/broken.

**Fix needed:** Replace `cloudinary.image(...)` with `cloudinary.url(...)` to get a plain URL string.

---

## 7. 🟡 Security Vulnerabilities

These don't crash the app but expose it to attacks or unauthorized access.

---

### SEC-01 — JWT cookies missing security flags

**File:** `backend/src/controllers/userAuthent.js` — all `res.cookie()` calls  
**Risk:** Cookie is accessible via JavaScript (XSS can steal it); no CSRF protection

**What happens:**
```js
res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
// Missing: httpOnly, secure, sameSite
```
- Without `httpOnly: true` — any XSS attack can read the JWT via `document.cookie`
- Without `secure: true` — cookie sent over HTTP (not just HTTPS) in production
- Without `sameSite: 'strict'` — vulnerable to CSRF attacks

**Fix needed:**
```js
res.cookie('token', token, {
  maxAge: 60 * 60 * 1000,
  httpOnly: true,
  secure: true,          // only over HTTPS
  sameSite: 'strict'
});
```

---

### SEC-02 — `adminRegister` allows arbitrary role injection via request body

**File:** `backend/src/controllers/userAuthent.js` — `adminRegister`  
**Risk:** An authenticated admin can create accounts with any role or field injected via request body

**What happens:**  
The controller calls `User.create({ ...req.body, password: hashedPassword })`. If an attacker (or rogue admin) sends `{ role: "admin", ... }` in the body, the new user is created with `role: "admin"`. Since `req.body` is spread first, the `role` field from the body is persisted unless explicitly overridden after the spread.

**Fix needed:** Destructure only the allowed fields (`firstName`, `emailId`, `password`) from `req.body` and explicitly set `role: 'admin'`.

---

### SEC-03 — Error messages leak implementation details

**File:** `backend/src/controllers/userAuthent.js`  
**Risk:** Internal error messages (including stack traces) are sent to the client

**What happens:**
```js
res.status(401).send("Error: " + err);
```
This exposes raw Node.js error messages to any client, revealing internal implementation details useful to attackers.

**Fix needed:** Always return generic messages like `"Invalid credentials"` or `"Something went wrong"` to the client. Log the real error server-side only.

---

### SEC-04 — No Helmet.js or security headers

**File:** `backend/src/index.js`  
**Risk:** Missing standard HTTP security headers (X-Frame-Options, CSP, HSTS, etc.)

**Fix needed:** Add `helmet` package. One line: `app.use(helmet())` sets a safe default for all security headers.

---

### SEC-05 — No global request size limit

**File:** `backend/src/index.js`  
**Risk:** A user could send a massive JSON payload (e.g., a 100MB code submission) and cause a memory spike or denial of service

**Fix needed:** Add `app.use(express.json({ limit: '1mb' }))` (or appropriate limit for code submissions).

---

### SEC-06 — CORS hardcoded to `localhost:5173`

**File:** `backend/src/index.js`  
**Risk:** The entire backend is broken on any deployed environment without code changes

**What happens:**
```js
origin: "http://localhost:5173"
```
Any browser request from the deployed frontend domain will be blocked by CORS.

**Fix needed:** Read the allowed origin from an environment variable: `origin: process.env.ALLOWED_ORIGIN`.

---

### SEC-07 — No HTTPS enforcement in production

The app currently has no redirect from HTTP to HTTPS and no HSTS header. In a cloud deployment, all traffic should be HTTPS-only.

**Fix needed:** Use `helmet` (includes HSTS) + configure your cloud provider/load balancer to terminate SSL and redirect HTTP → HTTPS.

---

## 8. 🟠 Functional Issues

These cause incorrect behavior that users will notice.

---

### FUNC-01 — No session recovery on token expiry (silent 401s)

**File:** `frontend/src/utils/axiosClient.js`  
**Impact:** When a user's JWT expires (1 hour), all API calls silently fail with 401 — the user sees broken UI instead of being redirected to login

**Fix needed:** Add an Axios response interceptor that catches 401 responses and redirects to `/login` with a toast notification.

---

### FUNC-02 — Homepage company tags are randomly re-generated on every load

**File:** `frontend/src/pages/Homepage.jsx`  
**Impact:** Company tags assigned to problems are random and change on every page refresh — they are not real data

The company tags are cosmetic placeholders generated with `Math.random()`. This is misleading for users who expect real company data. Either remove them or associate real company data with problems in the DB.

---

### FUNC-03 — UserProfile has hardcoded problem counts

**File:** `frontend/src/pages/UserProfile.jsx`  
**Impact:** Progress bars and solve-rate percentages become wrong as admins add more problems

```js
const TOTAL_COUNTS = { total: 24, easy: 10, medium: 8, hard: 6 };
```
This needs to be derived from a live API call (e.g., `GET /problem/getAllProblem` count).

---

### FUNC-04 — No POTD auto-assignment mechanism

**Impact:** Admins must manually set the Problem of the Day every single day, or the POTD page shows an error

There is no scheduler (cron job) to automatically assign a new POTD daily. In a production environment with real users, this will break every day the admin forgets.

**Fix needed:** Add a node-cron job that picks a random unsolved problem as the daily POTD at midnight UTC.

---

### FUNC-05 — Discussion list fetches all posts, filters client-side

**File:** `frontend/src/pages/DiscussionList.jsx`  
**Impact:** As discussions grow, this will become very slow

The backend supports `?category=` query params, but the frontend always fetches everything and filters in JavaScript. With 1000+ discussions this will waste bandwidth and slow down the app.

**Fix needed:** Pass the active category filter as a query param to the backend fetch call.

---

### FUNC-06 — No pagination on `getAllProblem`

**File:** `backend/src/controllers/userProblem.js` + `frontend/src/pages/Homepage.jsx`  
**Impact:** As the problem set grows, the entire problem list is fetched on every homepage load

**Fix needed:** Add `page` and `limit` query params to `getAllProblem` and implement frontend pagination or infinite scroll.

---

### FUNC-07 — `updateProblem` validates reference solution only against visible test cases

**File:** `backend/src/controllers/userProblem.js` — `updateProblem`  
**Impact:** Hidden test cases are never validated when a problem is updated — a problem can have broken hidden tests silently

**Fix needed:** Run the reference solution validation against all test cases (visible + hidden), not just visible ones.

---

## 9. 🟢 Minor Issues & Code Quality

These are lower priority but should be fixed before a public launch.

---

### MINOR-01 — Typo: "Week Password" in validator

**File:** `backend/src/utils/validator.js`  
`"Week Password"` should be `"Weak Password"`.

---

### MINOR-02 — `index.html` still has default Vite title

**File:** `frontend/index.html`  
Title is `"Vite + React"`. Should be `"AlgoArena"` or the actual app name.

---

### MINOR-03 — No loading states on several pages

Several pages (`UserProfile`, `DiscussionDetail`, `POTDPage`) show nothing while fetching — no spinner, no skeleton. This gives the impression the page is broken on slow connections.

---

### MINOR-04 — No 404 / Not Found route

**File:** `frontend/src/App.jsx`  
There is no catch-all `<Route path="*">` component. Any invalid URL shows a blank white page.

**Fix needed:** Add a `<Route path="*" element={<NotFound />} />` catch-all.

---

### MINOR-05 — No error boundary in React

If any component throws during render (e.g., a null reference when API returns unexpected data), the entire app goes blank with no user-friendly message.

**Fix needed:** Wrap the app (or major page-level routes) in a React `<ErrorBoundary>` component.

---

### MINOR-06 — Streak calculation has no timezone handling

**File:** `backend/src/controllers/userSubmission.js`  
Streak is calculated by comparing dates as strings (`YYYY-MM-DD`). The server's timezone determines what "today" is. If your server is in UTC and users are in US timezones, a submission at 11pm EST might count for the wrong day.

**Fix needed:** Store and compare dates in UTC consistently, or accept a timezone offset from the client.

---

### MINOR-07 — Admin can register infinite admin accounts with no audit trail

Once you have one admin account, `POST /user/admin/register` lets you create unlimited admin accounts. There is no logging of who created which admin. In a real deployment, admin creation should be logged and ideally limited.

---

### MINOR-08 — No health check endpoint

**File:** `backend/src/index.js`  
Cloud platforms (Railway, Render, AWS ECS, etc.) need a health check endpoint to know the app is alive.

**Fix needed:** Add `app.get('/health', (req, res) => res.json({ status: 'ok' }))`.

---

## 10. ⚙️ Deployment Blockers

These **must be resolved** before the app can be deployed successfully.

| # | Blocker | Where | What to do |
|---|---|---|---|
| 1 | CORS hardcoded to `localhost:5173` | `backend/src/index.js` | Move to `process.env.ALLOWED_ORIGIN` |
| 2 | Axios `baseURL` hardcoded to `http://localhost:3000` | `frontend/src/utils/axiosClient.js` | Use Vite env var `import.meta.env.VITE_API_URL` |
| 3 | `.env` file must NOT be committed to git | `backend/.env` | Add to `.gitignore`, use cloud provider's secret manager |
| 4 | Cookies missing `secure: true` | `backend/src/controllers/userAuthent.js` | Cookies won't be set in HTTPS without this flag |
| 5 | No `PORT` env variable fallback | `backend/src/index.js` | Cloud platforms assign dynamic ports via `process.env.PORT` |
| 6 | No health check route | `backend/src/index.js` | Required by most cloud platforms for uptime monitoring |
| 7 | Judge0 polling timeout missing | `backend/src/utils/problemUtility.js` | Will hang Node.js process under load |

---

## 11. Environment Variables Reference

### Backend `.env` (required keys)

```env
# Server
PORT=3000

# MongoDB
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/<dbname>

# Redis
REDIS_URL=redis://:<password>@<host>:<port>

# JWT
JWT_SECRET=<strong-random-secret>

# Judge0
JUDGE0_API_KEY=<rapidapi-key>
JUDGE0_HOST=judge0-ce.p.rapidapi.com

# Gemini AI
GEMINI_API_KEY=<google-ai-key>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# CORS
ALLOWED_ORIGIN=https://your-frontend-domain.com
```

### Frontend `.env` (Vite)

```env
VITE_API_URL=https://your-backend-domain.com
```

---

## 12. Improvement Roadmap (Priority Order)

### Phase 1 — Must fix before any deployment

| Priority | Fix |
|---|---|
| 🔴 P1 | Rotate all credentials currently in `.env` (treat as compromised) |
| 🔴 P1 | Add `backend/.env` to `.gitignore` if not already excluded |
| 🔴 P1 | Fix BUG-01: null user crash in `login` |
| 🔴 P1 | Fix BUG-02: double response in `submittedProblem` (add `return`) |
| 🔴 P1 | Fix BUG-03: rate limiter using `req.result` instead of `req.user` |
| 🔴 P1 | Fix BUG-04: add timeout/max-retry to Judge0 polling loop |
| 🔴 P1 | Fix SEC-01: add `httpOnly`, `secure`, `sameSite` to all cookies |
| 🔴 P1 | Fix SEC-06: CORS origin from environment variable |
| 🔴 P1 | Fix frontend Axios `baseURL` to use `VITE_API_URL` env var |
| 🔴 P1 | Add `PORT` env variable support in `backend/src/index.js` |
| 🔴 P1 | Add `/health` endpoint to backend |

### Phase 2 — Fix before public user traffic

| Priority | Fix |
|---|---|
| 🟡 P2 | Fix BUG-05: cascade delete submissions when user deletes profile |
| 🟡 P2 | Fix BUG-06: `cloudinary.image()` → `cloudinary.url()` for thumbnails |
| 🟡 P2 | Fix SEC-02: `adminRegister` must not accept `role` from request body |
| 🟡 P2 | Fix SEC-03: never send raw error strings to the client |
| 🟡 P2 | Fix SEC-04: add `helmet` for security headers |
| 🟡 P2 | Fix SEC-05: add request body size limit (`express.json({ limit: '1mb' })`) |
| 🟡 P2 | Fix FUNC-01: add Axios 401 interceptor to redirect to `/login` |
| 🟡 P2 | Fix FUNC-04: add cron job for daily POTD auto-assignment |
| 🟡 P2 | Fix MINOR-04: add 404 catch-all route in React Router |
| 🟡 P2 | Fix MINOR-05: add React ErrorBoundary |

### Phase 3 — Polish and scalability

| Priority | Fix |
|---|---|
| 🟢 P3 | Fix FUNC-02: remove random company tags or store real data in DB |
| 🟢 P3 | Fix FUNC-03: derive problem counts from live API in UserProfile |
| 🟢 P3 | Fix FUNC-05: pass category filter as query param to backend |
| 🟢 P3 | Fix FUNC-06: add pagination to problem list |
| 🟢 P3 | Fix FUNC-07: validate reference solution against all test cases on update |
| 🟢 P3 | Fix MINOR-01: typo "Week Password" → "Weak Password" |
| 🟢 P3 | Fix MINOR-02: update `index.html` title to app name |
| 🟢 P3 | Fix MINOR-03: add loading skeletons to UserProfile, DiscussionDetail |
| 🟢 P3 | Fix MINOR-06: consistent UTC date handling for streak |
| 🟢 P3 | Add JWT refresh token mechanism (current 1h expiry with no refresh) |
| 🟢 P3 | Add request logging (Morgan or Pino) for production observability |
| 🟢 P3 | Add database indexes on frequently queried fields (userId, problemId, date) |

---

*This document was generated as a pre-deployment audit. No code changes have been made. All fixes require explicit approval before implementation.*
