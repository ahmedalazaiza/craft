import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CommunityClient } from "./community-client";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: "Design Community Feed — A/B Tests, Polls & Discussions",
  description:
    "Join the Layerat creative community. Share design discussions, run A/B tests on UI mockups, conduct interactive polls, and get feedback from designers worldwide.",
  path: "/community",
  keywords: [
    "design community feed",
    "A/B testing design",
    "UI UX design polls",
    "design feedback and critique",
    "creative discussions",
    "Arab designers social feed",
    "designers community",
  ],
});

export default function CommunityPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Community", url: "/community" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="text-sm font-mono text-[var(--content-tertiary)]">
              Loading Community Hub...
            </div>
          </div>
        }
      >
        <CommunityClient />
      </Suspense>
    </>
  );
}
