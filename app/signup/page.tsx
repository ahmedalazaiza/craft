import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupClient } from "./signup-client";

export const metadata: Metadata = {
  title: "Join as a Creator",
  description: "Create your portfolio and publish your creative work on Layerat.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupClient />
    </Suspense>
  );
}
