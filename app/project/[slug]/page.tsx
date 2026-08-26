import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockProjects, getProjectBySlug } from "@/lib/mock";
import { fetchProjectBySlug } from "@/lib/supabase/queries";
import { getProjectMetadata, generateProjectJsonLd } from "@/lib/seo";
import { ProjectDetailClient } from "./project-detail-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return mockProjects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = (await fetchProjectBySlug(slug)) || getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
    };
  }

  return getProjectMetadata(project);
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = (await fetchProjectBySlug(slug)) || getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const jsonLd = generateProjectJsonLd(project);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectDetailClient initialProject={project} />
    </>
  );
}
