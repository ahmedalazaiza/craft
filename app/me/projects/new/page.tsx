import type { Metadata } from "next";
import { NewProjectClient } from "./new-project-client";

export const metadata: Metadata = {
  title: "New Project",
  description: "Create and publish a new studio project on Layerat.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewProjectPage() {
  return <NewProjectClient />;
}
