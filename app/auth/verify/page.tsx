import type { Metadata } from "next";
import { VerifyClient } from "./verify-client";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Confirm your email address on Layerat.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyPage() {
  return <VerifyClient />;
}
