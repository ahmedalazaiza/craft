import type { Metadata } from "next";
import { MeClient } from "./me-client";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your published projects, drafts, and profile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MemberDashboardPage() {
  return <MeClient />;
}
