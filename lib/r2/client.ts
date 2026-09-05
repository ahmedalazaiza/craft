import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

export const R2_BUCKET_NAME =
  process.env.CLOUDFLARE_R2_BUCKET_NAME || "layerat-media";

export const R2_PUBLIC_URL = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://media.layerat.com"
).replace(/\/$/, "");

/**
 * Returns true if Cloudflare R2 credentials are fully configured
 */
export function isR2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey);
}

/**
 * Singleton S3 client instance configured specifically for Cloudflare R2
 */
let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!s3ClientInstance) {
    if (!isR2Configured()) {
      throw new Error("Cloudflare R2 credentials are not configured in environment.");
    }

    s3ClientInstance = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });
  }
  return s3ClientInstance;
}

/**
 * Upload a binary buffer to Cloudflare R2 and return the CDN public URL
 */
export async function uploadBufferToR2(
  buffer: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<string> {
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  await client.send(command);

  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete one or multiple keys from Cloudflare R2
 */
export async function deleteKeysFromR2(keys: string[]): Promise<boolean> {
  if (!isR2Configured() || keys.length === 0) return true;

  try {
    const client = getR2Client();

    if (keys.length === 1) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: keys[0],
        })
      );
    } else {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: R2_BUCKET_NAME,
          Delete: {
            Objects: keys.map((k) => ({ Key: k })),
            Quiet: true,
          },
        })
      );
    }
    return true;
  } catch (err) {
    console.error("Cloudflare R2 delete error:", err);
    return false;
  }
}
