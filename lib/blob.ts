import "server-only";

/**
 * Upload a photo to Vercel Blob and return its public URL.
 * Requires `BLOB_READ_WRITE_TOKEN` (auto-injected on Vercel when a Blob store
 * is connected). Returns null when no file is provided or Blob isn't configured.
 */
export async function uploadPhoto(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Blob not configured — skip rather than failing the whole report.
    return null;
  }
  const { put } = await import("@vercel/blob");
  const ext = file.name.split(".").pop() || "jpg";
  const key = `personas/${crypto.randomUUID()}.${ext}`;
  const blob = await put(key, file, { access: "public", addRandomSuffix: false });
  return blob.url;
}
