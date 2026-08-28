import { Metadata } from "next";
import { HomeClient } from "./home-client";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  path: "/",
});

export default function HomePage() {
  return <HomeClient />;
}
