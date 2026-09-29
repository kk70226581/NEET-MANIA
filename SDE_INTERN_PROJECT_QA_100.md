# 100 SDE Intern Interview Questions & Answers
### Complete Technical Interview Preparation Guide for NEET-MANIA / Solnut CBT Platform

---

## Table of Contents
1. [Project Overview & Architecture (Q1 – Q10)](#1-project-overview--architecture)
2. [Backend Engineering & API Design (Q11 – Q30)](#2-backend-engineering--api-design)
3. [Database & MongoDB Architecture (Q31 – Q45)](#3-database--mongodb-architecture)
4. [AI Engine, Bedrock & LLM Integration (Q46 – Q65)](#4-ai-engine-bedrock--llm-integration)
5. [Frontend Engineering & React (Q66 – Q80)](#5-frontend-engineering--react)
6. [Security, Auth & Session Management (Q81 – Q90)](#6-security-auth--session-management)
7. [System Design, DevOps & Scalability (Q91 – Q100)](#7-system-design-devops--scalability)

---

## 1. Project Overview & Architecture

### Q1: Can you give an elevator pitch of this project?
**Answer:**
NEET-MANIA (Solnut) is a full-stack, AI-powered Computer-Based Test (CBT) and mentorship platform tailored for NEET (National Eligibility cum Entrance Test) aspirants. It features real-time exam simulations matching NTA test formats, high-yield question banks with automated AI question auditing, performance analytics with forgetting-curve retention tracking, and an AI mentor ("NEET Bhaiya") integrated with AWS Bedrock, Google Gemma, and Groq for conversational doubt resolution.

### Q2: What is the high-level architecture of the system?
**Answer:**
The system follows a decoupled 3-tier client-server architecture:
1. **Client Tier**: A React 18 Single-Page Application (SPA) styled with TailwindCSS and Framer Motion, utilizing Redux Toolkit for user auth and state.
2. **Application Tier**: A Node.js and Express RESTful API server handling business logic, authentication, PDF parsing, socket connections, and AI routing.
3. **Data & AI Tier**: MongoDB Atlas for flexible JSON document storage, AWS Bedrock / Google AI Studio / Groq for LLM inferencing, and Cloudinary for question asset storage.

### Q3: Why did you choose Node.js and Express for the backend?
**Answer:**
NEET exam platforms require high I/O throughput (submitting question answers, timer synchronization, streaming chat responses) with non-blocking event loops. Node.js handles thousands of concurrent lightweight I/O requests efficiently on a single thread. Express provides minimal, flexible middleware chaining (`authenticate`, `isAdmin`, request loggers, rate limiters) without heavyweight framework overhead.

### Q4: Why did you select MongoDB over a relational database like PostgreSQL?
**Answer:**
Questions in medical entrance exams have diverse, semi-structured schemas: standard MCQs, assertion-reason pairs, column-matching tables, and image-based anatomical diagrams. MongoDB's polymorphic document model allows options, diagrams, explanations, and tagging hierarchies to be nested inside a single document without complex multi-table JOINs, enabling rapid reads during live test delivery.

### Q5: How do the frontend and backend communicate?
**Answer:**
Primarily over HTTP/REST via an Axios API client configured with interceptors that attach Bearer JWT tokens to `Authorization` headers. For real-time CBT monitoring and socket events, Socket.io is integrated on port 5001.

### Q6: What was your specific role in building this project?
**Answer:**
As full-stack developer, I engineered the unified multi-provider AI client supporting AWS Bedrock, Google Gemma, and Groq; built the resilient NEET Bhaiya chat routing engine with offline fallback mechanisms; created the Admin Command Center for system telemetry and live AI diagnostics; and developed the core CBT test generation, scoring, and analytics pipelines.

### Q7: What are the main user personas supported by the platform?
**Answer:**
1. **Student / Aspirant**: Can attempt timed CBT mocks, review mistakes, interact with the AI doubt bot, and practice PYQs.
2. **Administrator / Content Owner**: Can monitor server health, test AI models, review draft questions, manage student accounts, and publish test papers.

### Q8: What design patterns did you implement in the backend?
**Answer:**
- **Middleware Pattern**: Express pipeline for auth, logging, and error handling.
- **Factory / Router Pattern**: `geminiClient.js` dynamically instantiates and routes requests to Bedrock, Gemma, Groq, or OpenAI based on runtime environment variables.
- **Singleton Pattern**: Caching the `BedrockRuntimeClient` instance to prevent socket exhaustion.
- **Repository / Service Pattern**: Isolating database operations into controller and service modules (e.g. `testGenerator.js`, `retentionEngine.js`).

### Q9: What third-party cloud services are integrated?
**Answer:**
- **AWS Bedrock**: Foundation model inference (Amazon Nova Lite, Anthropic Claude 3 Haiku).
- **Google AI Studio**: Gemma 2 and Gemini 2.0 Flash APIs.
- **Groq Cloud**: Low-latency LPU inference for Gemma 2.
- **MongoDB Atlas**: Managed multi-region database cluster.
- **Cloudinary**: Media CDN for question diagrams and formulas.
- **Render & Vercel**: Cloud deployment platforms for backend and frontend.

### Q10: What are the biggest technical challenges you solved in this project?
**Answer:**
1. Eliminating AI chatbot downtime by engineering an automatic failover router between AWS Bedrock, Google Gemma, and local rule-based mentorship fallbacks.
2. Real-time CBT timer accuracy across browser tab switches and network reconnections.
3. Parsing messy, scanned NCERT PDF questions into clean, structured JSON schemas using OCR and regex pipelines.

---

## 2. Backend Engineering & API Design

### Q11: How do Express middlewares work in this codebase?
**Answer:**
Middlewares are functions with access to `req`, `res`, and `next`. They form an interceptor chain. For example, `authenticate` extracts and verifies the Bearer token from the `Authorization` header, decodes the user ID, attaches `req.userId` and `req.user`, and calls `next()`. If invalid, it halts the chain with a `401 Unauthorized`.

### Q12: How is role-based authorization enforced?
**Answer:**
Through composed middleware. A protected admin endpoint uses `router.get('/overview', authenticate, isAdmin, getOverview)`. `authenticate` populates `req.user`, and `isAdmin` verifies `req.user.role === 'admin'`. If false, it returns `403 Forbidden`.

### Q13: How does the application handle asynchronous errors without crashing?
**Answer:**
We use `express-async-errors`, which monkey-patches Express routing so unhandled Promise rejections in `async/await` route handlers are automatically forwarded to Express's global error handler (`(err, req, res, next) => res.status(500).json(...)`), preventing uncaught exception crashes.

### Q14: Explain the request-response lifecycle for `/api/mentor/chat`.
**Answer:**
1. Client POSTs `{ conversationId, message }` with JWT header.
2. `authenticate` middleware verifies JWT and attaches `req.userId`.
3. Handler validates payload; retrieves conversation by `conversationId` and `user: req.userId` (preventing IDOR attacks).
4. Appends student's message to MongoDB document.
5. Formats the last 16 message pairs into an conversational context prompt.
6. Calls `getGeminiText()`, which queries AWS Bedrock / Gemma.
7. If the cloud AI fails or times out, the `try/catch` catches it and invokes `generateFallbackMentorReply()`.
8. Saves AI response to MongoDB and returns HTTP 200 with message payload.

### Q15: How did you implement the fallback mechanism in `mentor.js`?
**Answer:**
In `backend/src/routes/mentor.js`, we wrapped the LLM call in a resilient try/catch block. If cloud LLM calls fail due to rate limits or missing credentials, `generateFallbackMentorReply(cleanMessage, studentName)` analyzes keywords (e.g. kinematics, organic reagents, genetics, mock scores, anxiety) and returns an empathetic, pedagogically sound NEET Bhaiya response with NCERT guidance, ensuring the student never sees a broken chat screen.

### Q16: How do you prevent Insecure Direct Object References (IDOR) in test attempts?
**Answer:**
When a student fetches an attempt or conversation (e.g. `GET /mentor/conversations/:id`), the query never relies solely on `_id`. It always checks `{ _id: req.params.id, user: req.userId }`. Even if a user guesses another user's MongoDB ObjectId, the query returns `404 Not Found`.

### Q17: What is the purpose of `express.json({ limit: '50mb' })`?
**Answer:**
Medical entrance tests include questions with base64-encoded SVG graphs, organic chemistry chemical structures, and bulk JSON imports. The default Express 100kb limit rejects these with `413 Payload Too Large`. Increasing it to 50mb allows bulk question imports and OCR payloads.

### Q18: How is CORS configured, and why is origin validation important?
**Answer:**
CORS is configured using a dynamic whitelist `Set` containing production domains (`https://medicalmania.site`, `https://neet-mania.vercel.app`) and local development URLs. Requests with forbidden origins are rejected with `CORS blocked request`. Non-browser health-checks without an `Origin` header are allowed through.

### Q19: How do you handle file uploads in the backend?
**Answer:**
Using `multer` with memory storage or disk storage in temporary scratch folders. For PDFs, `pdf-parse` extracts raw text streams. For images, `tesseract.js` executes local OCR before passing content to regex classifiers or LLMs.

### Q20: What is the difference between `req.params`, `req.query`, and `req.body`?
**Answer:**
- `req.params`: URL route parameters defined in path, e.g. `/api/tests/:testId` (`req.params.testId`).
- `req.query`: URL query string parameters after `?`, e.g. `/api/questions?subject=physics&limit=20`.
- `req.body`: Parsed payload sent in HTTP POST/PUT/PATCH request bodies.

### Q21: What HTTP status codes do you return, and what does each signify?
**Answer:**
- `200 OK`: Successful read or update.
- `201 Created`: Resource successfully created (e.g. new test attempt or user registration).
- `400 Bad Request`: Validation failure or missing required fields.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated user lacks permission (e.g., student calling admin route).
- `404 Not Found`: Entity does not exist.
- `503 Service Unavailable`: Server misconfigured (e.g., admin credentials invalid).

### Q22: How does the `/api/admin/overview` aggregation work?
**Answer:**
It executes parallel `Promise.all` queries including `countDocuments` for students, questions, and tests, alongside MongoDB Aggregation Pipelines to group questions by subject (`$group: { _id: '$subject', count: { $sum: 1 } }`), returning aggregated platform metrics in a single round-trip.

### Q23: Why do we use `select('+password')` in authentication queries?
**Answer:**
In the Mongoose User schema, the `password` field is defined with `select: false` so that student queries never accidentally leak password hashes in JSON responses. During login, `select('+password')` explicitly opts in to retrieve the hash for `bcrypt.compare()`.

### Q24: What is the purpose of `express.urlencoded({ extended: true })`?
**Answer:**
It parses URL-encoded bodies using the `qs` library, enabling rich nested object and array parsing from standard HTML form submissions.

### Q25: How do you manage environment variables between local dev and cloud production?
**Answer:**
Locally, `dotenv` loads variables from `.env`. In production (Render/Vercel), environment variables are injected at runtime via the platform dashboard, preventing secrets from ever being committed to Git.

### Q26: How does the question classification pipeline work?
**Answer:**
When raw question text is imported, a regex and keyword heuristics engine checks for subject markers (e.g., "Le Chatelier", "mitosis", "kinematics"). It assigns subject, chapter, and estimated difficulty. If confidence is low, it calls the LLM batch classifier for classification.

### Q27: How is input validation handled?
**Answer:**
Using `joi` and `express-validator` to sanitize and validate input types, string lengths, regex email patterns, and enum constraints before requests reach controllers.

### Q28: How do you measure backend uptime and memory usage in production?
**Answer:**
In `adminController.js`, `process.uptime()` reports seconds since node process started, and `process.memoryUsage().rss` reports resident memory size in bytes, surfaced to the admin dashboard.

### Q29: What happens if an admin password is not provided on Render?
**Answer:**
In `authController.js`, we implemented default fallback logic: if `ADMIN_PASSWORD` is unset or default, it falls back to `12345678` and email `admin@gmail.com`, preventing total lockout while allowing custom overrides via environment variables.

### Q30: How would you implement rate limiting on the backend?
**Answer:**
By integrating `express-rate-limit` using an in-memory or Redis-backed sliding window counter, restricting each IP to e.g. 100 requests per 15-minute window for standard APIs and 5 attempts per 15 minutes for `/api/auth/login`.

---

## 3. Database & MongoDB Architecture

### Q31: What are the primary Mongoose schemas in this platform?
**Answer:**
- `User`: Personal info, email, hashed password, role (`student` | `admin`), subscription tier, active status.
- `Question`: Question text, options `{A, B, C, D}`, correct answer, explanation, subject, chapter, difficulty, review status, verifiedBy.
- `Test`: Title, duration minutes, total marks, subject rules, question IDs array, publication status.
- `TestAttempt`: User ref, test ref, answers map, score, accuracy, time spent per question, completedAt.
- `MentorConversation`: User ref, title, messages array `{sender: 'user'|'ai', text, createdAt}`.

### Q32: What indexes did you create in MongoDB and why?
**Answer:**
- `Question`: Compound index on `{ subject: 1, chapter: 1, difficulty: 1, isPublished: 1 }` to enable sub-10ms queries when generating randomized test sets.
- `TestAttempt`: Compound index on `{ user: 1, createdAt: -1 }` for rapid retrieval of student attempt histories.
- `User`: Unique index on `{ email: 1 }` to guarantee email uniqueness at the database level.

### Q33: How does MongoDB's `bulkWrite` optimize database operations?
**Answer:**
During question bank seeding or batch PDF imports, writing questions one-by-one results in N round-trips over the network. Using `Question.bulkWrite()` with `updateOne` and `{ upsert: true }` sends hundreds of operations in a single network packet, reducing import time from minutes to seconds.

### Q34: What is the difference between `$set` and `$setOnInsert` in Mongoose?
**Answer:**
- `$set`: Applied every time the document matches or is created (e.g. updating question text and `updatedAt`).
- `$setOnInsert`: Applied only if the operation creates a new document (e.g. setting `createdAt: new Date()`), preserving original creation timestamps on updates.

### Q35: How is a student's test score calculated atomically?
**Answer:**
When an attempt is submitted, the controller fetches the original questions using IDs from the attempt. It loops over student responses, increments `correctCount` or `wrongCount`, applies NEET marking rules (+4 for correct, -1 for wrong, 0 for unattempted), and saves the `TestAttempt` document.

### Q36: How do you handle schema versioning in Mongoose?
**Answer:**
By maintaining schema migration scripts and using schema fields such as `schemaVersion: { type: Number, default: 1 }`. Mongoose's built-in `__v` handles optimistic concurrency control to prevent concurrent overwrite bugs.

### Q37: What is an Aggregation Pipeline in MongoDB? Give an example from your project.
**Answer:**
An aggregation pipeline processes documents through multi-stage transformations. In `adminController.js`:
```javascript
Question.aggregate([
  { $group: { _id: '$subject', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```
Stage 1 groups all question documents by `subject` and sums counts; Stage 2 sorts them descending by count.

### Q38: How do you prevent duplicate questions from being imported?
**Answer:**
Before inserting, question texts are normalized (trimmed, lowercased, whitespace collapsed) and matched against existing questions using exact string matching or fuzzy hashing. If found, the insertion is skipped or updated.

### Q39: What is the difference between `.find().lean()` and standard `.find()`?
**Answer:**
Standard `.find()` wraps documents in full Mongoose Document instances with getters, setters, change tracking, and methods. Calling `.lean()` returns plain JavaScript objects, consuming ~70% less memory and speeding up read queries by 3–5x.

### Q40: How does Mongoose handle soft deletes vs hard deletes?
**Answer:**
For questions and user accounts, we prefer soft deletes by setting `isArchived: true` or `isActive: false` rather than `deleteOne()`. This preserves foreign key references in historical `TestAttempt` analytics.

### Q41: How is the Forgetting Curve / Spaced Repetition tracked in the database?
**Answer:**
The `retentionEngine.js` tracks mistake timestamps. Each mistake record stores `repetitionStage`, `nextReviewDate`, and `easeFactor`. When a student reviews a mistake, the ease factor adjusts interval spacing based on the SM-2 algorithm.

### Q42: What is the risk of an unindexed query in MongoDB?
**Answer:**
An unindexed query performs a `COLLSCAN` (collection scan), reading every single document in the collection from disk or RAM into memory. On 100,000 questions, this turns a 2ms query into a 5-second blocking operation that consumes 100% CPU.

### Q43: How do you handle connection pooling in Mongoose?
**Answer:**
`mongoose.connect()` maintains an internal connection pool (default `maxPoolSize: 100`). Concurrent requests reuse existing open TCP sockets to MongoDB Atlas rather than paying the handshake latency for every request.

### Q44: What are Mongoose Virtuals and did you use any?
**Answer:**
Virtuals are document properties that can be read and set but are not persisted to MongoDB. For example, a virtual `fullName` on the User schema computes `${this.firstName} ${this.lastName}` dynamically.

### Q45: How do you back up and seed your MongoDB database?
**Answer:**
We created automated seed scripts ([seedDatabase.js](file:///c:/Users/user/Desktop/TEST/backend/src/scripts/seedDatabase.js)) that connect to `MONGODB_URI`, ensure admin accounts exist, and seed published demo questions across Biology, Chemistry, and Physics.

---

## 4. AI Engine, Bedrock & LLM Integration

### Q46: How does the unified AI client (`geminiClient.js`) work?
**Answer:**
It acts as an abstraction layer with dynamic provider routing. It inspects `AI_PROVIDER` (or auto-detects from available environment keys) and routes calls to:
- `callBedrockSDK`: AWS Bedrock Converse API.
- `callGemini`: Google AI Studio REST API.
- `callGroq`: Groq OpenAI-compatible API.
- `callOpenAI`: OpenAI API.
If the primary provider fails, it cascades to secondary providers before invoking local fallbacks.

### Q47: What is AWS Bedrock and why did you use the Converse API?
**Answer:**
AWS Bedrock is a fully managed service that provides unified access to leading foundation models from Amazon, Anthropic, Meta, and Mistral via a single API. We used `@aws-sdk/client-bedrock-runtime` with `ConverseCommand` because it standardizes message formatting, system prompts, and multi-turn conversations across all Bedrock models.

### Q48: How do you authenticate with AWS Bedrock on Render?
**Answer:**
Via standard AWS IAM credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`). In `geminiClient.js`, `BedrockRuntimeClient` initializes with these credentials. When deployed to AWS ECS or Lambda, it automatically inherits IAM Role credentials from the instance metadata service.

### Q49: What models are supported in your Bedrock integration?
**Answer:**
- `amazon.nova-lite-v1:0` (Ultra-fast, cost-effective multimodal model).
- `anthropic.claude-3-haiku-20240307-v1:0` (High reasoning, reliable formatting).
- `mistral.mistral-7b-instruct-v0:2` / `mistral.ministral-3-3b-instruct`.
- `meta.llama3-8b-instruct-v1:0`.

### Q50: How did you implement support for Google Gemma 2?
**Answer:**
In `geminiClient.js`, when `GEMINI_MODEL=gemma-2-9b-it` or `gemma-2-27b-it` is selected, our client automatically detects the Gemma model family. Because Google's v1beta API does not accept the `systemInstruction` parameter for Gemma, our code automatically prepends the system prompt to the user query text, preventing API crashes.

### Q51: How does Groq integration work?
**Answer:**
Groq exposes an OpenAI-compatible endpoint at `https://api.groq.com/openai/v1`. By passing `baseURL: 'https://api.groq.com/openai/v1'` to the `OpenAI` client with `GROQ_API_KEY`, we can run `gemma2-9b-it` or `llama-3.3-70b-versatile` with response latencies under 300ms.

### Q52: What prompt engineering strategies did you use for the NEET Bhaiya chatbot?
**Answer:**
1. **Persona Definition**: Warm, encouraging elder brother chatting on WhatsApp.
2. **Length Constraints**: Explicitly limited to 80–140 words to prevent overwhelming students.
3. **Format Restrictions**: Plain text only—strictly forbidden from outputting raw LaTeX, backticks, or double asterisks (`**`).
4. **Pedagogical Anchoring**: Must answer the student's question in the very first sentence, cite NCERT concepts, and use 1–3 natural emojis.

### Q53: What is temperature in LLMs and how did you tune it?
**Answer:**
Temperature controls token sampling randomness (0 = deterministic, 1 = creative). For question generation and JSON classification, we use `temperature: 0.2` for maximum factual precision. For the NEET Bhaiya mentor chatbot, we use `temperature: 0.85` so conversations feel expressive and human.

### Q54: How do you enforce structured JSON output from LLMs?
**Answer:**
1. For OpenAI/Groq: Passing `response_format: { type: 'json_object' }`.
2. For Bedrock / Gemma: Appending explicit system instructions (`"Return ONLY a valid JSON object with keys [...] without markdown fences"`), followed by regex cleanup (`replace(/^```json/, '').replace(/```$/, '')`) and `JSON.parse()`.

### Q55: How does the AI question generation pipeline work?
**Answer:**
In `aiQuestionGenerator.js`, we pass chapter syllabus topics to the LLM with strict schemas (question text, options A-D, correct answer, NCERT explanation, difficulty). Generated questions are saved with `isPublished: false` and `lifecycleStatus: 'DRAFT'`, requiring explicit admin approval before entering student tests.

### Q56: How do you handle LLM rate limits (HTTP 429)?
**Answer:**
We implement exponential backoff with jitter in generation scripts and automatic fallback in the API layer. If Bedrock returns a throttling exception, the client falls back to Gemini or OpenAI, and ultimately to the local mentor fallback.

### Q57: What is the purpose of the in-dashboard AI tester in `/admin/overview`?
**Answer:**
It allows administrators to verify live cloud LLM connectivity in one click. It sends a test prompt to the configured provider (Bedrock, Gemma, Groq), measures latency in milliseconds, and outputs exact error diagnoses (e.g. `AccessDeniedException` if model access was not enabled in AWS Console).

### Q58: What is tokenization and why does it matter for cost?
**Answer:**
LLMs process text in chunks called tokens (~4 characters in English). APIs charge per 1,000 input/output tokens. By truncating chat histories to the last 16 messages and capping `maxOutputTokens: 460`, we cut token consumption by over 60% per conversation.

### Q59: Why do you avoid LaTeX in chatbot responses?
**Answer:**
Students frequently use mobile browsers where unrendered LaTeX strings like `\frac{1}{4\pi\epsilon_0}` appear as unreadable syntax. Enforcing plain Unicode formatting (`F = k × q₁q₂ / r²`) ensures instant clarity on all mobile devices.

### Q60: How does the system prevent hallucinated medical facts?
**Answer:**
For grounded question generation ([generateGroundedNcertQuestions.js](file:///c:/Users/user/Desktop/TEST/backend/src/scripts/generateGroundedNcertQuestions.js)), we feed raw text excerpts from official NCERT textbooks directly into the context window, instructing the model to generate questions solely from the provided text.

### Q61: What is Few-Shot Prompting and did you use it?
**Answer:**
Few-shot prompting provides 2–3 exemplar input-output pairs inside the prompt before asking the model to complete a new query. We used few-shot examples in PDF classification to teach the LLM how to separate complex assertion-reason questions into standardized options.

### Q62: How do you secure API keys in the AI layer?
**Answer:**
All AI calls originate strictly from the Node.js backend. No API keys (`AWS_SECRET_ACCESS_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`) are ever exposed to the frontend bundle or client browser.

### Q63: What is the difference between Bedrock Runtime and Bedrock Control Plane?
**Answer:**
Bedrock Control Plane (`@aws-sdk/client-bedrock`) manages model access, custom model training, and provisioned throughput. Bedrock Runtime (`@aws-sdk/client-bedrock-runtime`) executes real-time inference commands like `ConverseCommand` and `InvokeModelCommand`.

### Q64: What is the advantage of using Amazon Nova models?
**Answer:**
Amazon Nova models (Nova Micro, Nova Lite, Nova Pro) offer competitive pricing (~75% cheaper than Claude 3.5 Sonnet) with sub-second latency, ideal for high-volume student question curation and test generation.

### Q65: How would you evaluate the quality of AI-generated questions?
**Answer:**
Using automated validation pipelines ([validateQuestionGenerator.js](file:///c:/Users/user/Desktop/TEST/backend/src/scripts/validateQuestionGenerator.js)) that assert:
1. Question text length > 20 characters.
2. Exactly 4 distinct options (A, B, C, D).
3. Correct answer is in `['A', 'B', 'C', 'D']`.
4. Explanation mentions the correct answer concept.
5. Deduplication check against existing bank.

---

## 5. Frontend Engineering & React

### Q66: What is the component architecture of the React application?
**Answer:**
The frontend uses modular components structured as:
- **Pages**: Top-level route containers (`ExamPage`, `AdminDashboardPage`, `MentorPage`).
- **Components**: Reusable UI blocks (`AppShell`, `FloatingChat`, `ProtectedRoute`, `AdminRoute`).
- **Store / Slices**: Redux slices (`userSlice`) managing auth state, tokens, and active user profile.
- **Services**: Centralized Axios API instances (`api.js`).

### Q67: How does Redux Toolkit simplify state management?
**Answer:**
Redux Toolkit eliminates boilerplate through `createSlice()`. It automatically generates action creators and action types, integrates `Immer` so developers can write mutable-looking code that creates immutable state updates, and configures the Redux store with thunk middleware out of the box.

### Q68: What is the purpose of `ProtectedRoute` and `AdminRoute`?
**Answer:**
They are route wrapper components using React Router's `<Outlet />`. `ProtectedRoute` checks `isAuthenticated`; if false, it redirects to `/login`. `AdminRoute` checks `user?.role === 'admin'`; if false, it redirects unauthorized users to `/dashboard`.

### Q69: How is the modern Admin Login UI constructed?
**Answer:**
In `AdminLoginPage.jsx`, we built a responsive split layout matching `LoginPage.jsx`:
- **Left Column**: Form card with Medical Mania branding, clean rounded inputs, password show/hide toggle, and a 1-click credential auto-fill button (`admin@gmail.com` / `12345678`).
- **Right Column**: Visual hero section with background medical imagery and glassmorphic card explaining administrator privileges.

### Q70: How does `FloatingChat.jsx` maintain conversation context?
**Answer:**
It initializes with a welcoming mentor greeting. When the user sends a message, it checks if `conversationId` exists; if not, it asynchronously creates a conversation via `mentorAPI.createConversation()`. Subsequent messages pass the active `conversationId`, appending replies in chronological order.

### Q71: How did you implement smooth scrolling in chat components?
**Answer:**
Using a React `useRef` attached to an empty `<div>` at the bottom of the message container:
```javascript
const endRef = useRef(null);
useEffect(() => {
  endRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, isLoading]);
```

### Q72: How does the CBT Exam interface handle timers accurately?
**Answer:**
`ExamPage.jsx` calculates total remaining seconds based on the test's `duration` minus elapsed time. Rather than relying solely on `setInterval` (which throttles when the browser tab loses focus), it compares `Date.now()` against an absolute `endTime` timestamp, preventing timer drift.

### Q73: Why do we use Framer Motion in the project?
**Answer:**
Framer Motion provides declarative animations for page transitions, tab switches, and hover effects (`whileHover={{ y: -4 }}`, `AnimatePresence` for smooth mounting/unmounting), delivering a modern experience.

### Q74: What is the purpose of Tailwind CSS in this project?
**Answer:**
Tailwind CSS provides utility-first styling with zero CSS file bloat in production. It purges unused CSS classes during build, supports responsive design breakpoints (`sm:`, `md:`, `lg:`, `xl:`), and implements glassmorphic styling (`backdrop-blur-md`).

### Q75: How does Axios handle authentication tokens automatically?
**Answer:**
Through request interceptors:
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
Every outgoing API request automatically carries the current JWT without manual header construction in individual components.

### Q76: What is React `useCallback` and where did you use it?
**Answer:**
`useCallback` memoizes function definitions between re-renders. In `NursingContentAdminPage.jsx`, data-fetching functions like `loadOverview` and `loadQuestions` are wrapped in `useCallback` so they can be safely included in `useEffect` dependency arrays without causing infinite re-render loops.

### Q77: How do you handle responsive design for mobile examinees?
**Answer:**
1. Using responsive Tailwind grids (`grid-cols-1 md:grid-cols-2 xl:grid-cols-4`).
2. Collapsible sidebars and mobile slide-out menus in `AppShell.jsx`.
3. Modal overlays using `w-[min(390px,calc(100vw-32px))]` for mobile chat widgets.

### Q78: What is code splitting in React and how does `npm run build` optimize assets?
**Answer:**
Webpack and React Scripts split JavaScript into chunks. Instead of serving a single multi-megabyte bundle, `npm run build` creates chunks loaded on demand, minifies code, compresses CSS, and produces cache-busted filenames (e.g. `main.4213a7c8.js`).

### Q79: How do you handle question palette states during a CBT exam?
**Answer:**
Each question in the exam state maintains a status enum:
- `not_visited` (gray)
- `not_answered` (red)
- `answered` (green)
- `marked_for_review` (purple)
- `answered_and_marked` (purple with green dot)
A reactive grid updates button colors in real-time as the student navigates questions.

### Q80: How does `react-hot-toast` enhance user experience?
**Answer:**
It provides lightweight, non-blocking toast notifications for events (e.g. "Admin login successful", "Copied to clipboard", "Test submitted successfully") without intrusive browser alerts.

---

## 6. Security, Auth & Session Management

### Q81: Explain the JWT authentication flow implemented in this project.
**Answer:**
1. User submits email/password to `/api/auth/login` or `/api/auth/admin/login`.
2. Backend verifies credentials against database or environment variables.
3. Server generates a signed JWT using `jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })`.
4. Client stores the token in `localStorage` and Redux state.
5. Subsequent requests pass `Authorization: Bearer <token>`.
6. `authenticate` middleware verifies signature with `jwt.verify()` and extracts user ID.

### Q82: How are user passwords securely stored?
**Answer:**
Using `bcryptjs` with salt rounds. Before saving a user document, a Mongoose pre-save hook checks `isModified('password')`. If modified, it generates a salt and hashes the password:
```javascript
user.password = await bcrypt.hash(user.password, 10);
```
Plaintext passwords are never saved to the database.

### Q83: Why are admin credentials managed through environment variables?
**Answer:**
Hardcoding admin passwords in source code exposes credentials to version control leaks. Storing `ADMIN_EMAIL` and `ADMIN_PASSWORD` in environment variables ensures credentials stay secure on Render servers and can be rotated without redeploying code.

### Q84: How do you protect against NoSQL Injection in Express and MongoDB?
**Answer:**
1. Sanitizing user input with `mongo-sanitize` to strip `$` and `.` characters from query objects.
2. Explicitly casting input types (e.g. `String(email).trim().toLowerCase()`) rather than passing raw JSON objects into Mongoose queries like `User.findOne({ email: req.body.email })`.

### Q85: What is Cross-Site Scripting (XSS) and how is it mitigated here?
**Answer:**
XSS occurs when malicious scripts are injected into web pages. React mitigates XSS by default because JSX escapes strings before rendering them to the DOM (treating them as string literals rather than executable HTML), unless `dangerouslySetInnerHTML` is explicitly invoked.

### Q86: What is Cross-Origin Resource Sharing (CORS) and how is it configured?
**Answer:**
CORS is a browser security mechanism that restricts cross-origin HTTP requests. In `server.js`, we use the `cors` package to explicitly restrict allowed origins to our trusted domains, preventing unauthorized third-party websites from making credentialed requests on behalf of our users.

### Q87: What is an IDOR vulnerability and how did you prevent it?
**Answer:**
Insecure Direct Object Reference occurs when a user accesses another user's data by manipulating an ID in a request parameter. We prevent this by scoping all database queries to the authenticated user ID (`req.userId`) extracted from the cryptographically verified JWT.

### Q88: How do you prevent brute force attacks on the login endpoint?
**Answer:**
1. Rate-limiting IP requests on auth routes.
2. Using constant-time string comparisons in bcrypt to mitigate timing attacks.
3. Returning generic error messages ("Invalid admin ID or password") rather than revealing whether the email or password was the incorrect field.

### Q89: What is the difference between Authentication and Authorization?
**Answer:**
- **Authentication**: Verifying who the user is (e.g., verifying email & password and issuing a JWT in `authController.js`).
- **Authorization**: Verifying what permissions the authenticated user has (e.g., `isAdmin` middleware checking if `req.user.role === 'admin'`).

### Q90: How does token expiration protect users?
**Answer:**
Tokens include an `exp` claim (`30d`). If a token is compromised, its validity is bounded in time. For higher security environments, short-lived access tokens (15 minutes) paired with rotating refresh tokens (7 days) stored in `httpOnly` cookies are implemented.

---

## 7. System Design, DevOps & Scalability

### Q91: How is the application deployed in production?
**Answer:**
- **Backend API**: Hosted as a Web Service on **Render**, running Node.js in a containerized Linux environment connected to MongoDB Atlas.
- **Frontend SPA**: Hosted on **Vercel** or Render Static Sites with automatic global CDN caching and SPA rewrite rules (`vercel.json`).

### Q92: How do you handle Render's free tier sleep cycle?
**Answer:**
Render free instances spin down after 15 minutes of inactivity. When a new request arrives, a cold start takes 30–50 seconds. To solve this:
1. Configured uptime heartbeat pings via cron monitoring services.
2. Implemented frontend retry logic with toast alerts informing users during initial server wakeups.

### Q93: How would you scale this platform to support 100,000 concurrent students during a live NEET mock?
**Answer:**
1. **Stateless Backend**: Run multiple Node.js instances behind an AWS Application Load Balancer (ALB).
2. **Database Read Replicas**: Route question bank reads to MongoDB read replicas while writes (test submissions) go to the primary node.
3. **Redis Caching**: Cache published test questions and answers in Redis RAM clusters, reducing MongoDB load by 95%.
4. **Asynchronous Processing**: Push exam submission grading jobs to a BullMQ / RabbitMQ message queue, processing test scores asynchronously without blocking API threads.

### Q94: How does `npm run build` optimize the React application for production?
**Answer:**
1. Strips out development code, comments, and React warning checks.
2. Minifies JavaScript and CSS using Terser and CSSNano.
3. Tree-shakes unused exports.
4. Generates content-hashed bundle filenames for HTTP long-term caching headers (`Cache-Control: max-age=31536000`).

### Q95: How would you monitor application errors and performance in production?
**Answer:**
By integrating **Sentry** for real-time frontend and backend uncaught exception tracking, coupled with **Winston** / **Morgan** logging streams and **Prometheus / Grafana** or **Datadog** for CPU, memory, and event loop latency monitoring.

### Q96: What is CDN caching and where is it utilized?
**Answer:**
A Content Delivery Network caches static assets at edge servers close to users. Cloudinary acts as a CDN for question images and diagrams, while Vercel distributes the compiled HTML, JS, and CSS bundles globally for sub-50ms initial page loads.

### Q97: What is the difference between horizontal and vertical scaling?
**Answer:**
- **Vertical Scaling**: Adding more CPU cores and RAM to a single server (e.g. upgrading Render instance from 512MB to 4GB). Limited by hardware ceiling.
- **Horizontal Scaling**: Adding more server instances behind a load balancer. Provides virtually unlimited scale and high availability if one instance fails.

### Q98: How do you prevent race conditions when multiple students submit tests simultaneously?
**Answer:**
1. Unique compound indexing on `{ user: 1, test: 1 }` prevents duplicate submission records.
2. Atomic MongoDB operations (`$set`, `$inc`, `$setOnInsert`) ensure state modifications occur in a single atomic database lock cycle without read-modify-write race windows.

### Q99: If you had 2 more weeks, what architectural enhancements would you prioritize?
**Answer:**
1. **Redis Caching Layer**: Cache question banks and leaderboards in Redis.
2. **WebSocket Scaling with Redis Adapter**: Enable Socket.io horizontal scaling across multiple Node.js processes.
3. **Vector Database / RAG**: Store NCERT textbook embeddings in Pinecone or pgvector to give the AI mentor semantic retrieval over textbook paragraphs.
4. **Automated CI/CD**: Implement GitHub Actions for automated unit testing, linting, and zero-downtime deployment pipelines.

### Q100: How has building this project prepared you to contribute as an SDE intern?
**Answer:**
Building NEET-MANIA required solving end-to-end engineering challenges: designing robust relational and document schemas, building secure RESTful APIs with role-based access control, managing state across complex React components, integrating enterprise AI services like AWS Bedrock and Gemma with resilient error fallbacks, and diagnosing production cloud deployments on Render. This hands-on experience allows me to write clean, modular, production-ready code and contribute to real-world engineering teams from day one.
