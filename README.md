# Sheva-Setu

A production-ready full-stack government services portal built with Next.js, Supabase, and AI-powered document reading.

## Features
- Two portals: Citizen/User and Government, each with its own registration and login
- Registration: name + email -> OTP verification -> set password -> success -> login
- Role-based redirect after login (users open the citizen dashboard, officers open the officer dashboard)
- Supabase auth integration
- AI document authenticity checks
- Auto-fill user forms from uploaded documents
- Hindi + English bilingual support
- Government officer dashboard with approval/rejection workflow
- Application tracking and document review

## Tech stack
- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI

## Quick start
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase and OpenAI keys
3. Run: `npm install`
4. Start app: `npm run dev`

## Portal pages
- Citizen: Home, Services, My Applications, Government Portal, About (English / हिंदी toggle in the header)
- Government: Dashboard (stats + approval panel with Pending / In Process / Approved / Rejected) and About

## Supabase setup
1. Apply the SQL from `supabase/schema.sql` in your Supabase SQL editor.
   (Already applied an older version? Run `supabase/patch-auth-roles.sql`, then `supabase/patch-portal-upgrade.sql`.)
2. **OTP emails:** go to Authentication -> Email Templates and make sure both the **Confirm signup**
   and **Magic Link** templates show the code with `{{ .Token }}`, for example:
   `<h2>Your Sheva-Setu OTP</h2><p>{{ .Token }}</p>`
3. Supabase's built-in email sender has a very low hourly limit. For real use, add your own SMTP
   under Authentication -> SMTP Settings.

## Government accounts
Government registration only accepts official email domains, set in `GOVERNMENT_EMAIL_DOMAINS`
(default `gov.in,nic.in`; subdomains such as `mp.gov.in` are included). For local testing you can
temporarily add your own domain, e.g. `GOVERNMENT_EMAIL_DOMAINS=gov.in,nic.in,gmail.com`.
Remove test domains before going live, otherwise anyone could register as an officer.

## Notes
This project is designed to work with real Supabase and OpenAI credentials. Without them, the app still loads and can run in demo mode for local UI testing.
