import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProjectBySlug, fetchProjects } from "@/lib/supabase/queries";
import { getProjectMetadata, generateProjectJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { ProjectDetailClient } from "./project-detail-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const projects = await fetchProjects({ publishedOnly: true });
    return projects.map((project) => ({
      slug: project.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProjectBySlug(slug);

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
  const project = await fetchProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const projectJsonLd = generateProjectJsonLd(project);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Explore", url: "/explore" },
    { name: project.category, url: `/explore?category=${encodeURIComponent(project.category)}` },
    { name: project.title, url: `/project/${project.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProjectDetailClient initialProject={project} />
    </>
  );
}
