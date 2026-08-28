import React from "react";
import type { Metadata } from "next";
import { fetchProjectById } from "@/lib/supabase/queries";
import { EditProjectClient } from "./edit-project-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await fetchProjectById(id);

  return {
    title: project ? `Edit "${project.title}"` : "Edit Project — Craft",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = await fetchProjectById(id);

  return <EditProjectClient projectId={id} initialProject={project || undefined} />;
}
