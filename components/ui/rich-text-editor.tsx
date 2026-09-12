"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  Quote,
  RemoveFormatting,
  Code,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string; // Markdown string
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];
  let inList = false;

  const closeListIfOpen = () => {
    if (inList) {
      htmlParts.push("</ul>");
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      closeListIfOpen();
      htmlParts.push("<p><br></p>");
      continue;
    }

    // List item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        htmlParts.push("<ul>");
        inList = true;
      }
      const itemContent = formatInline(trimmed.slice(2));
      htmlParts.push(`<li>${itemContent}</li>`);
      continue;
    }

    closeListIfOpen();

    // Headings
    if (trimmed.startsWith("## ")) {
      htmlParts.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      htmlParts.push(`<h2>${formatInline(trimmed.slice(2))}</h2>`);
    } else if (trimmed.startsWith("### ")) {
      htmlParts.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("> ")) {
      htmlParts.push(`<blockquote>${formatInline(trimmed.slice(2))}</blockquote>`);
    } else {
      htmlParts.push(`<p>${formatInline(trimmed)}</p>`);
    }
  }

  closeListIfOpen();
  return htmlParts.join("");
}

function formatInline(text: string): string {
  let res = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold: **text**
  res = res.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Italic: *text*
  res = res.replace(/\*(.*?)\*/g, "<em>$1</em>");
  return res;
}

export function htmlToMarkdown(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") return html;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const processNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue || "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const el = node as HTMLElement;
    const tagName = el.tagName.toUpperCase();

    const getChildrenMd = (): string => {
      let inner = "";
      for (const child of Array.from(el.childNodes)) {
        inner += processNode(child);
      }
      return inner;
    };

    switch (tagName) {
      case "H1":
      case "H2": {
        const text = getChildrenMd().trim();
        return text ? `\n\n## ${text}\n\n` : "\n";
      }
      case "H3":
      case "H4": {
        const text = getChildrenMd().trim();
        return text ? `\n\n### ${text}\n\n` : "\n";
      }
      case "BLOCKQUOTE": {
        const text = getChildrenMd().trim();
        return text ? `\n\n> ${text}\n\n` : "\n";
      }
      case "UL": {
        let listMd = "\n";
        for (const child of Array.from(el.childNodes)) {
          if ((child as HTMLElement).tagName?.toUpperCase() === "LI") {
            const liText = processNode(child).trim();
            if (liText) listMd += `- ${liText}\n`;
          }
        }
        return `${listMd}\n`;
      }
      case "OL": {
        let listMd = "\n";
        let idx = 1;
        for (const child of Array.from(el.childNodes)) {
          if ((child as HTMLElement).tagName?.toUpperCase() === "LI") {
            const liText = processNode(child).trim();
            if (liText) listMd += `${idx++}. ${liText}\n`;
          }
        }
        return `${listMd}\n`;
      }
      case "LI": {
        return getChildrenMd();
      }
      case "P":
      case "DIV": {
        const text = getChildrenMd().trim();
        return text ? `\n\n${text}\n\n` : "\n";
      }
      case "STRONG":
      case "B": {
        const text = getChildrenMd();
        return text ? `**${text}**` : "";
      }
      case "EM":
      case "I": {
        const text = getChildrenMd();
        return text ? `*${text}*` : "";
      }
      case "BR":
        return "\n";
      default:
        return getChildrenMd();
    }
  };

  let md = "";
  for (const child of Array.from(tempDiv.childNodes)) {
    md += processNode(child);
  }

  return md.replace(/\n{3,}/g, "\n\n").trim();
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your case study story, problem statement, and design rationale here...",
  className,
  minHeight = "160px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // View Mode: visual WYSIWYG vs raw markdown view
  const [viewMode, setViewMode] = useState<"visual" | "markdown">("visual");

  // Selection states
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    h2: false,
    h3: false,
    quote: false,
    list: false,
  });

  // Floating selection bubble
  const [floatingToolbarPos, setFloatingToolbarPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Synchronize incoming markdown into editor HTML when value changes externally
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (editorRef.current) {
      const currentMd = htmlToMarkdown(editorRef.current.innerHTML);
      if (currentMd !== value) {
        editorRef.current.innerHTML = markdownToHtml(value);
      }
    }
  }, [value]);

  // Query active formats at the current selection
  const updateActiveFormats = useCallback(() => {
    if (typeof document === "undefined") return;
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode || !editorRef.current?.contains(sel.anchorNode)) {
      setFloatingToolbarPos(null);
      return;
    }

    let isBold = false;
    let isItalic = false;
    let isH2 = false;
    let isH3 = false;
    let isQuote = false;
    let isList = false;

    try {
      isBold = document.queryCommandState("bold");
      isItalic = document.queryCommandState("italic");
    } catch {}

    // Check parent block tags
    let curr: Node | null = sel.anchorNode;
    while (curr && curr !== editorRef.current) {
      if (curr.nodeType === Node.ELEMENT_NODE) {
        const el = curr as HTMLElement;
        const tag = el.tagName.toUpperCase();
        if (tag === "H2") isH2 = true;
        if (tag === "H3") isH3 = true;
        if (tag === "BLOCKQUOTE") isQuote = true;
        if (tag === "UL" || tag === "LI") isList = true;
      }
      curr = curr.parentNode;
    }

    setActiveFormats({
      bold: isBold,
      italic: isItalic,
      h2: isH2,
      h3: isH3,
      quote: isQuote,
      list: isList,
    });

    // Check for non-empty text selection to position floating bubble
    const selText = sel.toString().trim();
    if (selText && sel.rangeCount > 0 && containerRef.current) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Only show if selection is within container
      if (rect.width > 0) {
        setFloatingToolbarPos({
          top: rect.top - containerRect.top - 42,
          left: Math.max(
            10,
            Math.min(
              rect.left - containerRect.left + rect.width / 2 - 120,
              containerRect.width - 260
            )
          ),
        });
      } else {
        setFloatingToolbarPos(null);
      }
    } else {
      setFloatingToolbarPos(null);
    }
  }, []);

  const handleInput = () => {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    const md = htmlToMarkdown(editorRef.current.innerHTML);
    onChange(md);
    updateActiveFormats();
  };

  const applyFormat = (command: string, arg?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === "formatBlock") {
      let currentBlock = "";
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        let curr: Node | null = sel.anchorNode;
        while (curr && curr !== editorRef.current) {
          if (curr.nodeType === Node.ELEMENT_NODE) {
            currentBlock = (curr as HTMLElement).tagName.toLowerCase();
            break;
          }
          curr = curr.parentNode;
        }
      }

      const targetBlock = (arg || "p").replace(/[<>]/g, "").toLowerCase();
      if (currentBlock === targetBlock) {
        document.execCommand("formatBlock", false, "<p>");
      } else {
        document.execCommand("formatBlock", false, arg || "<p>");
      }
    } else if (command === "removeFormat") {
      document.execCommand("removeFormat");
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand(command, false, arg);
    }

    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        applyFormat("bold");
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        applyFormat("italic");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] overflow-hidden shadow-2xs transition-all focus-within:border-[var(--primary-forest-green)] focus-within:ring-2 focus-within:ring-[var(--primary-forest-green)]/15",
        className
      )}
    >
      {/* Top Format Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-[var(--bg-neutral)]/80 border-b border-[var(--border-neutral)]">
        <div className="flex flex-wrap items-center gap-1">
          {/* Heading 2 */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("formatBlock", "<h2>");
            }}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none",
              activeFormats.h2
                ? "bg-[var(--primary-forest-green)] text-white shadow-xs"
                : "bg-[var(--bg-elevated)] hover:bg-[var(--bg-screen)] text-[var(--content-primary)] border border-[var(--border-neutral)] hover:border-[var(--content-secondary)]/40"
            )}
            title="Heading 2 (Section Title)"
          >
            <Heading2 className="h-3.5 w-3.5" />
            <span className="text-[11px]">Heading</span>
          </button>

          {/* Heading 3 */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("formatBlock", "<h3>");
            }}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none",
              activeFormats.h3
                ? "bg-[var(--primary-forest-green)] text-white shadow-xs"
                : "bg-[var(--bg-elevated)] hover:bg-[var(--bg-screen)] text-[var(--content-primary)] border border-[var(--border-neutral)] hover:border-[var(--content-secondary)]/40"
            )}
            title="Heading 3 (Subhead)"
          >
            <Heading3 className="h-3.5 w-3.5" />
            <span className="text-[11px]">Subhead</span>
          </button>

          <span className="h-4 w-[1px] bg-[var(--border-neutral)] mx-1" />

          {/* Bold */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("bold");
            }}
            className={cn(
              "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
              activeFormats.bold
                ? "bg-[var(--primary-forest-green)] text-white shadow-xs"
                : "bg-[var(--bg-elevated)] hover:bg-[var(--bg-screen)] text-[var(--content-primary)] border border-[var(--border-neutral)]"
            )}
            title="Bold (Ctrl/Cmd + B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("italic");
            }}
            className={cn(
              "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
              activeFormats.italic
                ? "bg-[var(--primary-forest-green)] text-white shadow-xs"
                : "bg-[var(--bg-elevated)] hover:bg-[var(--bg-screen)] text-[var(--content-primary)] border border-[var(--border-neutral)]"
            )}
            title="Italic (Ctrl/Cmd + I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          <span className="h-4 w-[1px] bg-[var(--border-neutral)] mx-1" />

          {/* Bullet List */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("insertUnorderedList");
            }}
            className={cn(
              "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
              activeFormats.list
                ? "bg-[var(--primary-forest-green)] text-white shadow-xs"
                : "bg-[var(--bg-elevated)] hover:bg-[var(--bg-screen)] text-[var(--content-primary)] border border-[var(--border-neutral)]"
            )}
            title="Bullet List"
          >
            <List className="h-3.5 w-3.5" />
          </button>

          {/* Blockquote */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("formatBlock", "<blockquote>");
            }}
            className={cn(
              "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
              activeFormats.quote
                ? "bg-[var(--primary-forest-green)] text-white shadow-xs"
                : "bg-[var(--bg-elevated)] hover:bg-[var(--bg-screen)] text-[var(--content-primary)] border border-[var(--border-neutral)]"
            )}
            title="Quote / Key Takeaway"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("removeFormat");
            }}
            className="p-1.5 rounded-lg text-xs font-bold bg-[var(--bg-elevated)] hover:bg-[var(--bg-screen)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] border border-[var(--border-neutral)] transition-all cursor-pointer select-none"
            title="Normal Paragraph / Clear formatting"
          >
            <RemoveFormatting className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[var(--bg-elevated)] p-0.5 rounded-xl border border-[var(--border-neutral)]">
          <button
            type="button"
            onClick={() => setViewMode("visual")}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
              viewMode === "visual"
                ? "bg-[var(--bg-neutral)] text-[var(--content-primary)] shadow-2xs"
                : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
            )}
          >
            <Eye className="h-3 w-3" />
            <span>Visual</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("markdown")}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
              viewMode === "markdown"
                ? "bg-[var(--bg-neutral)] text-[var(--content-primary)] shadow-2xs"
                : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
            )}
          >
            <Code className="h-3 w-3" />
            <span>Markdown</span>
          </button>
        </div>
      </div>

      {/* Floating Selection Toolbar (Pops up when text is highlighted) */}
      {floatingToolbarPos && viewMode === "visual" && (
        <div
          style={{
            top: `${floatingToolbarPos.top}px`,
            left: `${floatingToolbarPos.left}px`,
          }}
          className="absolute z-50 flex items-center gap-1 p-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-xl shadow-xl border border-neutral-700/40 animate-fade-in text-xs font-bold"
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("bold");
            }}
            className={cn(
              "p-1.5 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors cursor-pointer",
              activeFormats.bold && "bg-neutral-700 dark:bg-neutral-300"
            )}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("italic");
            }}
            className={cn(
              "p-1.5 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors cursor-pointer",
              activeFormats.italic && "bg-neutral-700 dark:bg-neutral-300"
            )}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          <span className="h-3.5 w-[1px] bg-neutral-700 dark:bg-neutral-300 mx-0.5" />

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("formatBlock", "<h2>");
            }}
            className={cn(
              "px-2 py-1 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 text-[11px] font-bold transition-colors cursor-pointer",
              activeFormats.h2 && "bg-neutral-700 dark:bg-neutral-300"
            )}
            title="Heading 2"
          >
            H2
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("formatBlock", "<h3>");
            }}
            className={cn(
              "px-2 py-1 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 text-[11px] font-bold transition-colors cursor-pointer",
              activeFormats.h3 && "bg-neutral-700 dark:bg-neutral-300"
            )}
            title="Heading 3"
          >
            H3
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("insertUnorderedList");
            }}
            className={cn(
              "p-1.5 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors cursor-pointer",
              activeFormats.list && "bg-neutral-700 dark:bg-neutral-300"
            )}
            title="List"
          >
            <List className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("formatBlock", "<blockquote>");
            }}
            className={cn(
              "p-1.5 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors cursor-pointer",
              activeFormats.quote && "bg-neutral-700 dark:bg-neutral-300"
            )}
            title="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Editor Body */}
      {viewMode === "visual" ? (
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onSelect={updateActiveFormats}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
            style={{ minHeight }}
            className="rich-editor-content p-4 sm:p-5 text-sm text-[var(--content-primary)] leading-relaxed focus:outline-none overflow-y-auto max-h-[360px]"
          />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          style={{ minHeight }}
          className="w-full p-4 sm:p-5 text-xs font-mono bg-transparent text-[var(--content-primary)] focus:outline-none resize-y max-h-[360px] leading-relaxed"
        />
      )}

      {/* Footer Info: Char count & Helper hint */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-neutral)]/50 bg-[var(--bg-neutral)]/40 text-[10px] text-[var(--content-tertiary)] font-mono select-none">
        <span className="flex items-center gap-1.5">
          <span className="hidden sm:inline">Highlight any text to format</span>
          <span className="sm:hidden">Select text to format</span>
        </span>
        <span>{value.length.toLocaleString()} characters</span>
      </div>
    </div>
  );
}
