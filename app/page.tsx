import { Metadata } from "next";
import { HomeClient } from "./home-client";
import { defaultTitle, defaultDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: defaultTitle,
  description: defaultDescription,
};

export default function HomePage() {
  return <HomeClient />;
}
