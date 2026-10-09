# DOC-04: Owner editing and deletion — issue #18

## Apply

Start from merged PR #17 on `main`. Create branch `feat/doc-04-edit-delete`.
Apply `doc-04-edit-delete.patch` in the repository root.

Before running or deploying the new app, run the complete contents of
`supabase/migrations/002_document_deletion.sql` ONCE in the project's Supabase
SQL Editor. Do not rerun migration 001. Migration 002 adds a deletion marker,
a database guard, and updates the read policy. It does not delete existing files
or records. Existing code remains compatible with the added column.

No new dependencies or environment variables are needed. Keep the bucket private.

```bash
node --test tests/*.test.mjs
npm run lint
npm run build
npm run dev
```

## Behavior

- Owner cards have an Edit details form with name (1–160 characters) and optional
  description (up to 2,000 characters). Server validation and owner filtering
  protect each save. File contents, filename, path, and visibility do not change.
- Cancel editing discards the unsaved form. Save updates the dashboard and public
  listing. Public visitors never receive edit/delete controls.
- Delete document opens an inline confirmation naming the document. Cancel makes
  no request. Confirm deletion is permanent; there is no undo after it starts.
- The action marks the row `deletion_pending = true` and makes it private before
  removing bytes. The database trigger keeps pending rows private even when a
  stale tab tries to publish them. The marker cannot be cleared by an update.
- The Storage API removes the verified owner's exact UUID path. Only after it
  succeeds does the action delete the database record. It never manually deletes
  a row in `storage.objects`.
- If file or record cleanup fails, the pending row stays visible to the owner with
  a Retry deletion button. Retry works after reload and when the file was already
  removed. A lost final response can also be retried without deleting another file.
- Pending documents cannot receive new download links, including for the owner.
  Already issued links/copies cannot be recalled; do not promise instant revocation
  of cached or previously downloaded bytes.
- Authorization is verified inside both new actions. Each database mutation is
  filtered by the verified owner ID and validated document UUID; RLS remains active.

## Files

- `src/app/admin/documents/manage-actions.ts`: owner edit/delete server actions.
- `src/components/docs/DocumentManageForm.tsx`: editing, confirmation, retry states.
- `supabase/migrations/002_document_deletion.sql`: persistent deletion state/guard.
- Dashboard, public list, visibility action and download route respect pending state.
- `tests/document-management.test.mjs`: validation, owner checks, cleanup sequencing,
  storage failures, record failures, repeated requests and retry behavior.
- `tests/documents.test.mjs`: previous cases plus denial of pending downloads.

## Live checks before PR

Use a disposable test document; deletion is permanent.

1. Upload a test PDF, make it public, then edit its name and description. Refresh
   incognito `/docs` and verify the new details; download and verify the original file.
2. Reject a blank/whitespace-only name. Cancel an edit and confirm the saved details
   are unchanged.
3. Click Delete document, then Cancel. Confirm the file still downloads.
4. Confirm deletion. Check both the dashboard and incognito `/docs`: the card is gone.
   Its `/docs/<id>/download` route must deny access. Check Supabase Storage and the
   documents table to confirm the specific test object's file and row are gone.
5. For a retry case, upload another disposable file. As owner, set its
   `deletion_pending` column to true in the Supabase table editor. Refresh the dashboard:
   Retry deletion appears, public visibility is private, and downloads are denied.
   Click Retry deletion and confirm cleanup completes. Automated tests also cover
   simulated Storage/network/record failures; do not disable production RLS to test.
6. Sign out: the owner dashboard must redirect to `/login`. Check mobile layout,
   keyboard access, and visible confirmation/error messages.

## Validation and limits

Automated action tests use mocked Supabase boundaries; live checks are required.
The SQL migration was tested with both migrations in isolated PostgreSQL (PGlite)
using mocked Supabase auth/storage schemas; this is not a live Storage integration.

The dashboard shows up to 50 records, with pending deletions first so retries do
not disappear behind newer uploads. Completing them reveals subsequent records.
Visitor submissions, notifications and file replacement remain out of scope.
Existing npm audit warnings are left unchanged.
