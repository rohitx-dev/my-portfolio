"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireOwner } from "../../../lib/auth/owner";
import { DOCUMENT_BUCKET, isDocumentId, parseUploadDetails } from "../../../lib/documents/validation";

export type MutationResult = { error?: string; success?: string };
type UploadTicket = { id: string; path: string; token: string };

export async function prepareUpload(input: unknown): Promise<{ ticket?: UploadTicket; error?: string }> {
  const { supabase, user } = await requireOwner();
  const parsed = parseUploadDetails(input);
  if (parsed.error) return { error: parsed.error };
  const id = randomUUID();
  const path = `${user.id}/${id}`;
  const { data, error } = await supabase.storage.from(DOCUMENT_BUCKET).createSignedUploadUrl(path, { upsert: false });
  if (error || !data) return { error: "Could not start the upload. Please try again." };
  return { ticket: { id, path, token: data.token } };
}

export async function finishUpload(id: unknown, input: unknown): Promise<MutationResult> {
  const { supabase, user } = await requireOwner();
  if (!isDocumentId(id)) return { error: "Invalid document identifier." };
  const parsed = parseUploadDetails(input);
  if (parsed.error || !parsed.data) return { error: parsed.error };
  const details = parsed.data;

  // Idempotent retry if the database saved the record but the response was lost.
  const existing = await supabase.from("documents").select("id").eq("id", id).eq("owner_id", user.id).maybeSingle();
  if (existing.error) return { error: "Could not check the saved document. Retry saving." };
  if (existing.data) {
    revalidatePath("/admin/documents");
    return { success: "Document saved. Its current visibility is shown below." };
  }

  // Verify storage metadata on the server before creating a document record.
  const { data: object, error: storageError } = await supabase.storage.from(DOCUMENT_BUCKET).info(`${user.id}/${id}`);
  if (storageError || !object) return { error: "Could not verify the uploaded file. Retry saving in a moment." };
  const storedType = object.contentType?.split(";")[0].trim().toLowerCase();
  if (object.size !== details.size || storedType !== details.mimeType) {
    return { error: "The stored file does not match its size or type. It has not been published." };
  }

  const { error } = await supabase.from("documents").insert({
    id, owner_id: user.id, name: details.name, description: details.description,
    original_filename: details.filename, mime_type: details.mimeType, size_bytes: object.size,
    visibility: "private",
  });
  if (error) return { error: "The file uploaded, but its document record could not be saved. Retry saving." };
  revalidatePath("/admin/documents");
  return { success: "Document uploaded and saved privately." };
}

export async function changeVisibility(_previous: MutationResult, formData: FormData): Promise<MutationResult> {
  const { supabase, user } = await requireOwner();
  const id = formData.get("id");
  const visibility = formData.get("visibility");
  if (!isDocumentId(id) || (visibility !== "public" && visibility !== "private")) {
    return { error: "Invalid document or visibility setting." };
  }

  if (visibility === "public") {
    const { data, error } = await supabase.storage.from(DOCUMENT_BUCKET).info(`${user.id}/${id}`);
    if (error || !data) return { error: "The file is unavailable. It cannot be published." };
  }
  const { data, error } = await supabase.from("documents")
    .update({ visibility }).eq("id", id).eq("owner_id", user.id).select("id").maybeSingle();
  if (error || !data) return { error: "Could not change visibility. Refresh and try again." };
  revalidatePath("/admin/documents");
  revalidatePath("/docs");
  return { success: visibility === "public" ? "Published. Anyone can download this document." : "Now private. Download links issued by this app expire within 60 seconds." };
}
