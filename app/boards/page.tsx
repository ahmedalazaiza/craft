import React from "react";
import type { Metadata } from "next";
import { BoardsClient } from "./boards-client";
import { constructMetadata } from "@/lib/seo";

export const revalidate = 0; // Dynamic for personal user moodboards

export const metadata: Metadata = constructMetadata({
  title: "My Boards — Visual Moodboards & Curated Collections",
  description:
    "Organize, assemble, and curate design case studies into visual moodboards and 2x2 collage presentations on Layerat.",
  noIndex: true,
});

export default function BoardsPage() {
  return <BoardsClient />;
}
