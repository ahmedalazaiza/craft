import React from "react";
import type { Metadata } from "next";
import { BoardsClient } from "./boards-client";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 0; // Dynamic for personal user moodboards

export const metadata: Metadata = constructMetadata({
  title: "My Boards — Visual Moodboards & Curated Collections",
  description:
    "Organize, assemble, and curate design case studies into visual moodboards and 2x2 collage presentations.",
  path: "/boards",
});

export default function BoardsPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "My Boards", url: "/boards" },
  ]);

  return (
    <>
      <script
        key="jsonld-boards-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BoardsClient />
    </>
  );
}
