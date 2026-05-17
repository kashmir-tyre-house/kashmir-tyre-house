import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials are not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function uploadToR2(buffer: Buffer, key: string, contentType: string): Promise<string> {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not configured.");

  const client = getR2Client();
  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType })
  );

  // Store the key as the canonical reference; presigned URLs are generated on read
  return key;
}

export async function presignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not configured.");

  const client = getR2Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn }
  );
}

export async function deleteFromR2(key: string): Promise<void> {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not configured.");

  const client = getR2Client();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

// Extract the object key from whatever is stored in the DB (key directly, or legacy full URL)
export function keyFromStored(stored: string): string {
  // If it's already a bare key (e.g. "gallery/foo.jpg"), return as-is
  if (!stored.startsWith("http")) return stored;

  // Legacy: full URL was stored — strip any known base prefix
  const accountId = process.env.R2_ACCOUNT_ID ?? "";
  const bucket = process.env.R2_BUCKET_NAME ?? "";
  const accountBase = `https://${accountId}.r2.cloudflarestorage.com`;
  const publicBase = (process.env.R2_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

  for (const base of [
    `${accountBase}/${bucket}`,
    accountBase,
    publicBase,
  ].filter(Boolean)) {
    if (stored.startsWith(`${base}/`)) return stored.slice(base.length + 1);
  }

  // Fallback: return as-is
  return stored;
}
