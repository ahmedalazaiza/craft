import React, { cache } from "react";
import type { Metadata } from "next";
import { fetchCreatorByUsername, fetchProjects } from "@/lib/supabase/queries";
import { getProfileMetadata, generateProfileJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { CreatorProfileClient } from "./creator-profile-client";
import { CreatorNotFoundClient } from "@/components/creator/creator-not-found-client";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ username: string }>;
}

// Deduplicate fetch between generateMetadata and UserProfilePage in the same request
const getCreator = cache(async (username: string) => {
  return fetchCreatorByUsername(username);
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const creator = await getCreator(username);

  if (!creator) {
    return {
      title: `@${username} · Results Not Found`,
      description: `No creator profile found for @${username}. Search active designers and visual studios on Layerat.`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return getProfileMetadata(creator);
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const creator = await getCreator(username);

  if (!creator) {
    return <CreatorNotFoundClient searchedUsername={username} />;
  }

  // Fetch creator's published projects directly on the server (eliminates empty state delay and boosts LCP)
  const initialProjects = await fetchProjects({
    creatorId: creator.id,
    publishedOnly: true,
  });

  const profileJsonLd = generateProfileJsonLd(creator);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Creators", url: "/creators" },
    { name: creator.displayName, url: `/u/${creator.username}` },
  ]);

  return (
    <>
      <script
        key="jsonld-creator-profile"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
      <script
        key="jsonld-creator-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CreatorProfileClient initialCreator={creator} initialProjects={initialProjects || []} />
    </>
  );
}

