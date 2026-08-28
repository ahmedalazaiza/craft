import type { Metadata } from "next";
import { Project, Creator } from "./types";

export const SITE_NAME = "Craft";
export const SITE_TAGLINE = "Showcase Your Work & Connect with Creators";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function absoluteUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export const defaultTitle = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const defaultDescription =
  "A modern portfolio platform for designers, art directors, and makers to publish projects, build their studio profile, and discover inspiring work from creators worldwide.";

export const PRIMARY_KEYWORDS = [
  "portfolio platform",
  "design portfolio",
  "UI UX design",
  "brand identity showcase",
  "typography specimens",
  "architectural monographs",
  "creative directory",
  "design case studies",
  "creative direction",
  "independent designers",
  "visual arts showcase",
  "product design",
  "art direction",
  "craft design platform",
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
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "Design & Creative Portfolio",
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
  const description = project.summary || `A case study in ${project.category} crafted by ${project.creator.displayName} on ${SITE_NAME}.`;
  const canonicalUrl = absoluteUrl(`/project/${project.slug}`);

  return {
    title,
    description,
    keywords: [
      project.category,
      project.medium,
      ...project.tags,
      ...project.tools,
      project.creator.displayName,
      "case study",
      "portfolio project",
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
  const title = `${creator.displayName} (@${creator.username}) — Portfolio & Studio`;
  const description =
    creator.bio ||
    `Explore the creative portfolio, monographs, and craft disciplines of ${creator.displayName} (@${creator.username}) on ${SITE_NAME}.`;
  const canonicalUrl = absoluteUrl(`/u/${creator.username}`);

  return {
    title,
    description,
    keywords: [
      creator.displayName,
      creator.username,
      creator.city || creator.location,
      ...creator.skills,
      "designer portfolio",
      "creative director",
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
    logo: absoluteUrl("/default-avatar.svg"),
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
      jobTitle: project.creator.bio || "Creator",
      image: project.creator.avatarUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/default-avatar.svg"),
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
      sameAs: creator.website ? [creator.website] : [],
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
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(url),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
        image: item.image,
      })),
    },
  };
}
