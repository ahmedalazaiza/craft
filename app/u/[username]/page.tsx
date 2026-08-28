import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCreatorByUsername, fetchCreators } from "@/lib/supabase/queries";
import { getProfileMetadata, generateProfileJsonLd } from "@/lib/seo";
import { CreatorProfileClient } from "./creator-profile-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateStaticParams() {
  try {
    const creators = await fetchCreators();
    return creators.map((user) => ({
      username: user.username,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const creator = await fetchCreatorByUsername(username);

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
  const creator = await fetchCreatorByUsername(username);

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
