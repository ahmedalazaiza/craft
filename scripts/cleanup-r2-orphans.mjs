/**
 * Cloudflare R2 Orphaned Media Cleanup Utility
 *
 * Scans Cloudflare R2 bucket against active Supabase DB records (projects & profiles).
 * SAFE BY DEFAULT: Runs in dry-run mode unless --delete is explicitly specified.
 *
 * Usage:
 *   node scripts/cleanup-r2-orphans.mjs           # Dry run (audits and lists orphans)
 *   node scripts/cleanup-r2-orphans.mjs --delete  # Executes safe deletion of orphaned files
 */

import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

// Load .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const isDeleteMode = process.argv.includes("--delete");

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "layerat-media";

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error("❌ Cloudflare R2 credentials missing in environment (.env.local).");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase credentials missing in environment (.env.local).");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const supabase = createClient(supabaseUrl, supabaseKey);

function extractKey(url) {
  if (!url || typeof url !== "string") return null;
  // Handle media.layerat.com/key or r2.cloudflarestorage.com/bucket/key
  const clean = url.split("?")[0].split("#")[0];
  const r2Match = clean.match(/media\.layerat\.com\/(.+)$/);
  if (r2Match && r2Match[1]) return r2Match[1];
  const genericMatch = clean.replace(/^https?:\/\/[^\/]+\//, "");
  return genericMatch || null;
}

async function main() {
  console.log(`\n🔍 Scanning Cloudflare R2 bucket: "${bucketName}"...`);
  console.log(`Mode: ${isDeleteMode ? "⚠️  ACTIVE DELETION (--delete enabled)" : "🛡️  DRY RUN (Safe inspection only)"}\n`);

  // 1. Fetch all active DB records
  const { data: projects, error: pErr } = await supabase
    .from("projects")
    .select("id, title, cover_image, gallery_images");
  if (pErr) {
    console.error("Failed to query projects:", pErr);
    process.exit(1);
  }

  const { data: profiles, error: prErr } = await supabase
    .from("profiles")
    .select("id, username, avatar_url");
  if (prErr) {
    console.error("Failed to query profiles:", prErr);
    process.exit(1);
  }

  const activeKeys = new Set();
  (projects || []).forEach((p) => {
    const ck = extractKey(p.cover_image);
    if (ck) activeKeys.add(ck);
    (p.gallery_images || []).forEach((img) => {
      const gk = extractKey(img);
      if (gk) activeKeys.add(gk);
    });
  });

  (profiles || []).forEach((pr) => {
    const ak = extractKey(pr.avatar_url);
    if (ak) activeKeys.add(ak);
  });

  console.log(`📊 Supabase DB Active Media Keys: ${activeKeys.size} distinct files`);

  // 2. List all files in R2 bucket (supporting pagination if > 1000)
  let continuationToken = undefined;
  const allR2Objects = [];
  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      })
    );
    if (res.Contents) {
      allR2Objects.push(...res.Contents);
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  console.log(`📦 Cloudflare R2 Stored Objects: ${allR2Objects.length} files`);

  // 3. Classify objects
  const systemPrefixes = ["branding/"];
  const orphanedObjects = [];
  let orphanedBytes = 0;
  let activeCount = 0;
  let systemCount = 0;

  for (const obj of allR2Objects) {
    if (!obj.Key) continue;

    // Preserve system assets (like logos)
    if (systemPrefixes.some((prefix) => obj.Key.startsWith(prefix))) {
      systemCount++;
      continue;
    }

    if (activeKeys.has(obj.Key)) {
      activeCount++;
    } else {
      orphanedObjects.push(obj);
      orphanedBytes += obj.Size || 0;
    }
  }

  const orphanedMB = (orphanedBytes / (1024 * 1024)).toFixed(2);

  console.log(`\n========================================`);
  console.log(`📁 Audit Results:`);
  console.log(`   - Active in DB:      ${activeCount} files`);
  console.log(`   - System Assets:     ${systemCount} files`);
  console.log(`   - Orphaned in R2:    ${orphanedObjects.length} files (${orphanedMB} MB)`);
  console.log(`========================================\n`);

  if (orphanedObjects.length === 0) {
    console.log("✨ Bucket is 100% clean! No orphaned files found.");
    return;
  }

  console.log(`Sample of orphaned files:`);
  orphanedObjects.slice(0, 10).forEach((obj, idx) => {
    console.log(`   [${idx + 1}] ${obj.Key} (${((obj.Size || 0) / 1024).toFixed(1)} KB) - ${obj.LastModified}`);
  });
  if (orphanedObjects.length > 10) {
    console.log(`   ... and ${orphanedObjects.length - 10} more files.\n`);
  }

  if (!isDeleteMode) {
    console.log(`\n💡 To permanently delete these ${orphanedObjects.length} orphaned files, run:`);
    console.log(`   node scripts/cleanup-r2-orphans.mjs --delete\n`);
    return;
  }

  // 4. Safe batch deletion (batches of 1000 per S3 DeleteObjects limit)
  console.log(`\n🗑️  Permanently deleting ${orphanedObjects.length} orphaned files in R2...`);
  const batchSize = 500;
  let deletedCount = 0;

  for (let i = 0; i < orphanedObjects.length; i += batchSize) {
    const batch = orphanedObjects.slice(i, i + batchSize).map((o) => ({ Key: o.Key }));
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: { Objects: batch, Quiet: true },
      })
    );
    deletedCount += batch.length;
    console.log(`   Deleted ${deletedCount} of ${orphanedObjects.length}...`);
  }

  console.log(`\n✅ Successfully cleaned up ${deletedCount} orphaned files (${orphanedMB} MB recovered)!`);
}

main().catch((err) => {
  console.error("❌ Cleanup script failed:", err);
  process.exit(1);
});
