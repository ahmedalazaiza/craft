import sharp from "sharp";
import fs from "fs";
import path from "path";

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  // Read full logo image
  const logoFullPath = path.join(process.cwd(), "public", "logo-full.png");
  const logoBuffer = fs.readFileSync(logoFullPath);

  // Resize logo for OG prominence (width: 620px)
  const resizedLogo = await sharp(logoBuffer)
    .resize({ width: 640, fit: "contain" })
    .toBuffer();

  // Create SVG background overlay with typography, subtle gradients, and luxury details
  const svgOverlay = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Subtle Ambient Purple Mesh Glows -->
      <radialGradient id="glow-top" cx="50%" cy="0%" r="60%">
        <stop offset="0%" stop-color="#962EE6" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="glow-bottom-right" cx="100%" cy="100%" r="50%">
        <stop offset="0%" stop-color="#962EE6" stop-opacity="0.06" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="glow-bottom-left" cx="0%" cy="100%" r="50%">
        <stop offset="0%" stop-color="#962EE6" stop-opacity="0.04" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>

      <!-- Dot Pattern -->
      <pattern id="dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="14" cy="14" r="1" fill="#962EE6" fill-opacity="0.08" />
      </pattern>
    </defs>

    <!-- Clean White Background -->
    <rect width="100%" height="100%" fill="#FFFFFF" />

    <!-- Ambient Glows -->
    <rect width="100%" height="100%" fill="url(#glow-top)" />
    <rect width="100%" height="100%" fill="url(#glow-bottom-right)" />
    <rect width="100%" height="100%" fill="url(#glow-bottom-left)" />

    <!-- Subtle Dot Grid -->
    <rect width="100%" height="100%" fill="url(#dot-grid)" opacity="0.75" />

    <!-- Elegant Inner Frame -->
    <rect x="36" y="36" width="${width - 72}" height="${height - 72}" rx="32" fill="none" stroke="#EAEAEA" stroke-width="1.5" />

    <!-- Top Badge -->
    <g transform="translate(${width / 2}, 110)">
      <rect x="-160" y="-18" width="320" height="36" rx="18" fill="#F4F4F5" stroke="#E4E4E7" stroke-width="1" />
      <circle cx="-135" cy="0" r="4" fill="#962EE6" />
      <text x="-120" y="5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#18181B" letter-spacing="0.5">THE CURATED CREATIVE PLATFORM</text>
    </g>

    <!-- Bottom Tagline & Meta Strip -->
    <g transform="translate(${width / 2}, 460)">
      <!-- Main Tagline -->
      <text x="0" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#090C09" letter-spacing="-0.5">
        The Portfolio Platform for Designers &amp; Creators
      </text>

      <!-- Sub-Pills / Disciplines -->
      <text x="0" y="40" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#71717A" letter-spacing="0.2">
        UI/UX Design • Brand Identity • Visual Case Studies • Typography • 3D Motion
      </text>
    </g>

    <!-- Bottom URL Footer Indicator -->
    <g transform="translate(${width / 2}, 555)">
      <text x="0" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#A1A1AA" letter-spacing="0.5">
        layerat.com
      </text>
    </g>
  </svg>
  `;

  // Get metadata of resized logo to center it vertically
  const logoMeta = await sharp(resizedLogo).metadata();
  const logoLeft = Math.round((width - (logoMeta.width || 640)) / 2);
  const logoTop = 205;

  const finalImage = await sharp(Buffer.from(svgOverlay))
    .composite([
      {
        input: resizedLogo,
        top: logoTop,
        left: logoLeft,
      },
    ])
    .png()
    .toBuffer();

  const outPath = path.join(process.cwd(), "public", "og-image.png");
  fs.writeFileSync(outPath, finalImage);

  // Also write to app/opengraph-image.png so Next.js static metadata picks it up automatically
  const appOgPath = path.join(process.cwd(), "app", "opengraph-image.png");
  fs.writeFileSync(appOgPath, finalImage);

  console.log("Successfully generated:", outPath, "and", appOgPath);
}

generateOgImage().catch(console.error);
