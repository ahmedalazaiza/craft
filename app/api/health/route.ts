import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = performance.now();
  let dbStatus: "connected" | "disconnected" | "error" = "connected";
  let dbLatencyMs = 0;
  let dbError: string | null = null;

  let categoriesCount = 0;
  let settingsConfigured = false;

  try {
    const dbStart = performance.now();
    // Lightweight probe using head-only count on profiles & categories and platform_settings check
    const [{ error: profileError }, { count: catCount, error: catError }, { data: settingsRow }] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("platform_settings").select("id").eq("id", "global").maybeSingle(),
    ]);
    dbLatencyMs = Math.round(performance.now() - dbStart);
    categoriesCount = catCount || 0;
    settingsConfigured = Boolean(settingsRow);

    if (profileError || catError) {
      dbStatus = "error";
      dbError = profileError?.message || catError?.message || "Error probing database";
    }
  } catch (err: unknown) {
    dbStatus = "disconnected";
    dbError = err instanceof Error ? err.message : "Unknown database connection error";
  }

  const isHealthy = dbStatus === "connected";
  const totalDurationMs = Math.round(performance.now() - startTime);

  const memory = process.memoryUsage ? {
    heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
  } : null;

  const payload = {
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: process.env.NODE_ENV || "development",
    version: "0.1.0",
    checks: {
      api: "ok",
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        categoriesCount,
        settingsConfigured,
        ...(dbError ? { error: dbError } : {}),
      },
    },
    performance: {
      responseTimeMs: totalDurationMs,
      ...(memory ? { memory } : {}),
    },
  };

  return NextResponse.json(payload, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
