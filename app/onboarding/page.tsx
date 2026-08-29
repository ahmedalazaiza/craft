import type { Metadata } from "next";
import { OnboardingClient } from "./onboarding-client";

export const metadata: Metadata = {
  title: "Account Setup · Layerat",
  description: "Configure your creator profile, upload your avatar, and set your design disciplines on Layerat.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
