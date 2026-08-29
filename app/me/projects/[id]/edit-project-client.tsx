"use client";

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Project } from "@/lib/types";
import { ProjectForm } from "@/components/project/project-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProjectEditorSkeleton } from "@/components/project/project-editor-skeleton";

interface EditProjectClientProps {
  projectId: string;
  initialProject?: Project;
}

export function EditProjectClient({ projectId, initialProject }: EditProjectClientProps) {
  const { projects, user, isLoadingDb } = useSession();

  // Find project in live session context (most up-to-date) or fallback to initialProject
  const project = projects.find((p) => p.id === projectId) || initialProject;

  // While DB is loading on reload and project not yet found
  if (isLoadingDb && !project) {
    return <ProjectEditorSkeleton />;
  }

  // If not logged in
  if (!user && !isLoadingDb) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-10 rounded-[28px] shadow-sm">
          <h1 className="type-title-section text-[var(--content-primary)]">
            Authentication Required
          </h1>
          <p className="mt-2 type-body-default text-[var(--content-secondary)]">
            You must be logged in as the author to edit this project.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login">
              <Button variant="accent" className="font-bold shadow-xs">Log in</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // If project is not found after loading
  if (!project) {
    notFound();
  }

  // If user is not the author of this project
  const isAuthor =
    user &&
    project.creator &&
    (user.id === project.creator.id ||
      user.username.toLowerCase() === project.creator.username.toLowerCase());

  if (!isAuthor && !isLoadingDb) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-10 rounded-[28px] shadow-sm">
          <h1 className="type-title-section text-[var(--content-primary)]">
            Access Denied
          </h1>
          <p className="mt-2 type-body-default text-[var(--content-secondary)]">
            You do not have permission to edit this case study. Only the original author can edit it.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href={`/project/${project.slug}`}>
              <Button variant="secondary">View Project</Button>
            </Link>
            <Link href={user ? `/u/${user.username}` : "/explore"}>
              <Button variant="accent">Go to My Studio</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <ProjectForm initialData={project} mode="edit" />;
}
