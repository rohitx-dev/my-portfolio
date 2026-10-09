-- Issue #18. Apply once in Supabase SQL Editor before deploying DOC-04.
-- Additive: existing documents remain unchanged and the old app stays compatible.
begin;
alter table public.documents add column deletion_pending boolean not null default false;
grant update (deletion_pending) on public.documents to authenticated;

-- Once deletion starts, stale tabs cannot publish or restore the record.
create function portfolio_private.guard_document_deletion()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if old.deletion_pending and not new.deletion_pending then
    raise exception 'Deletion has started; retry deletion instead of restoring this document.';
  end if;
  if new.deletion_pending then
    new.visibility := 'private';
  end if;
  return new;
end;
$$;
revoke all on function portfolio_private.guard_document_deletion() from public, anon, authenticated;
create trigger documents_guard_deletion before update on public.documents
for each row execute function portfolio_private.guard_document_deletion();
alter table public.documents add constraint documents_pending_private
check (not deletion_pending or visibility = 'private');

-- Enforce this at the database boundary, including direct API reads.
alter policy documents_read on public.documents using (
  (visibility = 'public' and not deletion_pending)
  or ((select portfolio_private.is_document_owner()) and owner_id = (select auth.uid()))
);
commit;
