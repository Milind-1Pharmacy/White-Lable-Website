/**
 * @file upload.ts
 * @description Browser-adapted two-step presigned S3 upload, ported from
 *  1p-b2c-app's `services/fileHandler/index.ts`. Step 1 asks the API for a
 *  presigned URL; step 2 PUTs the file bytes directly to S3; the clean S3 URL
 *  (query params stripped) is returned to store in the AppConfig draft.
 * @responsibilities
 *  - `uploadImage(file)` — run the full flow and resolve to the clean S3 URL.
 *  - Mirror the b2c HTTP contract (POST upload_url?platform=webstore → PUT to S3
 *    with `x-amz-acl: public-read`).
 * @dependencies ./endpoints
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
import { getURL } from "./endpoints";

/** Image MIME types the builder accepts. */
const ALLOWED_TYPES = new Set([
  "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml",
]);
/** Hard size cap (8 MB) — fail fast client-side before any network call. */
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Reject non-images / oversized files before uploading. This is client-side
 * defense-in-depth — the backend MUST still re-validate content-type + bytes.
 */
function assertUploadable(file: File): void {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only image files (PNG, JPEG, WebP, GIF, SVG) can be uploaded.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is too large (max 8 MB).");
  }
}

/** Strip anything that could inject into an S3 key / path; keep a safe basename. */
function safeFilename(name: string): string {
  const base = (name || "image").split(/[\\/]/).pop() || "image"; // drop any path
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^\.+/, "") || "image";
}

/** Only allow the presigned PUT to target AWS S3 (blocks SSRF if the API lies). */
function isAllowedUploadUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /(^|\.)amazonaws\.com$/.test(u.hostname);
  } catch {
    return false;
  }
}

/** Step 1: request a presigned upload URL for `filename`. */
async function requestUploadUrl(filename: string): Promise<string> {
  const res = await fetch(getURL({ key: "UPLOAD_URL", queryParams: { platform: "webstore" } }), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });
  if (!res.ok) throw new Error(`Could not get upload URL (HTTP ${res.status})`);
  const json = await res.json();
  // b2c returns the presigned URL on `data.uploadUrl`.
  const uploadUrl = json?.data?.uploadUrl;
  if (!uploadUrl) throw new Error("Upload URL missing from API response");
  if (!isAllowedUploadUrl(uploadUrl)) throw new Error("Upload URL rejected (not an S3 endpoint).");
  return uploadUrl as string;
}

/** Step 2: PUT the raw file bytes to the presigned S3 URL. */
async function putToS3(uploadUrl: string, file: File): Promise<string> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream", "x-amz-acl": "public-read" },
    body: file,
  });
  if (res.status !== 200) throw new Error(`S3 upload failed (HTTP ${res.status})`);
  // Strip the presigned query params to get the clean, shareable object URL.
  return res.url.split("?")[0];
}

/**
 * Upload a browser File to S3 and resolve to the clean public URL.
 * @param file - The File from an <input type="file"> change event.
 * @returns The stored S3 URL (no query string) to write into the config.
 */
export async function uploadImage(file: File): Promise<string> {
  assertUploadable(file);
  const filename = `${Date.now()}_${safeFilename(file.name)}`;
  const uploadUrl = await requestUploadUrl(filename);
  return putToS3(uploadUrl, file);
}
