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
      title: "Moodboard — Layerat",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  if (board.isPrivate) {
    return constructMetadata({
      title: `${board.title} — Moodboard`,
      description:
        board.description ||
        `Visual moodboard "${board.title}" curated on Layerat.`,
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${board.title} — Moodboard`,
    description:
      board.description ||
      `Visual moodboard "${board.title}" curated with design projects and case studies on Layerat.`,
    path: `/boards/${board.id}`,
    noIndex: false,
  });
}

export default async function BoardDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { board, projects } = await fetchBoardById(id);

  const breadcrumbJsonLd =
    board && !board.isPrivate
      ? generateBreadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "My Boards", url: "/boards" },
          { name: board.title, url: `/boards/${board.id}` },
        ])
      : null;

  return (
    <>
      {breadcrumbJsonLd && (
        <script
          key="jsonld-board-breadcrumb"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <BoardDetailClient
        boardId={id}
        initialBoard={board || null}
        initialProjects={projects || []}
      />
    </>
  );
}
