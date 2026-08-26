"use client";

import React from "react";
import { notFound } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Project } from "@/lib/mock";
import { ProjectForm } from "@/components/project/project-form";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function EditProjectClient({ initialProject }: { initialProject: Project }) {
  const { projects } = useSession();

  const project = projects.find((p) => p.id === initialProject.id) || initialProject;

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6">
      <FadeIn>
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          items={[
            { label: "My Studio", href: "/me" },
            { label: "Edit Project", isCurrent: true },
          ]}
        />

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="type-label text-[var(--content-tertiary)] uppercase tracking-wider">
              Project Editor
            </span>
          </div>
          <h1 className="type-title-screen text-[var(--primary-forest-green)]">
            Edit: {project.title}
          </h1>
          <p className="mt-1.5 type-body-large text-[var(--content-secondary)]">
            Update project metadata, exhibition gallery spreads, or publication status.
          </p>
        </div>

        <ProjectForm initialData={project} mode="edit" />
      </FadeIn>
    </div>
  );
}
