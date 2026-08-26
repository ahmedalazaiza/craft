import type { Metadata } from "next";
import { Project, Creator, getProjectBySlug, getCreatorByUsername } from "./mock";

export const SITE_NAME = "Craft";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function absoluteUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export const defaultTitle = "Craft — Showcase Your Work & Connect with Creators";
export const defaultDescription =
  "A modern portfolio platform for designers, art directors, and makers to publish projects, build their profile, and discover inspiring work from creators worldwide.";

export function constructMetadata({
  title,
  description = defaultDescription,
  image,
  path = "",
  noIndex = false,
  type = "website",
}: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
  type?: "website" | "article" | "profile";
} = {}): Metadata {
  const pageTitle = title ? `${title} · ${SITE_NAME}` : defaultTitle;
  const canonicalUrl = absoluteUrl(path);
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : absoluteUrl(image)
    : absoluteUrl("/og-image.png");

  return {
    title: title ? title : { default: defaultTitle, template: `%s · ${SITE_NAME}` },
    description,
    applicationName: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
        },
      ],
      locale: "en_US",
      type: type === "profile" ? "profile" : type === "article" ? "article" : "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

export function getProjectMetadata(project: Project): Metadata {
  const title = project.title;
  const description = project.summary;
  const canonicalUrl = absoluteUrl(`/project/${project.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: project.publishedAt,
      authors: [project.creator.displayName],
      tags: project.tags,
      images: [
        {
          url: project.coverImage,
          width: 1400,
          height: 900,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [project.coverImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function getProfileMetadata(creator: Creator): Metadata {
  const title = `${creator.displayName} (@${creator.username}) — Portfolio`;
  const description = creator.bio;
  const canonicalUrl = absoluteUrl(`/u/${creator.username}`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "profile",
      images: [
        {
          url: creator.avatarUrl,
          width: 400,
          height: 400,
          alt: creator.displayName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [creator.avatarUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateProjectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    headline: project.title,
    description: project.summary,
    image: [project.coverImage, ...project.galleryImages],
    datePublished: project.publishedAt,
    author: {
      "@type": "Person",
      name: project.creator.displayName,
      url: absoluteUrl(`/u/${project.creator.username}`),
      jobTitle: project.creator.bio,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    genre: project.category,
    keywords: project.tags.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/project/${project.slug}`),
    },
  };
}

export function generateProfileJsonLd(creator: Creator) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: creator.displayName,
      alternateName: creator.username,
      description: creator.bio,
      image: creator.avatarUrl,
      address: {
        "@type": "PostalAddress",
        addressLocality: creator.city || creator.location,
      },
      url: absoluteUrl(`/u/${creator.username}`),
      sameAs: creator.website ? [creator.website] : [],
      knowsAbout: creator.skills,
    },
  };
}
