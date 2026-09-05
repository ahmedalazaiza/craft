import { NextRequest, NextResponse } from "next/server";
import { isR2Configured, uploadBufferToR2, deleteKeysFromR2 } from "@/lib/r2/client";

export const dynamic = "force-dynamic";

// Allowed MIME types for media upload
const ALLOWED_MIME_TYPES = new Set([
  "image/webp",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

// Maximum allowed upload size (15MB)
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "Cloudflare R2 storage is not configured on the server." },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "projects";

    if (!file) {
      return NextResponse.json(
        { error: "No file was provided in the upload request." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 15MB size limit." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    // Determine clean file extension
    const extensionMap: Record<string, string> = {
      "image/webp": "webp",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/svg+xml": "svg",
      "image/avif": "avif",
    };
    const ext = extensionMap[file.type] || "webp";

    // Sanitize folder name
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    const cleanFileName = `${sanitizedFolder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicUrl = await uploadBufferToR2(buffer, cleanFileName, file.type);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key: cleanFileName,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload file to R2";
    console.error("Upload API route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "Cloudflare R2 storage is not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const keysToDelete: string[] = [];

    if (Array.isArray(body.keys)) {
      keysToDelete.push(...body.keys);
    }

    if (Array.isArray(body.urls)) {
      for (const url of body.urls) {
        if (typeof url === "string") {
          const match = url.match(/media\.layerat\.com\/(.+)$/);
          if (match && match[1]) {
            keysToDelete.push(match[1].split("?")[0]);
          }
        }
      }
    }

    if (keysToDelete.length > 0) {
      await deleteKeysFromR2(keysToDelete);
    }

    return NextResponse.json({
      success: true,
      deletedCount: keysToDelete.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete files from R2";
    console.error("Delete API route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
