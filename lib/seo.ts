import type { Metadata } from "next";
import { Project, Creator } from "./types";

export const SITE_NAME = "Craft";
export const SITE_TAGLINE = "The Portfolio Platform for Designers & Creators";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://craftplatform.com";

export function absoluteUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export const defaultTitle = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const defaultDescription =
  "Discover standout design portfolios, detailed UI & brand case studies, and connect with independent designers, art directors, and creative studios worldwide.";

export const PRIMARY_KEYWORDS = [
  "design portfolio platform",
  "UI UX design portfolio",
  "graphic design case studies",
  "brand identity showcase",
  "best designer portfolios 2026",
  "3D motion design portfolios",
  "typography and layout inspiration",
  "creative director portfolio",
  "independent designer directory",
  "digital product design case studies",
  "architectural design showcase",
  "creative studios portfolio",
  "freelance designer portfolio",
  "craft design platform",
  "hire top UI UX designers",
  "design case study platform",
];

export function constructMetadata({
  title,
  description = defaultDescription,
  image,
  path = "",
  noIndex = false,
  keywords = PRIMARY_KEYWORDS,
  type = "website",
}: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
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
    keywords,
    applicationName: SITE_NAME,
    authors: [{ name: "Craft Creators", url: SITE_URL }],
    creator: SITE_NAME,
    publisher: "Craft Platforms Inc.",
    category: "Design Portfolio & Creative Case Studies",
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
          alt: title || defaultTitle,
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
      creator: "@craftplatform",
      site: "@craftplatform",
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
  const description =
    project.summary ||
    `Explore ${project.title} by ${project.creator.displayName} — a ${project.category} case study in ${project.medium} on ${SITE_NAME}.`;
  const canonicalUrl = absoluteUrl(`/project/${project.slug}`);

  return {
    title,
    description,
    keywords: [
      project.title,
      project.category,
      project.medium,
      ...project.tags,
      ...project.tools,
      project.creator.displayName,
      `${project.category} case study`,
      "design portfolio project",
    ],
    authors: [{ name: project.creator.displayName, url: absoluteUrl(`/u/${project.creator.username}`) }],
    creator: project.creator.displayName,
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
      creator: `@${project.creator.username}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function getProfileMetadata(creator: Creator): Metadata {
  const title = `${creator.displayName} (@${creator.username}) — Design Portfolio`;
  const description =
    creator.bio ||
    `View the design portfolio, case studies, and creative work of ${creator.displayName} (@${creator.username}) on ${SITE_NAME}.`;
  const canonicalUrl = absoluteUrl(`/u/${creator.username}`);

  return {
    title,
    description,
    keywords: [
      creator.displayName,
      creator.username,
      creator.city || creator.location || "Global",
      ...creator.skills,
      "designer portfolio",
      "creative studio portfolio",
      "UI UX designer",
      "art director",
    ],
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
          width: 600,
          height: 600,
          alt: creator.displayName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [creator.avatarUrl],
      creator: `@${creator.username}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// =============================================================================
// JSON-LD STRUCTURED DATA GENERATORS (Schema.org)
// =============================================================================

export function generateWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "Craft Portfolio Platform",
    url: SITE_URL,
    description: defaultDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/og-image.png"),
    sameAs: [
      "https://twitter.com/craftplatform",
      "https://github.com/ahmedalazaiza/craft",
    ],
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
    })),
  };
}

export function generateProjectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": ["CreativeWork", "VisualArtwork", "Article"],
    headline: project.title,
    description: project.summary,
    image: [project.coverImage, ...project.galleryImages],
    datePublished: project.publishedAt,
    dateModified: project.publishedAt,
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: project.creator.displayName,
      alternateName: project.creator.username,
      url: absoluteUrl(`/u/${project.creator.username}`),
      jobTitle: project.creator.bio || "Designer",
      image: project.creator.avatarUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/og-image.png"),
      },
    },
    genre: project.category,
    keywords: project.tags.join(", "),
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: project.appreciations,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: project.comments?.length || 0,
      },
    ],
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
        addressLocality: creator.city || creator.location || "Worldwide",
      },
      url: absoluteUrl(`/u/${creator.username}`),
      knowsAbout: creator.skills,
    },
  };
}

export function generateCollectionJsonLd({
  name,
  description,
  url,
  items,
}: {
  name: string;
  description: string;
  url: string;
  items: { name: string; url: string; image?: string }[];
}) {
  return generateCollectionPageJsonLd(name, description, url, items);
}

export function generateCollectionPageJsonLd(
  title: string,
  description: string,
  url: string,
  items: { name: string; url: string; image?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: description,
    url: absoluteUrl(url),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.slice(0, 20).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
        image: item.image,
      })),
    },
  };
}
