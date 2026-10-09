export const DOCUMENT_BUCKET = "portfolio-documents";
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const DOWNLOAD_TTL_SECONDS = 60;
export const FILE_ACCEPT = ".pdf,.txt,.docx,.jpg,.jpeg,.png";

const mimeByExtension: Record<string, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export type UploadDetails = {
  name: string;
  description: string;
  filename: string;
  mimeType: string;
  size: number;
};

export function isDocumentId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function parseUploadDetails(value: unknown): { data: UploadDetails; error?: never } | { error: string; data?: never } {
  if (!value || typeof value !== "object") return { error: "Enter document details and choose a file." };
  const input = value as Record<string, unknown>;
  if (typeof input.name !== "string" || !input.name.trim() || input.name.trim().length > 160) {
    return { error: "Enter a document name of 1–160 characters." };
  }
  if (typeof input.description !== "string" || input.description.length > 2000) {
    return { error: "Keep the description within 2,000 characters." };
  }
  if (typeof input.filename !== "string" || !input.filename.trim() || input.filename.length > 255
      || /[\u0000-\u001f\u007f/\\]/.test(input.filename)) {
    return { error: "Choose a file with a valid filename of up to 255 characters." };
  }
  if (typeof input.size !== "number" || !Number.isSafeInteger(input.size) || input.size < 1 || input.size > MAX_FILE_BYTES) {
    return { error: "Choose a non-empty file no larger than 10 MB." };
  }
  const extension = input.filename.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = Object.hasOwn(mimeByExtension, extension) ? mimeByExtension[extension] : undefined;
  if (!mimeType || typeof input.mimeType !== "string"
      || (input.mimeType !== "" && input.mimeType.split(";")[0].trim().toLowerCase() !== mimeType)) {
    return { error: "Supported files: PDF, TXT, DOCX, JPG, and PNG." };
  }
  return { data: { name: input.name.trim(), description: input.description.trim(), filename: input.filename, mimeType, size: input.size } };
}

export function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.ceil(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type DocumentSummary = {
  id: string;
  name: string;
  description: string;
  original_filename: string;
  size_bytes: number;
  visibility: "private" | "public";
};
