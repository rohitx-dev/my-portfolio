"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "../../../lib/auth/owner";
import { DOCUMENT_BUCKET, isDocumentId } from "../../../lib/documents/validation";
import type { MutationResult } from "./actions";

function refreshDocuments() {
  revalidatePath("/admin/documents");
  revalidatePath("/docs");
}

export async function editDocument(_previous: MutationResult, formData: FormData): Promise<MutationResult> {
  const { supabase, user } = await requireOwner();
  const id = formData.get("id");
  const name = formData.get("name");
  const description = formData.get("description");
  if (!isDocumentId(id)) return { error: "Invalid document identifier." };
  if (typeof name !== "string" || !name.trim() || name.trim().length > 160) {
    return { error: "Enter a document name of 1–160 characters." };
  }
  if (typeof description !== "string" || description.length > 2000) {
    return { error: "Keep the description within 2,000 characters." };
  }
  try {
    const { data, error } = await supabase.from("documents")
      .update({ name: name.trim(), description: description.trim() })
      .eq("id", id).eq("owner_id", user.id).eq("deletion_pending", false)
      .select("id").maybeSingle();
    if (error || !data) return { error: "Could not save. The document may be unavailable or awaiting deletion. Refresh and try again." };
    refreshDocuments();
    return { success: "Document details saved." };
  } catch {
    return { error: "Could not confirm the save. Check your connection and retry." };
  }
}

export async function deleteDocument(_previous: MutationResult, formData: FormData): Promise<MutationResult> {
  const { supabase, user } = await requireOwner();
  const id = formData.get("id");
  if (!isDocumentId(id) || formData.get("confirm") !== "delete") {
    return { error: "Confirm deletion before continuing." };
  }
  try {
    // The durable marker hides the document and survives reloads/failed requests.
    const { data: document, error: markError } = await supabase.from("documents")
      .update({ deletion_pending: true, visibility: "private" })
      .eq("id", id).eq("owner_id", user.id).select("id").maybeSingle();
    if (markError) return { error: "Could not start deletion. Refresh and try again." };
    if (!document) {
      refreshDocuments();
      return { success: "This document is already removed or unavailable." };
    }
    refreshDocuments();

    // Derive the path from the verified owner and ID, never from client input.
    // Storage remove is repeatable: already absent objects need no further work.
    const { error: storageError } = await supabase.storage.from(DOCUMENT_BUCKET).remove([`${user.id}/${id}`]);
    if (storageError) return { error: "Deletion is pending and the document is hidden. Retry deletion to remove its file." };

    // Keep the record until Storage acknowledges cleanup, so failures remain retryable.
    const { error: recordError } = await supabase.from("documents").delete()
      .eq("id", id).eq("owner_id", user.id).eq("deletion_pending", true);
    if (recordError) return { error: "The file was removed, but record cleanup failed. Retry deletion to finish." };
    refreshDocuments();
    return { success: "Document deleted." };
  } catch {
    refreshDocuments();
    return { error: "Could not confirm deletion. Refresh and retry; any pending deletion remains hidden." };
  }
}
