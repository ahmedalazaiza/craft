import { Metadata } from "next";
import { HomeClient } from "./home-client";
import { constructMetadata } from "@/lib/seo";
import { fetchProjects, fetchCreators } from "@/lib/supabase/queries";

export const metadata: Metadata = constructMetadata({
  path: "/",
});

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [projects, creators] = await Promise.all([
    fetchProjects({ publishedOnly: false }),
    fetchCreators(),
  ]);

  return (
    <HomeClient
      initialProjects={projects || []}
      initialCreators={creators || []}
    />
  );
}
