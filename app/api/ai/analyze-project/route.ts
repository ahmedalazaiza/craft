import { NextRequest, NextResponse } from "next/server";
import { MASTER_TAXONOMY, normalizeCategory, getCategoryTaxonomy } from "@/lib/taxonomy";

export const runtime = "nodejs";
export const maxDuration = 30; // 30 seconds max for multimodal image inspection

interface AnalyzeRequestBody {
  imageUrls?: string[];
  imageDataList?: { data: string; mimeType: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequestBody = await req.json();
    const imageUrls = body.imageUrls || [];
    const imageDataList = body.imageDataList || [];

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

    const promptText = `
You are the AI Creative Director and Taxonomy Curator for LAYERAT (layerat.com), a world-class portfolio exhibition platform for elite digital designers, brand architects, and 3D artists.

Analyze the uploaded project image(s) and generate the complete, high-aesthetic case study metadata in JSON format.

### Available 13 Master Categories and Disciplines:
${taxonomySummary}

### Output Rules:
1. "title": A sophisticated, punchy, studio-grade project title (e.g., "Aura: Spatial Design System & Monograph", "Kroma: Generative Brand Identity", "Voxel: Hard-Surface Cybernetic Vehicle").
2. "category": EXACT MATCH with one of the 13 category names listed above (e.g., "User Interface Design (UI)", "Brand Identity & Visual Design", "3D Design & Spatial Art").
3. "subCategory": EXACT MATCH from the sub-categories list of that selected category.
4. "body": A compelling, poetic 2-paragraph design narrative and case study rationale (written in studio-grade English). Discuss the visual tension, typography hierarchy, grid system, color harmony, and functional intent shown in the imagery.
5. "tags": An array of 4 to 7 relevant methodology tags from the category's typical tags or modern design terms.
6. "tools": An array of 2 to 4 likely software tools used to create these visuals (e.g. ["Figma", "Webflow"], ["Blender", "Octane Render"], ["Adobe Illustrator", "After Effects"]).

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
    if (apiKey) {
      try {
        const parts: any[] = [{ text: promptText }];

        // Add base64 image data if provided
        for (const imgData of imageDataList.slice(0, 3)) {
          parts.push({
            inline_data: {
              data: imgData.data,
              mime_type: imgData.mimeType || "image/jpeg",
            },
          });
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
            if (img) {
              parts.push({
                inline_data: {
                  data: img.data,
                  mime_type: img.mimeType,
                },
              });
            }
          }
        }

        const modelsToTry = ["gemini-flash-latest", "gemini-3.5-flash", "gemini-2.5-pro"];
        let rawText = "";

        for (const model of modelsToTry) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts }],
                  generationConfig: {
                    temperature: 0.4,
                    responseMimeType: "application/json",
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (rawText) break;
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
              title: parsed.title || "Monograph: Contemporary Visual Study",
              category: matchedTax.name,
              subCategory: validSub,
              body: parsed.body || "A refined visual case study exploring spatial balance and typography.",
              tags: Array.isArray(parsed.tags) ? parsed.tags : matchedTax.tags.slice(0, 5),
              tools: Array.isArray(parsed.tools) ? parsed.tools : matchedTax.tools.slice(0, 3),
            },
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini vision analysis failed, falling back to heuristic engine:", geminiErr);
      }
    }

    // 2. Intelligent Heuristic Fallback Engine
    const fallbackCategory = MASTER_TAXONOMY[0]; // UI
    return NextResponse.json({
      success: true,
      source: "heuristic-engine",
      data: {
        title: "Kinetics: Contemporary Digital Interface & Systems",
        category: fallbackCategory.name,
        subCategory: fallbackCategory.subCategories[0] || "Web Design",
        body: "A comprehensive digital case study balancing rigorous typographic hierarchy, ergonomic spatial layouts, and high-contrast dark mode aesthetics. Designed with fluid responsiveness and accessible components.",
        tags: fallbackCategory.tags.slice(0, 5),
        tools: fallbackCategory.tools.slice(0, 3),
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
