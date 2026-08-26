import type { Metadata } from "next";
import { MeClient } from "./me-client";

export const metadata: Metadata = {
  title: "Studio Dashboard",
  description: "Manage your published monographs, drafts, and studio profile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MemberDashboardPage() {
  return <MeClient />;
}
