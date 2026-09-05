import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExploreClient } from "../explore-client";
import { constructMetadata, generateCollectionJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { fetchProjects, fetchCategories } from "@/lib/supabase/queries";
import { slugToCategory, normalizeCategory } from "@/lib/taxonomy";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((cat) => ({
    category: cat.id,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const categories = await fetchCategories();
  const cat = slugToCategory(slug, categories);

  if (!cat) {
    return {
      title: "Category Not Found",
      description: "The requested design discipline or category could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return constructMetadata({
    title: `${cat.name} Projects & Case Studies`,
    description:
      cat.description ||
      `Explore curated ${cat.name} case studies, design systems, and creative portfolios on Layerat.`,
    path: `/explore/${cat.id}`,
    keywords: [
      cat.name,
      `${cat.shortName} design portfolio`,
      `${cat.name} case studies`,
      ...cat.subCategories,
      ...cat.tags.slice(0, 8),
      "design projects showcase",
      "Layerat portfolios",
    ],
  });
}

export default async function CategoryExplorePage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const categories = await fetchCategories();
  const cat = slugToCategory(slug, categories);

  if (!cat) {
    notFound();
  }

  const allProjects = await fetchProjects({ publishedOnly: true });
  const normalizedTarget = normalizeCategory(cat.name, categories);

  // Filter projects belonging to this category
  const categoryProjects = (allProjects || []).filter((p) => {
    const projectNorm = normalizeCategory(p.category, categories);
    return projectNorm === normalizedTarget || p.category === cat.name;
  });

  const collectionJsonLd = generateCollectionJsonLd({
    name: `${cat.name} Projects & Case Studies`,
    description:
      cat.description ||
      `Explore curated ${cat.name} case studies, design systems, and creative portfolios on Layerat.`,
    url: `/explore/${cat.id}`,
    items: categoryProjects.map((p) => ({
      name: p.title,
      url: `/project/${p.slug}`,
      image: p.coverImage,
    })),
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Explore", url: "/explore" },
    { name: cat.name, url: `/explore/${cat.id}` },
  ]);

  return (
    <>
      <script
        key="jsonld-category-collection"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        key="jsonld-category-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ExploreClient
        initialProjects={allProjects || []}
        categoryTaxonomy={cat}
      />
    </>
  );
}
