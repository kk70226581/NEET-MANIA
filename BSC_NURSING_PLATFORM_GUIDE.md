# B.Sc. Nursing Question Platform

## What was added

The B.Sc. Nursing area is now a data-driven question platform. It reuses the existing React client, Express API, MongoDB/Mongoose data store, JWT login, admin role, and unified server-side AI client.

Student routes:

- `/bsc-nursing` — public preparation hub
- `/bsc-nursing/question-bank` — paginated search and practice
- `/bsc-nursing/previous-year` — only reusable, verified PYQs
- `/bsc-nursing/bookmarks` — saved questions
- `/bsc-nursing/performance` — real attempt analytics and recommendations
- `/bsc-nursing/practice` — chapter practice, including All/Easy/Medium/Hard
- `/bsc-nursing/mock-tests` — CBT mock tests from published questions

Admin route:

- `/nursing/admin/content` — content studio for review, question editing, imports, sources, AI jobs, and coverage

## Database changes

MongoDB does not need SQL migrations. The existing nursing models were extended and these collections were added:

- `NursingSourceRegistry`
- `NursingGenerationJob`
- `NursingQuestionVersion`
- `NursingImportBatch`

Questions now preserve lifecycle/review/verification state, attribution, duplicate information, version metadata, AI generation and validation records, optional embeddings, language/translation grouping, and current-affairs expiry metadata.

## Seed the editable taxonomy

From `backend`:

```bash
npm run seed:nursing-platform
npm run seed:nursing-samples
```

The first script is idempotent and creates the requested Biology, Chemistry, Physics, English, and General Knowledge / Current Affairs hierarchy. The second creates exactly 50 clearly labelled, **unpublished** development samples (10 per subject). Review and publish them in Content Studio before students can see them.

## Add questions manually

1. Sign in as an admin.
2. Select the Nursing track and open `/nursing/admin/content`.
3. Open **Question editor**, complete question, four unique options, correct answer, explanation, taxonomy, and source fields.
4. Save the draft. Run review and then explicitly publish it.

Editing an existing question saves a version snapshot first. Archiving is a soft delete and removes the item from student search.

## Import CSV or JSON

Use Content Studio → **CSV / JSON import**.

CSV headers supported:

```text
exam,subject,chapter,topic,question,optionA,optionB,optionC,optionD,correctAnswer,explanation,difficulty,year,source,sourceURL,sourceType,tags
```

The preview resolves the supplied subject/chapter/topic against the database, validates each row, checks lexical duplicates, and stores errors. Only valid rows are inserted, and all inserted rows go into **Needs review**; nothing is automatically published.

## Generate AI questions

1. Configure a server-side provider in `backend/.env`.
2. Open **AI generation** in Content Studio.
3. Select subject, chapter, optional topic, question count, difficulty distribution, and batch size.
4. Create the job and process batches. A job persists its completed, validated, and failed counts, allowing failed or partial work to be retried.
5. Inspect generated questions in the review queue and publish only after human approval.

Generation is server-side only. Each batch receives rule validation, duplicate comparison, independent AI validation, `QuestionValidation` records, and `AIQuestionGeneration` traceability. It is never auto-published.

## Source and copyright workflow

Add domains under **Source registry** before any future controlled ingestion. The scheduler is off by default and only audits explicitly approved registry domains when enabled. It does not fabricate exam events or scrape/republish material.

For content without verified reuse rights, record it as `reference-only`, retain source metadata, and create original AI or admin practice questions based on learning objectives. Do not label generated material as official or previous-year content.

## Required environment variables

Existing variables remain required:

```text
MONGODB_URI
JWT_SECRET
AI_PROVIDER
AWS_BEARER_TOKEN_BEDROCK / OPENAI_API_KEY / GEMINI_API_KEY
```

Optional nursing pipeline controls:

```text
NURSING_AI_BATCH_SIZE=10
NURSING_AI_MAX_OUTPUT_TOKENS=3500
NURSING_AI_VALIDATION_MAX_TOKENS=1800
NURSING_DUPLICATE_THRESHOLD=78
NURSING_AUTO_APPROVE_THRESHOLD=85
NURSING_SCHEDULER_ENABLED=false
```

Keep the scheduler disabled until source domains are reviewed and approved. API keys must never be placed in frontend environment variables.

## API additions

Student APIs are under `/api/nursing/content`:

- `GET /catalog`, `GET /questions`, `GET /questions/:id`
- `POST /questions/:id/answer`
- `GET /analytics`

Admin APIs include question CRUD/review/versioning, import preview/commit, source registry, coverage, and generation jobs beneath `/api/nursing/content/admin`.

## Current limitations and next production steps

- Duplicate detection currently uses normalized and lexical similarity. Schema support for embeddings is present; semantic/vector matching needs a chosen embedding provider and vector index.
- PDF/DOCX extraction exists elsewhere in the project but is not yet connected to the nursing staging importer. CSV/JSON are production-ready staging paths.
- AI generation jobs are persisted and batch-driven through the admin endpoint. For multi-worker production execution, connect `processGenerationJob` to a durable queue/worker.
- Official dates and patterns must be entered or verified by an admin from primary sources. The system deliberately does not fabricate them.
