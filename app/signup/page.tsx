import type { Metadata } from "next";
import { SignupClient } from "./signup-client";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Join the Craft studio collective and publish your design monographs.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupPage() {
  return <SignupClient />;
}
