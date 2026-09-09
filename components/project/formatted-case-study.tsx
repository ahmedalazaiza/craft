"use client";

import React from "react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface FormattedCaseStudyProps {
  content: string;
  className?: string;
}

export function FormattedCaseStudy({ content, className }: FormattedCaseStudyProps) {
  if (!content || !content.trim()) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = (key: number) => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ");
      elements.push(
        <p
          key={`p-${key}`}
          className="type-body-large text-[var(--content-secondary)] leading-relaxed font-normal"
        >
          {renderInlineMarkdown(text)}
        </p>
      );
      currentParagraph = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(index);
      return;
    }

    // Heading 1
    if (trimmed.startsWith("# ")) {
      flushParagraph(index);
      elements.push(
        <h2
          key={`h1-${index}`}
          className={cn(
            bricolage.className,
            "text-2xl sm:text-3xl font-black text-[var(--content-primary)] pt-6 pb-2 tracking-tight first:pt-0"
          )}
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </h2>
      );
      return;
    }

    // Heading 2
    if (trimmed.startsWith("## ")) {
      flushParagraph(index);
      elements.push(
        <h3
          key={`h2-${index}`}
          className={cn(
            bricolage.className,
            "text-xl sm:text-2xl font-black text-[var(--content-primary)] pt-5 pb-1.5 tracking-tight first:pt-0"
          )}
        >
          {renderInlineMarkdown(trimmed.slice(3))}
        </h3>
      );
      return;
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      flushParagraph(index);
      elements.push(
        <h4
          key={`h3-${index}`}
          className={cn(
            bricolage.className,
            "text-lg sm:text-xl font-bold text-[var(--content-primary)] pt-4 pb-1 tracking-tight first:pt-0"
          )}
        >
          {renderInlineMarkdown(trimmed.slice(4))}
        </h4>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushParagraph(index);
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-2 border-[var(--primary-forest-green)] pl-4 py-1.5 italic text-sm sm:text-base text-[var(--content-primary)] bg-[var(--bg-neutral)]/40 rounded-r-xl my-2"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Bullet point
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph(index);
      elements.push(
        <div key={`li-${index}`} className="flex items-start gap-2 text-sm sm:text-base text-[var(--content-secondary)] pl-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--content-primary)] mt-2 shrink-0" />
          <span>{renderInlineMarkdown(trimmed.slice(2))}</span>
        </div>
      );
      return;
    }

    // Regular line accumulator
    currentParagraph.push(trimmed);
  });

  flushParagraph(lines.length);

  return <div className={cn("space-y-4", className)}>{elements}</div>;
}

/**
 * Parses bold (`**text**`), italic (`*text*`), and inline code (`code`)
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Match bold **word** or *word*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-[var(--content-primary)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-[var(--content-primary)]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
