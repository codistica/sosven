import "server-only";

/**
 * Upload a photo to Vercel Blob and return its public URL.
 * Requires `BLOB_READ_WRITE_TOKEN` (auto-injected on Vercel when a Blob store
 * is connected). Returns null when no file is provided or Blob isn't configured.
 */
export async function uploadPhoto(file: File | null): Promise<string | null> {
  console.log('step1')
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!file || file.size === 0) return null;
  console.log('step2')
  if (!token) {
    // Blob not configured — skip rather than failing the whole report.
    return null;
  }
  console.log('step3')
  const { put } = await import("@vercel/blob");
  console.log('step4')
  const ext = file.name.split(".").pop() || "jpg";
  const key = `personas/${crypto.randomUUID()}.${ext}`;

  let blob;
  try {
    blob = await put(key, file, {
      access: "public",
      addRandomSuffix: false,
      token,
    });
    console.log('step5')

  } catch (e) {
    console.error('blob upload failed:', e);
  }
    console.log('step6')
  return blob ? blob.url : null;
}
