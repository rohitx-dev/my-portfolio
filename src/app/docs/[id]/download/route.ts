import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { OWNER_ID } from "../../../../lib/auth/owner";
import { DOCUMENT_BUCKET, DOWNLOAD_TTL_SECONDS, isDocumentId } from "../../../../lib/documents/validation";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notFound = () => new Response("Document unavailable or access denied.", { status: 404, headers });
  if (!isDocumentId(id)) return notFound();

  try {
    const supabase = await createClient();
    const { data: document, error } = await supabase.from("documents")
      .select("owner_id, visibility, storage_path, original_filename").eq("id", id).maybeSingle();
    if (error) return new Response("Downloads are temporarily unavailable. Please try again.", { status: 503, headers });
    if (!document) return notFound();

    if (document.visibility !== "public") {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || data.user?.id !== OWNER_ID || document.owner_id !== data.user.id) return notFound();
    }
    const { data, error: downloadError } = await supabase.storage.from(DOCUMENT_BUCKET)
      .createSignedUrl(document.storage_path, DOWNLOAD_TTL_SECONDS, { download: document.original_filename });
    if (downloadError || !data) return notFound();

    return NextResponse.redirect(data.signedUrl, { status: 303, headers });
  } catch {
    return new Response("Downloads are temporarily unavailable. Please try again.", { status: 503, headers });
  }
}
