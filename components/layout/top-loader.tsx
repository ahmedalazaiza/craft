"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session-context";

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoadingDb } = useSession();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When path or query params change, or initial db loading starts
    if (isLoadingDb) {
      setLoading(true);
      setProgress(25);

      const t1 = setTimeout(() => setProgress(65), 150);
      const t2 = setTimeout(() => setProgress(85), 350);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      // Completed
      setProgress(100);
      const t3 = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(t3);
    }
  }, [pathname, searchParams, isLoadingDb]);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none overflow-hidden bg-transparent"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full bg-gradient-to-r from-[var(--primary-forest-green)] via-[#962EE6] to-[var(--primary-forest-green)] shadow-[0_0_10px_#962EE6] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: "width, opacity",
        }}
      />
    </div>
  );
}
