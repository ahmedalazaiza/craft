import { NextRequest, NextResponse } from "next/server";
import { MASTER_TAXONOMY, normalizeCategory, getCategoryTaxonomy } from "@/lib/taxonomy";

export const runtime = "nodejs";
export const maxDuration = 30; // 30 seconds max for multimodal image inspection

interface AnalyzeRequestBody {
  imageUrls?: string[];
  imageDataList?: { data: string; mimeType: string }[];
  filenames?: string[];
}

function isRandomHashOrGibberish(str: string): boolean {
  const cleaned = str.replace(/[^a-z0-9]/gi, "");
  // Hashes like 59kv1zo, 8f7e2a, 169829381, etc.
  if (/^[a-z0-9]{5,16}$/i.test(cleaned) && /\d/.test(cleaned) && !/[aeiouy]{2,}/i.test(cleaned)) {
    return true;
  }
  if (/^[a-f0-9]{8,}$/i.test(cleaned) || /^\d+$/.test(cleaned) || cleaned.length < 3) {
    return true;
  }
  return false;
}

function cleanFilenameToTitle(filename: string): string {
  // Strip extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  if (isRandomHashOrGibberish(nameWithoutExt)) return "";

  // Replace delimiters with spaces
  const cleaned = nameWithoutExt
    .replace(/[_-]+/g, " ")
    .replace(/\b(image|img|screenshot|screen|shot|frame|artboard|final|v\d+|copy|\d+)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned.length < 3 || isRandomHashOrGibberish(cleaned)) return "";

  // Capitalize words
  return cleaned
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function detectCategoryFromKeywords(text: string): typeof MASTER_TAXONOMY[0] {
  const lower = text.toLowerCase();
  
  if (lower.match(/\b(ux|ui|app|dashboard|screen|interface|web|saas|mobile|ios|android|portal|figma)\b/)) {
    return MASTER_TAXONOMY.find((c) => c.name.includes("Interface")) || MASTER_TAXONOMY[0];
  }
  if (lower.match(/\b(brand|identity|logo|editorial|book|monograph|guidelines|stationery|packaging|poster)\b/)) {
    return MASTER_TAXONOMY.find((c) => c.name.includes("Brand")) || MASTER_TAXONOMY[1];
  }
  if (lower.match(/\b(3d|render|blender|cinema4d|octane|c4d|spatial|sculpt|houdini)\b/)) {
    return MASTER_TAXONOMY.find((c) => c.name.includes("3D")) || MASTER_TAXONOMY[2];
  }
  if (lower.match(/\b(motion|animation|aftereffects|video|reel|kinetic)\b/)) {
    return MASTER_TAXONOMY.find((c) => c.name.includes("Motion")) || MASTER_TAXONOMY[3];
  }
  if (lower.match(/\b(type|font|typeface|typography|lettering)\b/)) {
    return MASTER_TAXONOMY.find((c) => c.name.includes("Typography")) || MASTER_TAXONOMY[4];
  }
  if (lower.match(/\b(photo|photography|film|portrait|editorial-shot|35mm)\b/)) {
    return MASTER_TAXONOMY.find((c) => c.name.includes("Photography")) || MASTER_TAXONOMY[5];
  }
  if (lower.match(/\b(architect|spatial|interior|building|pavilion|structure)\b/)) {
    return MASTER_TAXONOMY.find((c) => c.name.includes("Architecture")) || MASTER_TAXONOMY[6];
  }

  // Default to UI
  return MASTER_TAXONOMY[0];
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequestBody = await req.json();
    const imageUrls = body.imageUrls || [];
    const imageDataList = body.imageDataList || [];
    const filenames = body.filenames || [];

    if (imageUrls.length === 0 && imageDataList.length === 0) {
      return NextResponse.json(
        { error: "No images provided for analysis." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    // Build categories summary for strict taxonomy guidance
    const taxonomySummary = MASTER_TAXONOMY.map(
      (cat) =>
        `- Category: "${cat.name}" (ID: ${cat.id})\n  Sub-Categories: ${cat.subCategories.join(", ")}\n  Typical Tags: ${cat.tags.slice(0, 10).join(", ")}\n  Typical Tools: ${cat.tools.slice(0, 8).join(", ")}`
    ).join("\n\n");

    const filenamesHint = filenames.length > 0 ? `Uploaded File Names: ${filenames.join(", ")}` : "";

    const promptText = `
You are an expert AI Design Assistant for LAYERAT (layerat.com), a portfolio platform for digital designers, brand creators, and 3D artists.

Analyze the uploaded project image(s) and generate clean, clear, and professional project metadata in JSON format.
${filenamesHint}

### Available 13 Master Categories and Disciplines:
${taxonomySummary}

### Output Rules (CRITICAL: Use simple, natural, clear international English that is easy to understand for all designers):
1. "title": A clear, concise, and professional project title (e.g., "Cinema — Mobile Movie Booking App", "Aura — Mobile Banking App", "Kroma — Brand Identity & Packaging", "Sakha — Zakat & Giving App"). Keep it direct and easy to read.
2. "category": EXACT MATCH with one of the 13 category names listed above.
3. "subCategory": EXACT MATCH from the sub-categories list of that selected category.
4. "body": 2 clear, well-structured paragraphs written in simple, friendly, and professional English:
   - Paragraph 1: What this project is, what problem it solves, and who it was designed for.
   - Paragraph 2: The visual style, user experience features, color scheme, and tools used.
   - IMPORTANT: Avoid complicated or confusing academic jargon. Write clearly so anyone can easily read and enjoy the case study.
5. "tags": An array of 4 to 6 simple and relevant tags (e.g. ["UI Design", "Mobile App", "iOS App", "Design System", "Dark Mode"]).
6. "tools": An array of 2 to 4 tools used (e.g. ["Figma", "FigJam", "Adobe Illustrator"]).

Return ONLY valid JSON matching this structure without markdown formatting or code fences:
{
  "title": "string",
  "category": "string",
  "subCategory": "string",
  "body": "string",
  "tags": ["tag1", "tag2", "tag3"],
  "tools": ["tool1", "tool2"]
}
`;

    // 1. If Gemini API key is configured, execute multimodal vision analysis
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const parts: any[] = [{ text: promptText }];

        // Add base64 image data if provided (CamelCase inlineData is required by Gemini REST API)
        for (const imgData of imageDataList.slice(0, 3)) {
          if (imgData.data) {
            parts.push({
              inlineData: {
                data: imgData.data,
                mimeType: imgData.mimeType || "image/jpeg",
              },
            });
          }
        }

        // If only URLs were provided and no direct inline data, fetch top 2 images as buffers
        if (imageDataList.length === 0 && imageUrls.length > 0) {
          const fetchPromises = imageUrls.slice(0, 2).map(async (url) => {
            try {
              const res = await fetch(url);
              if (!res.ok) return null;
              const buffer = await res.arrayBuffer();
              const base64 = Buffer.from(buffer).toString("base64");
              const mimeType = res.headers.get("content-type") || "image/jpeg";
              return { data: base64, mimeType };
            } catch {
              return null;
            }
          });

          const fetchedImages = (await Promise.all(fetchPromises)).filter(Boolean);
          for (const img of fetchedImages) {
            if (img && img.data) {
              parts.push({
                inlineData: {
                  data: img.data,
                  mimeType: img.mimeType,
                },
              });
            }
          }
        }

        const modelsToTry = [
          "gemini-3.6-flash",
          "gemini-3.5-flash",
          "gemini-2.0-flash",
          "gemini-1.5-flash",
          "gemini-1.5-pro",
        ];
        let rawText = "";

        for (const model of modelsToTry) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts }],
                  generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json",
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (rawText) break;
            } else {
              const errBody = await geminiRes.json().catch(() => ({}));
              console.warn(`Gemini model ${model} response not ok:`, geminiRes.status, errBody);
            }
          } catch (modelErr) {
            console.warn(`Model ${model} failed, trying next candidate...`, modelErr);
          }
        }

        if (rawText) {
          const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanedText);

          const normalizedCategory = normalizeCategory(parsed.category || "UI");
          const matchedTax = getCategoryTaxonomy(normalizedCategory) || MASTER_TAXONOMY[0];
          const validSub = matchedTax.subCategories.includes(parsed.subCategory)
            ? parsed.subCategory
            : matchedTax.subCategories[0] || "";

          return NextResponse.json({
            success: true,
            source: "gemini-vision",
            data: {
              title: parsed.title || "Modern Visual Design Project",
              category: matchedTax.name,
              subCategory: validSub,
              body: parsed.body || "A modern design case study exploring clean layouts, typography, and user experience.",
              tags: Array.isArray(parsed.tags) ? parsed.tags : matchedTax.tags.slice(0, 5),
              tools: Array.isArray(parsed.tools) ? parsed.tools : matchedTax.tools.slice(0, 3),
            },
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini vision analysis failed, falling back to heuristic engine:", geminiErr);
      }
    }

    // 2. Intelligent Dynamic Semantic Heuristic Engine (Simplified English)
    // Inspect uploaded filenames & image URL path tokens
    const combinedTerms = [
      ...filenames.map(cleanFilenameToTitle),
      ...imageUrls.map((url) => {
        try {
          const pathname = new URL(url).pathname;
          return cleanFilenameToTitle(pathname.split("/").pop() || "");
        } catch {
          return "";
        }
      }),
    ].filter(Boolean);

    const primaryExtractedTitle = combinedTerms.find((t) => t.length > 4) || "";
    const detectedTaxonomy = detectCategoryFromKeywords(
      primaryExtractedTitle + " " + filenames.join(" ") + " " + imageUrls.join(" ")
    );

    let dynamicTitle = "";
    let dynamicBody = "";

    if (primaryExtractedTitle) {
      dynamicTitle = `${primaryExtractedTitle} — Design Case Study`;
      dynamicBody = `${primaryExtractedTitle} is a modern design project created with clear visual hierarchy, balanced layouts, and a refined color palette.\n\nEvery screen and design asset was carefully structured to deliver a smooth user experience across mobile and web platforms.`;
    } else {
      // Dynamic thematic generator based on detected taxonomy
      const categoryTitles: Record<string, string[]> = {
        "User Interface Design (UI)": [
          "Aether — Modern Mobile App Design",
          "Kinetics — Web App & Dashboard Design",
          "Nexus — Digital Banking & Finance App",
        ],
        "Brand Identity & Visual Design": [
          "Sanctuary — Brand Identity & Visual System",
          "Verve — Packaging & Brand Identity",
          "Forma — Brand Guidelines & Print Design",
        ],
        "3D Design & Spatial Art": [
          "Voxel — 3D Product Concepts & Renders",
          "Solarium — 3D Environment & Spatial Scene",
          "Prism — 3D Visuals & Shaders",
        ],
      };

      const candidates = categoryTitles[detectedTaxonomy.name] || [
        `${detectedTaxonomy.name} — Design Project`,
      ];
      dynamicTitle = candidates[Math.floor(Math.random() * candidates.length)];
      dynamicBody = `A comprehensive design case study showcasing the concept, visual exploration, and final assets for ${detectedTaxonomy.name.toLowerCase()}.\n\nCrafted with attention to detail, modern typography, and clean layout principles.`;
    }

    return NextResponse.json({
      success: true,
      source: "semantic-heuristic-engine",
      data: {
        title: dynamicTitle,
        category: detectedTaxonomy.name,
        subCategory: detectedTaxonomy.subCategories[0] || "Web Design",
        body: dynamicBody,
        tags: detectedTaxonomy.tags.slice(0, 5),
        tools: detectedTaxonomy.tools.slice(0, 3),
      },
    });
  } catch (err: any) {
    console.error("AI analysis route error:", err);
    return NextResponse.json(
      { error: "Failed to analyze visual media.", details: err?.message },
      { status: 500 }
    );
  }
}
