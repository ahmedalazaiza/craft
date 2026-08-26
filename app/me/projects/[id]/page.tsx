import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockProjects, getProjectById } from "@/lib/mock";
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
  const project = getProjectById(id);

  return {
    title: project ? `Edit "${project.title}"` : "Edit Project",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return <EditProjectClient initialProject={project} />;
}
