# DOC-02: Owner login and document storage — Issue #14

## What this batch adds

- `/login`: email/password login for the portfolio owner.
- `/admin/documents`: protected workspace with saved document records, an empty state, and logout.
- Cookie-based Supabase sessions refreshed by `src/proxy.ts` (Next.js 16).
- Server-side owner checks before document queries. Supabase RLS provides independent database and file protection.

Uploads, downloads, visibility controls, and visitor submissions are separate implementation steps. The public `/docs` page still shows sample cards.

## File responsibilities

| File | Purpose |
| --- | --- |
| `src/lib/supabase/config.ts` | Read the two connection environment variables |
| `src/lib/supabase/server.ts` | Create a Supabase client for the current request |
| `src/proxy.ts` | Refresh session cookies on login and admin routes; prevent shared caching |
| `src/lib/auth/owner.ts` | Validate the session and check the owner UID |
| `src/app/login/actions.ts` | Sign in and sign out through Server Actions |
| `src/components/auth/` | Accessible forms, loading states, and error messages |
| `src/app/login/page.tsx` | Login page |
| `src/app/admin/documents/page.tsx` | Protected document list |

## Setup in Codespaces

1. Stay on `feat/doc-02-auth-storage`.
2. Install `@supabase/supabase-js` and `@supabase/ssr` if not already installed.
3. Preserve your existing `.env.local` settings and add:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

4. Keep `.env.local` ignored by Git. No database password, secret key, or service-role key is needed by this code.
5. Create the owner account in Supabase and disable public signup. Its UID must match `OWNER_ID` and the applied SQL migration.
6. The already-applied `supabase/migrations/001_document_storage.sql` creates the table, private bucket, and policies. Do not run it again.
7. Restart `npm run dev` after changing environment variables.

## Browser checks before the PR

- Open `/login` on your forwarded Codespaces preview URL. It should show the login form.
- In a signed-out/incognito session, visit `/admin/documents`. It must redirect to `/login` without showing document data.
- Enter an incorrect password. The form must show an error without navigating away.
- Sign in with the owner account created in this Supabase project. It must open `/admin/documents` and show "No documents yet" if the table is empty.
- Refresh the dashboard. The session should persist.
- Sign out. It must return to `/login`; visiting the dashboard again must require login.
- If a second test account already exists, it must not reach the owner dashboard, even with valid credentials.
- Check the login form and dashboard at mobile width. Public `/` and `/docs` must still work.

Run `npm run lint` and `npm run build`. Dependency audit warnings are unchanged by request.

## Vercel

Add the same two connection variables to the appropriate Vercel Preview and Production environments before deploying this branch. Redeploy after saving them. Do not paste credentials in a PR. Email/password login in this batch does not require a callback route.

## Limits

- The owner UID is fixed to this portfolio; it is not a general role-management system.
- Supabase handles password authentication and its rate limits. There is no custom password store or public registration route.
- Reset-password and MFA screens are not included in this batch.
- Validate live login/logout in your project: build tests alone cannot prove the Supabase account and settings are correct.
