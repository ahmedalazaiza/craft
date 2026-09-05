import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchBoardById } from "@/lib/supabase/queries";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { BoardDetailClient } from "./board-detail-client";

export const revalidate = 0; // Dynamic for personal moodboards

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { board } = await fetchBoardById(id);

  if (!board) {
    return {
      title: "Board Not Found",
      description: "The requested moodboard does not exist or has been removed.",
    };
  }

  return constructMetadata({
    title: `${board.title} — Moodboard on Craft`,
    description:
      board.description ||
      `Visual moodboard "${board.title}" curated with design projects and case studies on Craft.`,
    path: `/boards/${board.id}`,
  });
}

export default async function BoardDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { board, projects } = await fetchBoardById(id);

  if (!board) {
    notFound();
  }

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "My Boards", url: "/boards" },
    { name: board.title, url: `/boards/${board.id}` },
  ]);

  return (
    <>
      <script
        key="jsonld-board-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BoardDetailClient initialBoard={board} initialProjects={projects} />
    </>
  );
}
