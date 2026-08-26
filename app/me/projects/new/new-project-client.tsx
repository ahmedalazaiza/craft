"use client";

import React from "react";
import { ProjectForm } from "@/components/project/project-form";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function NewProjectClient() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6">
      <FadeIn>
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          items={[
            { label: "My Studio", href: "/me" },
            { label: "Publish New Project", isCurrent: true },
          ]}
        />

        <div className="mb-8">
          <h1 className="type-title-screen text-[var(--primary-forest-green)]">
            Create New Studio Monograph
          </h1>
          <p className="mt-1.5 type-body-large text-[var(--content-secondary)]">
            Document your process, design artifacts, and spatial identity systems.
          </p>
        </div>

        <ProjectForm mode="new" />
      </FadeIn>
    </div>
  );
}
