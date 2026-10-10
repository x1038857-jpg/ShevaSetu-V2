# ShevaSetu V2

ShevaSetu V2 is a government services web application built with Next.js, TypeScript, Supabase, Prisma, and OpenAI. It includes a document workflow for citizen submissions, AI-assisted document extraction, human review, consent capture, secure storage, and authority verification.

The core document processing flow is:

Document Upload -> File Validation -> OCR -> AI Extraction -> User Review -> Consent -> Database Save -> Authority Verification

This project is designed as a reusable document-processing module that can be adapted across multiple government service forms and workflows.

## Key features

- PDF, JPG, and PNG upload support
- Server-side file validation for MIME type, size, and file signature
- OCR for scanned PDFs and images
- AI-assisted extraction of structured fields
- Human review and editable extracted fields
- Consent capture before final submission
- Private file storage in Supabase
- Prisma + PostgreSQL persistence
- Authority review and approval workflow
- Role-based access control
- Secure API validation and safe failure handling

## Tech stack

- Next.js 14 (App Router)
- React + TypeScript
- Node.js API routes
- OpenAI API
- PostgreSQL + Prisma ORM
- Supabase Auth + Storage
- Tesseract.js for OCR
- PDF.js for PDF text extraction
- Zod for validation

## Architecture overview

```text
Client UI
  -> API Routes
    -> Supabase Auth (authenticated user/session checks)
    -> Private Storage (documents bucket)
    -> Prisma/PostgreSQL (Document, Application, ConsentRecord, ExtractionResult)
    -> OCR (PDF image and scanned text extraction)
    -> OpenAI API (structured JSON extraction)
    -> Authority dashboard (manual approval/rejection)
```

## Workflow summary

### 1. Document upload
- User selects a PDF, JPG, or PNG document.
- Server validates file type, size, and file signature.
- File is uploaded to a private Supabase storage bucket.
- Do not expose public permanent URLs.

### 2. OCR processing
- Extract actual OCR text from the document.
- For PDFs, extract text content where possible.
- For scanned images, use Tesseract.js.
- If OCR fails or gives very low-quality results, the system should return explicit errors and ask for manual review.

### 3. AI extraction
- Only necessary OCR text is sent to OpenAI.
- The model returns structured JSON using a strict schema.
- Missing or uncertain values are returned as null.
- Warnings and human-review fields are included.
- AI is never treated as proof of authenticity.

### 4. User review
- Extracted data is shown in an editable form.
- User can review and correct values.
- Missing/uncertain fields are clearly visible.
- Submission is blocked until review is complete and consent is provided.

### 5. Consent and privacy
- The user must explicitly accept the processing purpose and retention policy.
- Personal data sent to external AI providers is minimized.
- Document contents and API keys are never logged in plain text.
- Sensitive data is stored only in private storage and secure DB records.

### 6. Database save
- Save document metadata and status.
- Save extraction result JSON.
- Save user-reviewed data.
- Save consent records.
- Store application history and decision events.

### 7. Authority verification
- Government officers review the uploaded document and confirmed fields.
- Approval/rejection is manual and auditable.
- AI findings are advisory only and cannot by themselves prove authenticity.

## Project structure

```text
.
├── app/
│   ├── api/
│   │   ├── _health/
│   │   ├── applications/
│   │   ├── authority/
│   │   └── documents/
│   ├── app/page.tsx
│   ├── dashboard/page.tsx
│   ├── documents/
│   ├── officer/page.tsx
│   ├── authority/page.tsx
│   └── layout.tsx
├── components/
│   ├── document-review-form.tsx
│   └── authority-decision-panel.tsx
├── lib/
│   ├── auth.ts
│   ├── file-validation.ts
│   ├── ocr.ts
│   ├── openai-extraction.ts
│   └── prisma.ts
├── prisma/
│   └── schema.prisma
├── .env.example
├── .gitignore
├── README.md
├── middleware.ts
├── next.config.mjs
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Prerequisites

Before starting, ensure the following are available:

- Node.js 18+ recommended
- npm
- PostgreSQL database
- Supabase project
- OpenAI API key
- Git

## Environment variables

Create a `.env.local` file based on `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOVERNMENT_EMAIL_DOMAINS=gov.in,nic.in
DATABASE_URL=postgresql://user:password@localhost:5432/sheva_setu
MAX_UPLOAD_SIZE_MB=10
DOCUMENT_RETENTION_DAYS=90
LOG_LEVEL=info
```

### Variable descriptions

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key for browser access.
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side key for private backend use.
- `SUPABASE_JWT_SECRET`: JWT secret for session verification if needed.
- `OPENAI_API_KEY`: API key for structured extraction.
- `NEXT_PUBLIC_APP_URL`: Base app URL used for internal API calls.
- `GOVERNMENT_EMAIL_DOMAINS`: Allowed government email domains for authority registration.
- `DATABASE_URL`: PostgreSQL connection URL.
- `MAX_UPLOAD_SIZE_MB`: Max allowed file size per upload.
- `DOCUMENT_RETENTION_DAYS`: Document retention policy in days.
- `LOG_LEVEL`: Logging verbosity.

## Setup instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Generate Prisma client

```bash
npx prisma generate
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Then update `.env.local` with your actual values.

### 4. Setup PostgreSQL database

If using a local PostgreSQL instance:

```bash
createdb sheva_setu
```

Then set your `DATABASE_URL` accordingly:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/sheva_setu
```

If using Supabase Postgres, use the connection string provided by Supabase.

### 5. Run Prisma migration

```bash
npx prisma migrate dev --name init
```

This will create the required Prisma tables.

### 6. Start the app

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Supabase setup

### Storage bucket
Create a private bucket named `documents`.

Required rules:
- Private only
- No public URL exposure
- Backend-only access using service role key
- Restrict access by authenticated user ownership

### Auth
- Use Supabase Auth for citizen and authority login.
- Store the user role in `app_metadata.role`.
- Example role values:
  - `USER`
  - `GOVERNMENT`

### RLS / security
- Restrict direct access to uploaded files.
- Only authenticated users with proper ownership or authority permissions should fetch documents.

## Database models

The Prisma schema includes the following models:

- `User`
- `Document`
- `ExtractionResult`
- `Application`
- `ApplicationHistory`
- `ConsentRecord`

### Status enums

Document status values:
- `uploaded`
- `processing`
- `extracted`
- `needs_review`
- `approved`
- `rejected`
- `failed`

Application status values:
- `draft`
- `submitted`
- `in_review`
- `approved`
- `rejected`

Authority decision values:
- `approved`
- `rejected`
- `pending`

## API endpoints

### Document endpoints

#### POST /api/documents/upload
Uploads a document and stores metadata in the database.

Request:
- multipart form-data
- file field: `file`
- serviceType field: `serviceType`

Response:
- `documentId`
- `status`
- `message`

#### POST /api/documents/[id]/extract
Runs OCR and AI extraction for a file.

Validates:
- user ownership
- document existence
- valid service type

Returns:
- OCR warnings
- structured extraction JSON
- review-required fields

#### GET /api/documents/[id]
Fetches document metadata and related result data for the authenticated owner.

#### PATCH /api/documents/[id]/review
Stores user edited values and consent confirmation.

#### POST /api/applications/[id]/submit
Submits application after review and consent confirmation.

Includes idempotency handling to prevent duplicate submission records.

### Authority endpoints

#### GET /api/authority/applications
Returns all applications for authorized officers.

#### PATCH /api/authority/applications/[id]/decision
Allows an officer to approve or reject an application and record an audit note.

## Security and privacy rules

This application is designed around the following rules:

- Never expose permanent public document URLs.
- Never log document contents or sensitive identity numbers.
- Never log API keys or secrets.
- Minimize personal data sent to OpenAI.
- Require explicit user consent before processing sensitive docs.
- Use authenticated ownership checks on all user routes.
- Use role checks for authority APIs.
- Treat AI output as advisory only.
- Do not automatically approve or reject a case based solely on AI output.

## Failure handling

The module is designed to handle the following explicitly:

- Missing or invalid API keys
- Unsupported file types
- Corrupted or empty files
- OCR failures
- Low-confidence OCR results
- Malformed AI responses
- Rate limits and network timeouts
- Unauthorized access attempts
- Database failures

Safe behavior examples:
- return explicit error messages
- store failed processing state
- avoid fake results
- do not continue without consent
- do not fabricate missing values

## Testing plan

Recommended tests to add:

- invalid file type upload
- zero-byte file upload
- corrupted PDF upload
- empty OCR output
- malformed AI JSON response
- unauthenticated access
- unauthorized ownership access
- duplicate submission prevention
- authority access without role
- database fail simulation

Suggested commands:

```bash
npm run test
```

If using Jest or Vitest, add unit and route tests for each API handler and validation function.

## Limitations

This project should be treated as a strong starter implementation, not as a legal or compliance-certified verification system.

Current practical limitations include:

- OCR quality depends on scan quality and document readability
- AI extraction is not proof of document authenticity
- Real-world government verification still requires human review and official procedures
- Production security needs full Supabase RLS policies, stricter retention policy, and audit review
- Actual offline or institutional approvals depend on the connected government backend and policy workflow

## Recommended production hardening

Before production deployment, add:

- real Supabase Auth policies
- strict RLS policies for storage and DB tables
- file quarantine and deletion jobs
- retention cleanup process
- audit logs for all decision events
- request rate limiting
- server-side logging with redaction
- health checks and alerting
- signed storage URLs only for short-lived access when absolutely needed

## Notes

This repository is designed to be a reusable AI document extraction module for government applications. It is intentionally built with privacy, review, and verification controls in mind.

AI output must never be treated as an automatic verification of a citizen’s identity or a document’s authenticity. Human review remains mandatory.

## Quick start summary

```bash
npm install
cp .env.example .env.local
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Then open:

```text
http://localhost:3000
```

## License

This project is intended for internal or project-specific use. Add your preferred license if needed.

## Support

For any environment or deployment issue, verify:

- DATABASE_URL is valid
- Supabase project is active
- OpenAI key is valid
- Storage bucket exists and is private
- Auth roles are assigned correctly
- Prisma migration completed successfully

---

This README is intended to serve as a full technical onboarding guide for the project and document-processing workflow.
