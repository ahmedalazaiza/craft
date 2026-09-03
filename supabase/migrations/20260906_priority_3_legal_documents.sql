-- =============================================================================
-- Migration: Priority 3 — Dynamic Legal & Policy Documents
-- Table: public.legal_documents
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.legal_documents (
  id TEXT PRIMARY KEY, -- 'terms' | 'privacy' | 'guidelines'
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  version TEXT NOT NULL DEFAULT '2026.1',
  summary TEXT DEFAULT '',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on legal_documents
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- Allow public read access to legal documents
DROP POLICY IF EXISTS "Allow public read access to legal_documents" ON public.legal_documents;
CREATE POLICY "Allow public read access to legal_documents"
  ON public.legal_documents
  FOR SELECT
  USING (true);

-- Allow authenticated admins full access
DROP POLICY IF EXISTS "Allow authenticated full access to legal_documents" ON public.legal_documents;
CREATE POLICY "Allow authenticated full access to legal_documents"
  ON public.legal_documents
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable Realtime publication for legal_documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'legal_documents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.legal_documents;
  END IF;
END $$;

-- Seed all 3 Legal Documents idempotently
INSERT INTO public.legal_documents (id, title, subtitle, version, summary, sections, is_published, published_at, updated_at)
VALUES
(
  'terms',
  'Terms of Use',
  'Legal Agreement',
  '2026.1',
  'By publishing or browsing on Layerat, you enter into a binding agreement protecting your original intellectual property and ensuring respectful peer interactions.',
  '[
    {
      "title": "1. Ownership & Original Creative Authorship",
      "content": "You retain 100% ownership, copyright, and moral rights to all creative monographs, images, case studies, and assets you publish on Layerat. We never claim ownership of your work. By uploading, you grant Layerat a non-exclusive, worldwide license solely to display, format, and distribute your work across the platform.",
      "bullets": [
        "Layerat does not sell, sublicense, or license your portfolio works to third parties.",
        "Your work will never be utilized to train proprietary generative AI visual models without your explicit, opt-in written consent.",
        "You affirm that you hold all necessary copyrights or studio permissions for works published under your profile."
      ]
    },
    {
      "title": "2. Creator Accounts & Session Security",
      "content": "You are responsible for safeguarding your account credentials. You agree to provide accurate identification and maintain truthful attribution for all studio collaborations.",
      "bullets": [
        "One account per creator or registered design agency.",
        "Impersonation of existing designers, studios, or brands is strictly prohibited and results in immediate account suspension.",
        "You are liable for all actions taken under your authenticated session."
      ]
    },
    {
      "title": "3. Platform Conduct & Prohibited Practices",
      "content": "Layerat is designed as a sanctuary for serious visual craft. We maintain zero tolerance for abuse, plagiarism, or malicious activity.",
      "bullets": [
        "No uploading of stolen case studies, uncredited derivative templates, or deceptive portfolio entries.",
        "No automated scraping, botting of appreciations, artificial view inflation, or commercial spam in critiques.",
        "No harassment, hate speech, defamation, or graphic illegal content."
      ]
    },
    {
      "title": "4. Content Moderation & Takedown Notices",
      "content": "We respect the intellectual property rights of all artists. If you believe your copyrighted work has been copied in a manner that constitutes infringement, you may submit a report through our in-platform moderation reporting tool or contact our legal team.",
      "bullets": [
        "We review and take action on verified copyright notices promptly.",
        "Repeat infringers will have their accounts permanently terminated.",
        "False or bad-faith takedown notices may incur legal liability."
      ]
    },
    {
      "title": "5. Limitation of Liability & Warranties",
      "content": "Layerat is provided on an as-is and as-available basis. While we strive for 99.99% uptime and bulletproof data persistence, we do not warrant that the service will be uninterrupted or error-free. Under no circumstances will Layerat be liable for indirect, incidental, or consequential damages arising from platform usage."
    }
  ]'::jsonb,
  true,
  '2026-08-31 00:00:00+00',
  '2026-08-31 00:00:00+00'
),
(
  'privacy',
  'Privacy Policy',
  'Privacy & Security',
  '2026.1',
  'Layerat is built on a zero data-selling pledge. We only collect the minimal session information required to render your portfolio and provide a high-signal discovery experience.',
  '[
    {
      "title": "1. Zero Data-Selling Guarantee",
      "content": "We have never sold, rented, or monetized your personal information, contact details, or portfolio metrics to third-party data brokers or advertising networks. Our business model is aligned entirely with supporting creators, not harvesting user attention.",
      "bullets": [
        "No tracking pixels or third-party behavioral advertising scripts.",
        "No data bundling for external programmatic ad auctions.",
        "Your email address is confidential and never displayed publicly unless you explicitly add it to your bio."
      ]
    },
    {
      "title": "2. What Information We Collect",
      "content": "We collect only the essential information necessary to maintain your authenticated session and display your public studio profile.",
      "bullets": [
        "Account Data: Email address, encrypted authentication tokens, username, display name, and avatar.",
        "Profile Metadata: Bio, location, city, website link, and creative skill tags provided voluntarily by you.",
        "Publishing Data: Project monographs, gallery images, descriptions, categories, software tags, and associated metrics.",
        "Technical Diagnostics: Anonymized request logs, response latency, and error traces to maintain platform health and uptime."
      ]
    },
    {
      "title": "3. Storage & Cryptographic Security",
      "content": "All data in transit is encrypted via TLS 1.3. User authentication is governed by Supabase Auth with bcrypt password hashing and secure HTTP-only session cookies. Sensitive database records are protected by PostgreSQL Row Level Security (RLS) policies enforcing cryptographic ownership checks.",
      "bullets": [
        "Media assets stored on enterprise CDN with global edge caching.",
        "Automated continuous database backups with point-in-time recovery.",
        "Strict principle of least privilege across internal infrastructure."
      ]
    },
    {
      "title": "4. Cookies & Local Session Storage",
      "content": "Layerat uses functional cookies and browser storage strictly to keep you signed in, remember your dark/light theme preference, and cache dismissible system banners.",
      "bullets": [
        "Essential Cookies: Authentication session and CSRF mitigation.",
        "Preference Storage: Theme mode (light/dark) and dismissal tokens for announcements.",
        "No third-party cross-site tracking cookies."
      ]
    },
    {
      "title": "5. Your Rights: Export & Total Account Deletion",
      "content": "You have full control over your digital footprint. Under GDPR, CCPA, and global privacy standards, you have the right to inspect, export, or permanently delete your account and all associated portfolio data.",
      "bullets": [
        "Instant self-service account deletion available directly in Settings.",
        "Upon deletion, all projects, appreciation records, comments, and uploaded storage files are permanently erased from our production database."
      ]
    }
  ]'::jsonb,
  true,
  '2026-08-31 00:00:00+00',
  '2026-08-31 00:00:00+00'
),
(
  'guidelines',
  'Community Guidelines',
  'Peer & Curation Standards',
  '2026.1',
  'Layerat is a sanctuary for thoughtful creative craft. These standards outline our expectations for original authorship, constructive critique, and professional integrity.',
  '[
    {
      "title": "1. Authentic Authorship & Creative Integrity",
      "content": "Publish only work that you created, art directed, or contributed to meaningfully. Layerat celebrates genuine craft over volume.",
      "bullets": [
        "Always credit collaborators, creative directors, photographers, and studios involved in the project.",
        "Commercial agency client work must have proper client release authorization.",
        "Template repackaging or posting generic stock graphics as original case studies is not permitted."
      ]
    },
    {
      "title": "2. Thoughtful Peer Critique & Discourse",
      "content": "Feedback on Layerat should elevate the craft. When commenting on another designer''s monograph, offer actionable, constructive critique.",
      "bullets": [
        "Focus feedback on typography, layout hierarchy, ergonomics, interaction, and conceptual execution.",
        "No generic copy-paste spam or solicitation (e.g. follow-for-follow, check my profile).",
        "Disagreements must remain professional, respectful, and focused on the work, never personal attacks."
      ]
    },
    {
      "title": "3. Curation Standards for Curated Collections",
      "content": "Projects featured on the homepage, in category showcases, or in editorial collections are chosen based on execution quality and storytelling completeness.",
      "bullets": [
        "High-resolution cover imagery without compression artifacts or cluttered watermarks.",
        "Comprehensive monographs with process insights, typography specimens, or interface walkthroughs.",
        "Correct categorization into one of Layerat''s 13 canonical design disciplines."
      ]
    },
    {
      "title": "4. Zero Tolerance for Harassment & Discrimination",
      "content": "Layerat is an inclusive global creative network. Discrimination, hate speech, targeted harassment, or exclusionary conduct based on race, gender, nationality, sexual orientation, disability, or religion will result in immediate and permanent account removal."
    },
    {
      "title": "5. Enforcement & Community Reporting",
      "content": "Our moderation team actively monitors flags submitted through the in-platform reporting system. Violations may result in formal warnings, project unpublishing, or permanent account revocation depending on severity."
    }
  ]'::jsonb,
  true,
  '2026-08-31 00:00:00+00',
  '2026-08-31 00:00:00+00'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  version = EXCLUDED.version,
  summary = EXCLUDED.summary,
  sections = EXCLUDED.sections,
  is_published = EXCLUDED.is_published,
  published_at = EXCLUDED.published_at,
  updated_at = timezone('utc'::text, now());
