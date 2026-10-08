-- Issue #14: owner-only document management and controlled public downloads.
-- Run ONCE in the Supabase SQL Editor as postgres, on your new project.
-- Owner: ba4aa406-c726-4ed8-9e14-d886ffbda33e
-- Save this file in your repository at supabase/migrations/001_document_storage.sql.
-- This creates the foundation; it does not add a website upload or login form.

begin;

-- Fail before creating anything if this is the wrong project or user.
do $$
begin
  if not exists (
    select 1 from auth.users
    where id = 'ba4aa406-c726-4ed8-9e14-d886ffbda33e'::uuid
  ) then
    raise exception 'Owner account not found. Check the project and owner User UID.';
  end if;
end;
$$;

-- Keep this schema OUT of Supabase's Exposed Schemas configuration.
create schema portfolio_private;
revoke all on schema portfolio_private from public, anon, authenticated;
grant usage on schema portfolio_private to anon, authenticated;

-- A boolean check of the verified session identity. No elevated privileges.
create function portfolio_private.is_document_owner()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    auth.uid() = 'ba4aa406-c726-4ed8-9e14-d886ffbda33e'::uuid,
    false
  );
$$;

revoke all on function portfolio_private.is_document_owner() from public, anon, authenticated;
grant execute on function portfolio_private.is_document_owner() to anon, authenticated;

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  description text not null default '' check (char_length(description) <= 2000),
  original_filename text not null check (char_length(btrim(original_filename)) between 1 and 255),
  mime_type text not null check (mime_type in (
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  )),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  -- Upload the object at this exact path. Keep the original name in metadata.
  storage_path text generated always as (owner_id::text || '/' || id::text) stored unique,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;
revoke all on public.documents from public, anon, authenticated;
grant select on public.documents to anon, authenticated;
grant insert, update, delete on public.documents to authenticated;

create policy documents_read
on public.documents for select to anon, authenticated
using (
  visibility = 'public'
  or (
    (select portfolio_private.is_document_owner())
    and owner_id = (select auth.uid())
  )
);

create policy documents_owner_insert
on public.documents for insert to authenticated
with check (
  (select portfolio_private.is_document_owner())
  and owner_id = (select auth.uid())
);

-- Only editable metadata may change; IDs and object paths remain stable.
revoke update on public.documents from authenticated;
grant update (name, description, visibility) on public.documents to authenticated;

create policy documents_owner_update
on public.documents for update to authenticated
using ((select portfolio_private.is_document_owner()) and owner_id = (select auth.uid()))
with check ((select portfolio_private.is_document_owner()) and owner_id = (select auth.uid()));

create policy documents_owner_delete
on public.documents for delete to authenticated
using ((select portfolio_private.is_document_owner()) and owner_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-documents',
  'portfolio-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
);

-- Public visibility is decided per document, never for the whole bucket.
-- Files without a matching public record stay private.
create policy portfolio_files_read
on storage.objects for select to anon, authenticated
using (
  bucket_id = 'portfolio-documents'
  and (
    (
      (select portfolio_private.is_document_owner())
      and (storage.foldername(name))[1] = (select auth.uid())::text
    )
    or exists (
      select 1 from public.documents d
      where d.storage_path = storage.objects.name and d.visibility = 'public'
    )
  )
);

create policy portfolio_files_owner_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'portfolio-documents'
  and (select portfolio_private.is_document_owner())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy portfolio_files_owner_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'portfolio-documents'
  and (select portfolio_private.is_document_owner())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Intentionally no object UPDATE policy. Use a new ID for a replacement file.
-- Use the Storage API to upload/delete bytes, never INSERT/DELETE storage rows manually.
-- Download through the Storage API with the publishable key + appropriate session.
-- Avoid persistent signed URLs if immediate public/private changes are required:
-- a signed URL remains usable until its expiry.
-- Account deletion requires first removing its files and document records.

commit;

select 'Document storage setup complete' as result,
  id as bucket,
  public as bucket_is_public,
  file_size_limit as max_file_bytes
from storage.buckets where id = 'portfolio-documents';
