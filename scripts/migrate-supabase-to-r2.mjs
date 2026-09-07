import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load environment variables from .env.local
const envFile = fs.readFileSync(".env.local", "utf8");
const envVars = {};
envFile.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["\']|["\']$/g, "");
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const accountId = envVars.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = envVars.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = envVars.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = envVars.CLOUDFLARE_R2_BUCKET_NAME || "layerat-media";
const r2PublicUrl = (envVars.NEXT_PUBLIC_R2_PUBLIC_URL || "https://media.layerat.com").replace(/\/$/, "");

if (!supabaseUrl || !supabaseAnonKey || !accountId || !accessKeyId || !secretAccessKey) {
  console.error("Missing required Supabase or Cloudflare R2 credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

async function uploadToR2(url, targetFolder = "plates") {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/webp";

    // Extract or build filename
    const filename = url.split("/").pop() || `${Date.now()}.webp`;
    const key = `${targetFolder}/${filename}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    return `${r2PublicUrl}/${key}`;
  } catch (err) {
    console.error(`Failed to migrate ${url}:`, err.message);
    return null;
  }
}

async function migrate() {
  console.log("=== Starting Supabase -> Cloudflare R2 Media Migration ===");

  // 1. Fetch projects containing Supabase URLs
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, cover_image, gallery_images");

  if (error) {
    console.error("Error fetching projects:", error);
    return;
  }

  for (const p of projects) {
    let updated = false;
    let newCover = p.cover_image;
    let newGallery = Array.isArray(p.gallery_images) ? [...p.gallery_images] : [];

    // Migrate cover
    if (newCover && newCover.includes("supabase.co")) {
      console.log(`Migrating cover for project "${p.title}"...`);
      const r2Url = await uploadToR2(newCover, "plates");
      if (r2Url) {
        newCover = r2Url;
        updated = true;
      }
    }

    // Migrate gallery
    for (let i = 0; i < newGallery.length; i++) {
      const img = newGallery[i];
      if (typeof img === "string" && img.includes("supabase.co")) {
        console.log(`Migrating gallery image [${i}] for "${p.title}"...`);
        const r2Url = await uploadToR2(img, "plates");
        if (r2Url) {
          newGallery[i] = r2Url;
          updated = true;
        }
      }
    }

    if (updated) {
      const { error: updateErr } = await supabase
        .from("projects")
        .update({
          cover_image: newCover,
          gallery_images: newGallery,
        })
        .eq("id", p.id);

      if (updateErr) {
        console.error(`Failed to update project ${p.id}:`, updateErr.message);
      } else {
        console.log(`✅ Successfully updated project "${p.title}" to Cloudflare R2!`);
      }
    }
  }

  // 2. Fetch profiles with Supabase avatars
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, username, avatar_url");

  if (!profErr && profiles) {
    for (const prof of profiles) {
      if (prof.avatar_url && prof.avatar_url.includes("supabase.co")) {
        console.log(`Migrating avatar for user @${prof.username}...`);
        const r2Url = await uploadToR2(prof.avatar_url, "avatars");
        if (r2Url) {
          await supabase
            .from("profiles")
            .update({ avatar_url: r2Url })
            .eq("id", prof.id);
          console.log(`✅ Migrated avatar for @${prof.username} to ${r2Url}`);
        }
      }
    }
  }

  console.log("=== Migration completed successfully! ===");
}

migrate();
