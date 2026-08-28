import type { Metadata, Viewport } from "next";
import { bricolage, inter } from "@/lib/fonts";
import "./globals.css";
import { SessionProvider } from "@/lib/session-context";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { TopLoader } from "@/components/layout/top-loader";
import { PageLoadingOverlay } from "@/components/layout/page-loading-overlay";
import { NetworkStatusIndicator } from "@/components/layout/network-status-indicator";

import {
  SITE_NAME,
  SITE_URL,
  defaultTitle,
  defaultDescription,
  PRIMARY_KEYWORDS,
  generateWebSiteJsonLd,
  generateOrganizationJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s · ${SITE_NAME}`,
  },
  description: defaultDescription,
  keywords: PRIMARY_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Design & Creative Portfolio",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
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
  openGraph: {
    siteName: SITE_NAME,
    title: defaultTitle,
    description: defaultDescription,
    url: SITE_URL,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${SITE_URL}/default-avatar.svg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Showcase Your Work & Connect with Creators`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    creator: "@craftplatform",
    site: "@craftplatform",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#121511" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebSiteJsonLd();
  const organizationSchema = generateOrganizationJsonLd();

  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect & DNS-Prefetch for Speed & LCP Core Web Vitals */}
        <link rel="preconnect" href="https://ttjobsgglwgyioqlldqj.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Global Schema.org JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* Blocking theme script to prevent any flash of unstyled theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('craft-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = (stored === 'light' || stored === 'dark') ? stored : (prefersDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-[var(--bg-screen)] text-[var(--content-primary)] antialiased`}
      >
        <ThemeProvider>
          <SessionProvider>
            <Suspense fallback={null}>
              <TopLoader />
              <PageLoadingOverlay />
            </Suspense>

            <SiteHeader />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <SiteFooter />
            <MobileBottomNav />
            <NetworkStatusIndicator />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
