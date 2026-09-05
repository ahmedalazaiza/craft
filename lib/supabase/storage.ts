import { supabase } from "./client";

/**
 * Client-side fast image optimization
 * Resizes camera photos to optimal web scale (e.g. 2000px / WebP) with high quality
 */
export async function optimizeImage(
  file: File,
  maxWidth = 2000,
  maxHeight = 2000,
  quality = 0.88
): Promise<{ blob: Blob; mimeType: string }> {
  // If it's already a small SVG or GIF, return as is
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return { blob: file, mimeType: file.type };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ blob: file, mimeType: file.type });
        return;
      }

      // Smooth interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // WebP compression for superior quality & small size
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, mimeType: "image/webp" });
          } else {
            resolve({ blob: file, mimeType: file.type });
          }
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      resolve({ blob: file, mimeType: file.type });
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Upload a single media file directly to Supabase Storage and return CDN URL
 */
export async function uploadMediaFile(
  file: File,
  bucket: "project-media" | "avatars" = "project-media",
  folder = "projects"
): Promise<string> {
  try {
    // 1. Optimize image client-side to WebP
    const { blob, mimeType } = await optimizeImage(file, 2000, 2000, 0.88);

    // 2. Attempt primary high-speed upload to Cloudflare R2 via /api/upload
    try {
      const ext = mimeType === "image/webp" ? "webp" : file.name.split(".").pop() || "jpg";
      const webpFile = new File([blob], `${Date.now()}.${ext}`, { type: mimeType });
      const formData = new FormData();
      formData.append("file", webpFile);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          return data.url;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn("Cloudflare R2 upload returned non-OK status, falling back to Supabase:", errJson);
      }
    } catch (r2Err) {
      console.warn("Cloudflare R2 upload attempt failed, gracefully falling back to Supabase Storage:", r2Err);
    }

    // 3. Fallback: Upload binary payload to Supabase Storage
    const ext = mimeType === "image/webp" ? "webp" : file.name.split(".").pop() || "jpg";
    const cleanFileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(cleanFileName, blob, {
        contentType: mimeType,
        cacheControl: "31536000",
        upsert: true,
      });

    if (error) {
      console.warn(`Supabase Storage upload warning (${error.message}).`);
    }

    // 4. Return clean CDN Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(cleanFileName);

    return (
      publicUrlData?.publicUrl ||
      `https://ttjobsgglwgyioqlldqj.supabase.co/storage/v1/object/public/${bucket}/${cleanFileName}`
    );
  } catch (err) {
    console.error("Failed to upload image:", err);
    throw err;
  }
}

/**
 * Upload multiple media files with live progress tracking
 */
export async function uploadMultipleMediaFiles(
  files: FileList | File[],
  bucket: "project-media" | "avatars" = "project-media",
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const fileArray = Array.from(files);
  const total = fileArray.length;
  const urls: string[] = [];
  let completed = 0;

  // Process in parallel batches of 3 for speed without choking the connection
  const batchSize = 3;
  for (let i = 0; i < total; i += batchSize) {
    const batch = fileArray.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (file) => {
        const url = await uploadMediaFile(file, bucket, "plates");
        completed++;
        if (onProgress) onProgress(completed, total);
        return url;
      })
    );
    urls.push(...batchResults);
  }

  return urls;
}

/**
 * Delete media files from Supabase Storage bucket by their CDN URLs (Hard Delete)
 */
export async function deleteStorageFiles(
  urls: string[],
  defaultBucket: "project-media" | "avatars" = "project-media"
): Promise<boolean> {
  try {
    if (!urls || urls.length === 0) return true;

    // Separate R2 URLs/keys and Supabase URLs
    const r2Keys: string[] = [];
    const r2Urls: string[] = [];
    const bucketPaths: Record<string, string[]> = {};

    for (const url of urls) {
      if (!url || typeof url !== "string") continue;

      if (url.includes("media.layerat.com")) {
        r2Urls.push(url);
        const match = url.match(/media\.layerat\.com\/(.+)$/);
        if (match && match[1]) {
          r2Keys.push(match[1].split("?")[0]);
        }
        continue;
      }

      if (url.includes(".r2.cloudflarestorage.com")) {
        r2Urls.push(url);
        const parts = url.split(".r2.cloudflarestorage.com/");
        if (parts[1]) {
          const sub = parts[1].split("?")[0];
          r2Keys.push(sub.replace(/^[^/]+\//, ""));
        }
        continue;
      }

      // Extract bucket and path from URL: /storage/v1/object/public/{bucket}/{path}
      const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
      if (match) {
        const bucket = match[1];
        const path = match[2].split("?")[0]; // Remove query params if any
        if (!bucketPaths[bucket]) bucketPaths[bucket] = [];
        bucketPaths[bucket].push(path);
      } else if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:")) {
        // Plain path passed
        if (!bucketPaths[defaultBucket]) bucketPaths[defaultBucket] = [];
        bucketPaths[defaultBucket].push(url);
      }
    }

    let allSuccess = true;

    // Delete from Cloudflare R2 if applicable
    if (r2Keys.length > 0 || r2Urls.length > 0) {
      try {
        if (typeof window === "undefined") {
          // Running on Node.js Server: direct invocation
          const { deleteKeysFromR2 } = await import("@/lib/r2/client");
          await deleteKeysFromR2(r2Keys);
        } else {
          // Running on Client: call internal API
          const res = await fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: r2Urls, keys: r2Keys }),
          });
          if (!res.ok) {
            allSuccess = false;
            console.warn("Failed to delete some files from Cloudflare R2.");
          }
        }
      } catch (r2DelErr) {
        allSuccess = false;
        console.warn("Error calling R2 delete endpoint:", r2DelErr);
      }
    }

    // Delete from Supabase Storage
    for (const [bucket, paths] of Object.entries(bucketPaths)) {
      if (paths.length > 0) {
        const { error } = await supabase.storage.from(bucket).remove(paths);
        if (error) {
          console.warn(`Supabase Storage remove warning for bucket ${bucket}:`, error.message);
          allSuccess = false;
        }
      }
    }

    return allSuccess;
  } catch (err) {
    console.error("Failed to delete media files:", err);
    return false;
  }
}
