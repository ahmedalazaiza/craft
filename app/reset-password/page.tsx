import type { Metadata } from "next";
import { ResetPasswordClient } from "./reset-password-client";

export const metadata: Metadata = {
  title: "Set New Password · Craft",
  description: "Set your new secure Craft creator password.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
