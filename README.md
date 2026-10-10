# Sheva-Setu Document Extraction Module

This project adds a production-oriented document-processing workflow for government services:

Document Upload -> OCR -> AI Extraction -> User Review -> Consent -> Database Save -> Authority Verification

## Stack

- Next.js App Router
- TypeScript
- Supabase Auth + private storage
- Prisma + PostgreSQL
- OpenAI structured extraction
- OCR for scanned PDFs and images
- Zod validation

## Environment variables

Copy `.env.example` to `.env.local` and fill values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOVERNMENT_EMAIL_DOMAINS=gov.in,nic.in
DATABASE_URL=postgresql://user:password@localhost:5432/sheva_setu
MAX_UPLOAD_SIZE_MB=10
DOCUMENT_RETENTION_DAYS=90
LOG_LEVEL=info
```

## Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Required API routes

- POST /api/documents/upload
- GET /api/documents/[id]
- POST /api/documents/[id]/extract
- PATCH /api/documents/[id]/review
- POST /api/applications/[id]/submit
- GET /api/authority/applications
- PATCH /api/authority/applications/[id]/decision

## Important rules

- Validate file type, MIME type, signature and size on the server.
- Reject unsupported, corrupted or empty files.
- OCR must be derived from actual file content.
- AI extraction must return structured JSON with null for missing values.
- User confirmation is required before submission.
- Authority review must remain manual and auditable.
- Never treat AI extraction as proof of authenticity.
