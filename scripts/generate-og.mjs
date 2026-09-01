import sharp from "sharp";
import fs from "fs";
import path from "path";

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  // Read the official full-color SVG logo
  const logoSvgPath = path.join(process.cwd(), "public", "logo.svg");
  const logoSvgContent = fs.readFileSync(logoSvgPath, "utf-8");

  // Rasterize the SVG logo at high resolution (2x for sharpness)
  const logoRaster = await sharp(Buffer.from(logoSvgContent))
    .resize({ width: 1200, fit: "contain" })
    .png()
    .toBuffer();

  // Get dimensions of rasterized logo
  const logoMeta = await sharp(logoRaster).metadata();
  const logoW = logoMeta.width || 1200;
  const logoH = logoMeta.height || 600;

  // We want the logo to be ~500px wide in the final image, centered
  const targetLogoWidth = 520;
  const scale = targetLogoWidth / logoW;
  const targetLogoHeight = Math.round(logoH * scale);

  const resizedLogo = await sharp(logoRaster)
    .resize({ width: targetLogoWidth, height: targetLogoHeight, fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  // Create SVG overlay with clean white background, subtle accent details, and tagline
  const svgOverlay = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Subtle Ambient Purple Mesh Glows -->
      <radialGradient id="glow-top" cx="50%" cy="0%" r="60%">
        <stop offset="0%" stop-color="#962EE6" stop-opacity="0.06" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="glow-bottom-right" cx="90%" cy="100%" r="45%">
        <stop offset="0%" stop-color="#962EE6" stop-opacity="0.05" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="glow-left" cx="10%" cy="60%" r="40%">
        <stop offset="0%" stop-color="#962EE6" stop-opacity="0.03" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>

      <!-- Dot Pattern -->
      <pattern id="dot-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <circle cx="16" cy="16" r="0.8" fill="#962EE6" fill-opacity="0.06" />
      </pattern>
    </defs>

    <!-- Clean White Background -->
    <rect width="100%" height="100%" fill="#FFFFFF" />

    <!-- Ambient Glows -->
    <rect width="100%" height="100%" fill="url(#glow-top)" />
    <rect width="100%" height="100%" fill="url(#glow-bottom-right)" />
    <rect width="100%" height="100%" fill="url(#glow-left)" />

    <!-- Subtle Dot Grid -->
    <rect width="100%" height="100%" fill="url(#dot-grid)" opacity="0.6" />

    <!-- Elegant Inner Frame -->
    <rect x="32" y="32" width="${width - 64}" height="${height - 64}" rx="28" fill="none" stroke="#E8E8EC" stroke-width="1" />

    <!-- Bottom Tagline -->
    <g transform="translate(${width / 2}, 450)">
      <text x="0" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#090C09" letter-spacing="-0.3">
        The Portfolio Platform for Designers &amp; Creators
      </text>

      <!-- Sub-categories -->
      <text x="0" y="38" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#71717A" letter-spacing="0.3">
        UI/UX Design  •  Brand Identity  •  Visual Case Studies  •  Typography  •  3D &amp; Motion
      </text>
    </g>

    <!-- Bottom URL -->
    <g transform="translate(${width / 2}, 552)">
      <text x="0" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#A1A1AA" letter-spacing="0.8">
        layerat.com
      </text>
    </g>
  </svg>
  `;

  // Center the logo vertically in the upper portion
  const logoLeft = Math.round((width - targetLogoWidth) / 2);
  const logoTop = Math.round(130);

  const finalImage = await sharp(Buffer.from(svgOverlay))
    .composite([
      {
        input: resizedLogo,
        top: logoTop,
        left: logoLeft,
      },
    ])
    .png({ quality: 95 })
    .toBuffer();

  const outPath = path.join(process.cwd(), "public", "og-image.png");
  fs.writeFileSync(outPath, finalImage);

  // Also write to app/opengraph-image.png so Next.js static metadata picks it up automatically
  const appOgPath = path.join(process.cwd(), "app", "opengraph-image.png");
  fs.writeFileSync(appOgPath, finalImage);

  console.log(`✅ Generated OG images (${width}x${height}):`);
  console.log(`   → ${outPath}`);
  console.log(`   → ${appOgPath}`);
}

generateOgImage().catch(console.error);
