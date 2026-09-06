import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCallbackClient } from "./callback-client";

export const metadata: Metadata = {
  title: "Authenticating · Layerat",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--content-primary)] border-t-transparent" />
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
