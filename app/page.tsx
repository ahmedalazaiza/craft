import { Metadata } from "next";
import { HomeClient } from "./home-client";
import { constructMetadata, generateWebSiteJsonLd, generateOrganizationJsonLd } from "@/lib/seo";
import { fetchProjects, fetchCreators } from "@/lib/supabase/queries";

export const metadata: Metadata = constructMetadata({
  path: "/",
});

export const revalidate = 60;

export default async function HomePage() {
  const [projects, creators] = await Promise.all([
    fetchProjects({ publishedOnly: true }),
    fetchCreators(),
  ]);

  const webSiteJsonLd = generateWebSiteJsonLd();
  const organizationJsonLd = generateOrganizationJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomeClient
        initialProjects={projects || []}
        initialCreators={creators || []}
      />
    </>
  );
}
