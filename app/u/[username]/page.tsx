import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockUsers, getCreatorByUsername } from "@/lib/mock";
import { getProfileMetadata, generateProfileJsonLd } from "@/lib/seo";
import { CreatorProfileClient } from "./creator-profile-client";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateStaticParams() {
  return mockUsers.map((user) => ({
    username: user.username,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const creator = getCreatorByUsername(username);

  if (!creator) {
    return {
      title: "Creator Not Found",
      description: "The requested creator profile could not be found.",
    };
  }

  return getProfileMetadata(creator);
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const creator = getCreatorByUsername(username);

  if (!creator) {
    notFound();
  }

  const jsonLd = generateProfileJsonLd(creator);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CreatorProfileClient initialCreator={creator} />
    </>
  );
}
