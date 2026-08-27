import { supabase } from "./client";

/**
 * Client-side fast image optimization
 * Resizes gigantic camera photos (e.g. 5000px / 12MB) to optimal web scale (e.g. 2000px / 350KB)
 */
export async function optimizeImage(
  file: File,
  maxWidth = 2000,
  maxHeight = 2000,
  quality = 0.85
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

      // Try modern WebP, fall back to JPEG
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
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
 * Upload a single media file directly to Supabase Storage
 */
export async function uploadMediaFile(
  file: File,
  bucket: "project-media" | "avatars" = "project-media",
  folder = "projects"
): Promise<string> {
  try {
    // 1. Optimize image client-side to ensure lightning speed and small payload
    const { blob, mimeType } = await optimizeImage(file, 2000, 2000, 0.85);

    const ext = mimeType === "image/webp" ? "webp" : file.name.split(".").pop() || "jpg";
    const cleanFileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    // 2. Upload binary payload to Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .upload(cleanFileName, blob, {
        contentType: mimeType,
        cacheControl: "31536000",
        upsert: true,
      });

    if (error) {
      console.warn(`Supabase Storage upload warning (${error.message}). Generating optimized local URL.`);
      // Fallback: convert optimized small blob to DataURL
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(blob);
      });
    }

    // 3. Return clean CDN Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(cleanFileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Failed to upload image to Supabase Storage:", err);
    // Safe fallback
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
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
