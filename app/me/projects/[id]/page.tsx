import React from "react";
import type { Metadata } from "next";
import { mockProjects, getProjectById } from "@/lib/mock";
import { fetchProjectById } from "@/lib/supabase/queries";
import { EditProjectClient } from "./edit-project-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return mockProjects.map((project) => ({
    id: project.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id) || (await fetchProjectById(id));

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
  const project = getProjectById(id) || (await fetchProjectById(id));

  return <EditProjectClient projectId={id} initialProject={project || undefined} />;
}
