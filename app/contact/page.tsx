import { Metadata } from "next";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { ContactClient } from "./contact-client";

export const metadata: Metadata = constructMetadata({
  title: "Contact Us — Get in Touch with Layerat",
  description:
    "Have questions, feedback, partnership proposals, or need technical assistance? Send us a message and our team will get back to you promptly.",
  path: "/contact",
});

export default function ContactPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Contact Us", url: "/contact" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ContactClient />
    </>
  );
}
