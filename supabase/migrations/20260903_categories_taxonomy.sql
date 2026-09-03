-- =============================================================================
-- Migration: Dynamic Categories Taxonomy
-- Table: public.categories
-- Description: Stores dynamic master design disciplines, sub-categories, tags, and tools
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  short_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  sub_categories TEXT[] DEFAULT '{}'::text[],
  tags TEXT[] DEFAULT '{}'::text[],
  tools TEXT[] DEFAULT '{}'::text[],
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure columns are text[] even if table already existed with jsonb
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'categories' 
      AND column_name = 'sub_categories' 
      AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE public.categories 
      ALTER COLUMN sub_categories TYPE text[] 
      USING ARRAY(SELECT jsonb_array_elements_text(sub_categories));
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'categories' 
      AND column_name = 'tags' 
      AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE public.categories 
      ALTER COLUMN tags TYPE text[] 
      USING ARRAY(SELECT jsonb_array_elements_text(tags));
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'categories' 
      AND column_name = 'tools' 
      AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE public.categories 
      ALTER COLUMN tools TYPE text[] 
      USING ARRAY(SELECT jsonb_array_elements_text(tools));
  END IF;
END $$;

-- Index for efficient ordering and active filtering
CREATE INDEX IF NOT EXISTS idx_categories_active_order ON public.categories (is_active, sort_order);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active categories
DROP POLICY IF EXISTS "Allow public read access to active categories" ON public.categories;
CREATE POLICY "Allow public read access to active categories"
  ON public.categories
  FOR SELECT
  USING (true);

-- Allow authenticated admins full access
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.categories;
CREATE POLICY "Allow authenticated full access"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable Realtime publication for categories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  END IF;
END $$;

-- Clean up any existing or conflicting rows by name or id before inserting
DELETE FROM public.categories 
WHERE name IN (
  'User Interface Design (UI)',
  'User Experience Design (UX)',
  'Graphic Design',
  'Brand Identity',
  'Motion Design',
  '3D Design',
  'Illustration',
  'Game Design',
  'AR/VR & Spatial Design',
  'Industrial & Physical Product Design',
  'Animation (2D & Traditional)',
  'Type Design & Lettering',
  'Presentation & Information Design'
)
OR id IN (
  'ui',
  'ux',
  'graphic-design',
  'brand-identity',
  'motion-design',
  '3d-design',
  'illustration',
  'game-design',
  'spatial-design',
  'industrial-design',
  'animation',
  'type-design',
  'presentation-design',
  'product-design',
  'ar-vr',
  'design-systems',
  'creative-coding',
  'photography'
);

-- Seed all 13 Master Categories (clean insert with text[] arrays)
INSERT INTO public.categories (id, name, short_name, description, sub_categories, tags, tools, sort_order, is_active)
VALUES
  (
    'ui',
    'User Interface Design (UI)',
    'UI',
    'Clean dashboards, mobile applications, responsive design systems, and digital product interfaces.',
    ARRAY['Web Design', 'Mobile App Design', 'Dashboard & SaaS Design', 'Design Systems', 'Responsive Web', 'Smartwatch & Wearables UI', 'Landing Pages', 'E-commerce UI', 'Web3 & Crypto UI']::text[],
    ARRAY['Auto-layout', 'Design Tokens', 'Component Architecture', '8-Point Grid', 'Semantic Variables', 'Dark Mode', 'UI Kits', 'Micro-interactions', 'Developer Handoff', 'Typography Scale', 'Atomic Design', 'Glassmorphism', 'Neumorphism', 'Bento Grid', 'Material Design', 'Human Interface Guidelines (HIG)', 'Fluid Typography', 'Accessibility (A11y)', 'Prototyping']::text[],
    ARRAY['Figma', 'Sketch', 'Adobe XD', 'Framer', 'Penpot', 'Zeplin', 'VS Code', 'Webflow', 'Relume', 'Anima', 'Lunacy', 'InVision']::text[],
    1,
    true
  ),
  (
    'ux',
    'User Experience Design (UX)',
    'UX',
    'In-depth user research, wireframing, usability testing, journey mapping, and information architecture.',
    ARRAY['UX Research', 'Information Architecture', 'Interaction Design', 'Usability Testing', 'UX Writing & Content Strategy', 'Service Design', 'Customer Experience (CX)']::text[],
    ARRAY['Wireframing', 'User Flows', 'User Personas', 'Journey Mapping', 'Heuristic Evaluation', 'Card Sorting', 'Tree Testing', 'Qualitative Research', 'Quantitative Research', 'A/B Testing', 'Empathy Maps', 'Service Blueprinting', 'Competitor Analysis', 'UX Audit', 'Cognitive Bias', 'Contextual Inquiry', 'Task Analysis']::text[],
    ARRAY['FigJam', 'Miro', 'Maze', 'Hotjar', 'Optimal Workshop', 'UserTesting', 'Dovetail', 'Notion', 'Whimsical', 'Balsamiq', 'Typeform', 'Lookback', 'Microsoft Clarity']::text[],
    2,
    true
  ),
  (
    'graphic-design',
    'Graphic Design',
    'Graphic',
    'Print publications, editorial layouts, poster compositions, packaging craft, and publication aesthetics.',
    ARRAY['Print Design', 'Editorial & Magazine Design', 'Poster Design', 'Packaging Design', 'Marketing Collateral', 'Social Media Graphics', 'Book Design', 'Album Art', 'Environmental Graphics']::text[],
    ARRAY['Layout Composition', 'Grid Systems', 'Color Theory', 'Pre-press', 'Print Production', 'Visual Hierarchy', 'Typography Hierarchy', 'Image Manipulation', 'Photo Retouching', 'Social Media Templates', 'Brochures', 'Billboards', 'Merch Design', 'Die-cut', 'Halftone', 'CMYK', 'Bleed & Margins']::text[],
    ARRAY['Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign', 'CorelDRAW', 'Canva', 'Affinity Designer', 'Affinity Photo', 'Photopea', 'QuarkXPress']::text[],
    3,
    true
  ),
  (
    'brand-identity',
    'Brand Identity',
    'Brand',
    'Timeless logos, visual identity systems, brand guidelines, color palettes, and typography rules.',
    ARRAY['Logo Design', 'Brand Guidelines', 'Visual Strategy', 'Rebranding', 'Custom Typography', 'Brand Collateral', 'Corporate Identity', 'Event Branding']::text[],
    ARRAY['Brand Archetypes', 'Moodboards', 'Brand Marks', 'Monograms', 'Style Guides', 'Brand Assets', 'Color Palettes', 'Brand Positioning', 'Wordmarks', 'Emblems', 'Brand Strategy', 'Tone of Voice', 'Mascot Design', 'Brand Touchpoints', 'Visual Language', 'Pattern Design']::text[],
    ARRAY['Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign', 'FontForge', 'Glyphs', 'Milanote', 'CorelDRAW', 'Pinterest']::text[],
    4,
    true
  ),
  (
    'motion-design',
    'Motion Design',
    'Motion',
    'Kinetic typography, dynamic UI animations, title sequences, 3D broadcast motion, and video graphics.',
    ARRAY['Kinetic Typography', 'Title Sequences', 'Broadcast Design', 'UI Animation', 'Explainer Videos', 'Promo Graphics', 'Logo Animation', 'Product Animation']::text[],
    ARRAY['Keyframing', 'Easing Curves', 'Transitions', 'Compositing', 'Motion Tracking', 'Visual Effects (VFX)', 'Lower Thirds', 'Dynamic Graphics', 'Rotoscoping', '2.5D Animation', 'Parallax', 'Liquid Motion', 'HUD Design', 'Character Rigging (Motion)', 'Loop Animation', 'Storyboarding']::text[],
    ARRAY['Adobe After Effects', 'Premiere Pro', 'Cinema 4D', 'DaVinci Resolve', 'Rive', 'LottieFiles', 'Cavalry', 'Nuke', 'Apple Motion', 'Jitter', 'Principle', 'Spline']::text[],
    5,
    true
  ),
  (
    '3d-design',
    '3D Design',
    '3D',
    '3D modeling, photorealistic rendering, architectural visualization, and spatial CGI environments.',
    ARRAY['3D Modeling', 'Architectural Visualization', 'Environment Design', '3D Rendering', 'Spatial Design', 'Character Sculpting', 'Product Visualization', 'Abstract 3D']::text[],
    ARRAY['Texturing', 'Shading', 'Lighting', 'UV Mapping', 'Photorealism', 'Low Poly', 'High Poly', 'Hard Surface Modeling', 'Ray Tracing', 'Organic Sculpting', 'Retopology', 'Rigging', 'Procedural Generation', 'Fluid Simulations', 'PBR Materials', 'ArchViz', 'Matte Painting', 'Voxel Art']::text[],
    ARRAY['Blender', 'Autodesk Maya', 'Cinema 4D', '3ds Max', 'ZBrush', 'KeyShot', 'Unreal Engine', 'Substance 3D Painter', 'Substance 3D Designer', 'Houdini', 'Marvelous Designer', 'V-Ray', 'OctaneRender']::text[],
    6,
    true
  ),
  (
    'illustration',
    'Illustration',
    'Illustration',
    'Vector artwork, character design, digital painting, editorial illustrations, and custom iconography.',
    ARRAY['Vector Illustration', 'Character Design', 'Editorial Illustration', 'Book & Cover Illustration', 'Iconography', 'Concept Art', 'Medical Illustration', 'Technical Illustration']::text[],
    ARRAY['Digital Sketching', 'Line Art', 'Isometric Illustration', 'Flat Illustration', 'Narrative Art', 'Spot Illustrations', 'Digital Painting', 'Children''s Book', 'Comic Layouts', 'Storyboarding', 'Watercolor', 'Gouache Digital', 'Cyberpunk Art', 'Fantasy Art', 'Manga/Anime Style', 'Doodle', 'Silhouette']::text[],
    ARRAY['Procreate', 'Adobe Illustrator', 'Adobe Fresco', 'Clip Studio Paint', 'Affinity Designer', 'Wacom (Hardware)', 'PaintTool SAI', 'Corel Painter', 'Krita', 'MediBang Paint']::text[],
    7,
    true
  ),
  (
    'game-design',
    'Game Design',
    'Game',
    'Level design, game mechanics, character concept art, UI for gaming, sprite craft, and virtual world-building.',
    ARRAY['Level Design', 'Game Mechanics', 'Character Concept Art', 'Environment Concept Art', 'UI for Games', 'Systems Design', 'Quest/Narrative Design']::text[],
    ARRAY['Game Loop', 'Playtesting', 'Sprite Sheets', 'Pixel Art', 'Isometric Design', 'RPG Mechanics', 'FPS', 'Casual Games', 'World Building', 'Balancing', 'Economy Design', 'HUDs', 'Game Flow', 'Loot Systems', 'Concept Arting', 'Low Poly Assets']::text[],
    ARRAY['Unity', 'Unreal Engine', 'Godot', 'Construct', 'GameMaker', 'Spine 2D', 'Tiled', 'RPG Maker', 'Blender', 'Aseprite']::text[],
    8,
    true
  ),
  (
    'spatial-design',
    'AR/VR & Spatial Design',
    'AR/VR',
    'Augmented reality, virtual reality, spatial computing interfaces, WebXR, and immersive 3D realms.',
    ARRAY['Augmented Reality (AR)', 'Virtual Reality (VR)', 'Mixed Reality (MR)', 'Metaverse Environments', 'Spatial Interfaces', 'AR Filters & Lenses']::text[],
    ARRAY['Spatial Computing', 'Haptics', 'Immersive Experience', 'Head-Mounted Displays (HMD)', '360 Environments', 'Volumetric Video', '3D UI', 'WebXR', 'Hand Tracking', 'Passthrough', 'Scene Understanding', 'Virtual Tours', 'Raycasting', 'Spatial Grids']::text[],
    ARRAY['Unity', 'Unreal Engine', 'Spark AR', 'Lens Studio', 'Spline', 'Reality Composer', 'A-Frame', 'Bezi', 'ShapesXR', '8th Wall']::text[],
    9,
    true
  ),
  (
    'industrial-design',
    'Industrial & Physical Product Design',
    'Product',
    'Consumer electronics, hardware enclosures, furniture design, CNC prototyping, and physical product ergonomics.',
    ARRAY['Consumer Electronics', 'Furniture Design', 'Automotive Design', 'Packaging Form Design', 'Sustainable Design', 'Toy Design', 'Wearable Technology']::text[],
    ARRAY['Ergonomics', 'Rapid Prototyping', 'Manufacturing Processes', 'CMF (Color, Materials, Finish)', '3D Printing', 'Injection Molding', 'Blueprints', 'Sustainability', 'Concept Sketching', 'CAD Drafting', 'Tolerancing', 'User-Centered Hardware', 'Form Factor', 'Industrial Blueprinting']::text[],
    ARRAY['SolidWorks', 'Rhino', 'Fusion 360', 'AutoCAD', 'KeyShot', 'Shapr3D', 'CATIA', 'PTC Creo', 'Onshape', 'Alias']::text[],
    10,
    true
  ),
  (
    'animation',
    'Animation (2D & Traditional)',
    'Animation',
    'Character animation, frame-by-frame cel art, stop motion, storyboarding, and classical timing principles.',
    ARRAY['Character Animation', 'Cel Animation', 'Stop Motion', 'Cut-out Animation', 'Storyboarding & Animatics', 'Motion Comics']::text[],
    ARRAY['Rigging', 'Keyframing', 'Onion Skinning', 'Tweening', 'Lip Syncing', 'Frame-by-Frame', 'Puppet Rigging', 'Background Painting', 'Walk Cycle', 'Smear Frames', 'Pose-to-Pose', 'Straight Ahead Animation', 'Timing and Spacing', 'Squash and Stretch']::text[],
    ARRAY['Toon Boom Harmony', 'TVPaint', 'Adobe Animate', 'Moho', 'Krita', 'OpenToonz', 'RoughAnimator', 'Spine 2D', 'Dragonframe']::text[],
    11,
    true
  ),
  (
    'type-design',
    'Type Design & Lettering',
    'Type',
    'Custom font creation, variable font axes, calligraphy specimens, custom logotypes, and expressive glyph systems.',
    ARRAY['Font Creation', 'Calligraphy', 'Hand Lettering', 'Custom Logotypes', 'Typography Systems', 'Signage']::text[],
    ARRAY['Kerning', 'Tracking', 'Ligatures', 'Serifs', 'Sans-Serifs', 'Variable Fonts', 'Glyphs', 'Script Lettering', 'Font Hinting', 'Display Fonts', 'Text Fonts', 'Monospaced', 'Multilingual Support', 'Typographic Scales', 'Ascenders/Descenders']::text[],
    ARRAY['Glyphs', 'FontForge', 'RoboFont', 'FontLab', 'Procreate', 'Adobe Illustrator', 'Calligraphr', 'BirdFont']::text[],
    12,
    true
  ),
  (
    'presentation-design',
    'Presentation & Information Design',
    'Presentation',
    'Executive pitch decks, data visualization charts, infographics, and persuasive visual storytelling.',
    ARRAY['Pitch Decks', 'Corporate Presentations', 'Infographics', 'Data Visualization', 'Webinar Slides', 'Annual Reports']::text[],
    ARRAY['Storytelling', 'Slide Layouts', 'Master Slides', 'Chart Design', 'Visual Hierarchy', 'Data Mapping', 'Executive Summaries', 'Dashboard UI', 'Visual Storytelling', 'Isometric Infographics', 'Typography Focus', 'Transition Animations']::text[],
    ARRAY['Keynote', 'PowerPoint', 'Google Slides', 'Pitch', 'Canva', 'Tableau', 'Prezi', 'Tome', 'Beautiful.ai', 'Flourish', 'Infogram']::text[],
    13,
    true
  );
