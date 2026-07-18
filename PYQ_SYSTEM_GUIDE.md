# NEET PYQ Intelligence System

## What is included

The PYQ module adds a working explorer, historical trends dashboard, year-paper browser, deep question analysis, custom test generation, student performance reporting, bookmarks, notes, retries, reports, and an admin quality workflow.

Routes:

- `/pyq` — explorer and individual practice
- `/pyq/trends` — chapter/topic analytics, heatmap, and preparation priority
- `/pyq/papers` — year-wise papers with original or shuffled order
- `/pyq/performance` — personal accuracy, time, retry, retention, and weak/strong areas
- `/admin/pyq` — CSV/Excel/JSON validation, expert queue, provenance approval, publication, and student reports

## Legal data policy

The module only exposes records whose `pyqDetails.legalStatus` is `user_provided`, `licensed`, or `original_sample`.

Older records without recorded provenance are not deleted, but they do not appear in the new PYQ APIs. The included 2016–2025 starter archive contains original NEET-style examples written for this project. It does not claim to reproduce official examination questions.

Historical trends are provided for preparation guidance only. They do not guarantee the questions or weightage of future NEET examinations.

## Setup

From the backend directory:

```powershell
npm install
npm run seed:pyq:samples
npm run audit:pyq
npm run dev
```

From a second terminal in the frontend directory:

```powershell
npm install
npm start
```

The sample seed is idempotent. Running it again does not duplicate records.

To use the admin workspace, configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`, then run `npm run seed`. Admin privileges are never granted automatically by the PYQ module.

## Import workflow

The admin workspace accepts `.csv`, `.xlsx`, and `.json`. Spreadsheet columns can use `optionA`, `optionB`, `optionC`, and `optionD`. The browser normalizes the sheet to JSON, and the backend performs authoritative validation.

Required data includes question text, four options, correct answer, year, subject, standardized chapter, topic, detailed solution, and legal provenance.

Imported records remain unpublished. An admin must separately:

1. correct validation errors;
2. verify question text, answer, explanations, classification, and exam year;
3. choose `user_provided` or `licensed` provenance;
4. explicitly publish the record.

Question edits preserve a version snapshot. Trend caches are invalidated after PYQ edits, publication, individual attempts, and completed PYQ tests.

## API summary

All `/api/pyq` routes require authentication.

- `GET /metadata`, `GET /explore`
- `GET /trends`, `GET /papers`, `GET /performance`
- `GET /questions/:id`
- `POST /questions/:id/attempt`
- `PUT /questions/:id/bookmark`, `PUT /questions/:id/note`
- `POST /questions/:id/report`
- `POST /tests`
- `POST /admin/validate-import`, `POST /admin/import`
- `GET /admin/queue`
- `PUT /admin/questions/:id/verify`
- `PUT /admin/questions/:id/publish`
- `GET/PUT /admin/reports/...`

## Priority-score meaning

The preparation score combines historical frequency, latest-three-year frequency, average yearly weightage, consecutive appearances, NCERT linkage, difficulty/accuracy pressure, repetition, and current syllabus relevance. Labels are recommendations—not predictions.
