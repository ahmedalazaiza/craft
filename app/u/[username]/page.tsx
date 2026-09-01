import React from "react";
import type { Metadata } from "next";
import { fetchCreatorByUsername } from "@/lib/supabase/queries";
import { getProfileMetadata, generateProfileJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { CreatorProfileClient } from "./creator-profile-client";
import { CreatorNotFoundClient } from "@/components/creator/creator-not-found-client";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const creator = await fetchCreatorByUsername(username);

  if (!creator) {
    return {
      title: `@${username} · Results Not Found`,
      description: `No creator profile found for @${username}. Search active designers and visual studios on Layerat.`,
    };
  }

  return getProfileMetadata(creator);
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const creator = await fetchCreatorByUsername(username);

  if (!creator) {
    return <CreatorNotFoundClient searchedUsername={username} />;
  }

  const profileJsonLd = generateProfileJsonLd(creator);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Creators", url: "/creators" },
    { name: creator.displayName, url: `/u/${creator.username}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CreatorProfileClient initialCreator={creator} />
    </>
  );
}
