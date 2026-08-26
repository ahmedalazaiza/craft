# Craft. — Product Requirements Document (PRD) & Platform Hub

> **Document Version:** 1.0.0  
> **Status:** Production-Ready / Living Specification  
> **Role:** Product Management & Technical Architecture  
> **Target Audience:** Engineering, Product, Design, and Executive Stakeholders  

---

## 1. Executive Summary & Product Vision

### 1.1 Product Overview
**Craft.** is a specialized portfolio, monograph publishing, and community showcase platform engineered specifically for independent creators, art directors, brand architects, and creative engineers. 

Unlike mainstream design aggregators that compress work into generic thumbnail grids and prioritize engagement-bait algorithms, **Craft.** treats each creative artifact as an editorial case study. It balances monumental typography, intrinsic-resolution media spreads, and tactile micro-interactions to elevate individual studio identities.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   CRAFT.                                    │
│             "The Living Showcase for Independent Creators"                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Living Case Studies with Intrinsic Spreads                              │
│  • 2-Column Sticky Studio Profiles & Follow Network                         │
│  • Real-Time Notification & Peer Appreciation System                       │
│  • Zero Algorithmic Noise — Pure Focus on Singular Craft                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Mission Statement
To provide independent designers and studios with a zero-noise, high-fidelity publishing environment that honors the technical depth and aesthetic integrity of physical and digital craft.

---

## 2. Market Problem & Strategic Differentiation

### 2.1 The Problem Space
1. **Algorithmic Decay:** Existing platforms (e.g., Behance, Dribbble, Twitter/X) optimize for rapid scrolling, trending memes, and shallow likes rather than in-depth design systems.
2. **Template Rigidity:** Standard portfolio builders enforce sterile, repetitive templates that strip away the unique studio feeling.
3. **Loss of High-Fidelity Detail:** Heavy image compression and restrictive aspect ratios ruin typography specimens, architecture photos, and complex UI layouts.
4. **Disconnection from Creator Identity:** Work is divorced from the creator's location, philosophy, tools, and studio statement.

### 2.2 The Craft. Solution
* **Intrinsic Multi-Image Case Studies:** Native aspect ratios, uncompressed spreads, and full-bleed image galleries.
* **Distinct Studio Profiles:** 2-column layout with fixed creator credentials, discipline badges, and live followers.
* **Curated Discovery:** Deep filtering by creative discipline (Brand Systems, UI & Interaction, Architecture & Spatial, Editorial & Print, Type Design).
* **Kinetic Brand Aesthetic:** Built with bespoke typography (**Bricolage Grotesque** + **Inter**) and high-contrast accents (`#8DFF00` Kinetic Lime).

---

## 3. User Personas

| Persona | Role | Primary Goal | Key Pain Point on Other Platforms |
| :--- | :--- | :--- | :--- |
| **Elena Vance** | Brand & Type Architect | Publish tactile monographs and variable typography specimens. | Compression ruins delicate serifs, paper textures, and deboss details. |
| **Kai Sato** | Creative Technologist & UI Engineer | Showcase high-density operating systems, node canvases, and shaders. | Platforms lack space for technical specs, tool stacks, and live prototypes. |
| **Maya Lin** | Architectural & Spatial Photographer | Document brutalist structures, concrete seams, and timber joints. | Generic 4:3 crop boxes destroy vertical architectural composition. |
| **Marcus Keller** | Editorial & Print Curator | Discover independent risograph studios and commission monograph books. | Algorithmic feeds hide niche physical craft beneath trending 3D renders. |

---

## 4. Core Product Pillars & Feature Specifications

### 4.1. Kinetic Studio Stream Hero (Home)
* **Dual Vertical Sliding Stream:** Dual continuous marquee columns showcasing live studio artifacts, creator avatars, and city origins.
* **Monumental Headline:** Multi-line staggered text reveal in *Bricolage Grotesque* font.
* **3-Point Craft Manifesto:** Clear numeric value pillars highlighting living spreads, studio profiles, and zero noise.

### 4.2. Editorial Home Sections (4-Column Grids)
* **Featured Works:** 4 hand-curated projects with high-contrast badge indicators.
* **Latest in UI & Interaction Design:** 4 projects covering design systems, shader canvases, and high-density OS layouts.
* **Latest in Brand & Editorial Craft:** 4 projects focused on monographs, risographs, and variable font design.
* **Latest in Architecture & Spatial Design:** 4 projects covering joinery pavilions, monolithic concrete photography, and hardware synthesizers.
* **High-Impact Conversion CTA:** 2-column dark architectural card with monumental headline and floating monograph preview card.

### 4.3. Living Case Study Detail Engine (`/project/[slug]`)
* **Editorial Header:** Project title, creator credential pill with avatar and city, publish date, and category tags.
* **Intrinsic Gallery Spreads:** Vertical stack of full-resolution imagery respecting original aspect ratios without artificial cropping.
* **Technical Specifications Rail:** Tools used (e.g., *Glyphs 3, InDesign, WebGL, Hasselblad*), medium format, and category.
* **Interactive Appreciation System:** Live appreciation counter with persistent state and optimistic UI feedback.
* **Community Thread Comments:** Threaded discussions allowing verified peers to leave feedback.

### 4.4. 2-Column Creator Studio Profile (`/u/[username]`)
* **Left Column (4 Cols - Sticky on Desktop):**
  * High-res avatar with status ring.
  * Verified checkmark badge and `@username`.
  * Studio statement, city location, and website link.
  * **"Follow Studio" Action:** Real-time follow/unfollow toggle dispatching live studio notifications.
  * Studio Metrics Grid: Published works count, total appreciations received, and follower tally.
  * Specialized Skills & Disciplines tags.
* **Right Column (8 Cols):**
  * Published case studies grid with sort options (*Newest* vs *Most Appreciated*).
  * Direct deep links to full case studies.

### 4.5. Personal Studio Dashboard (`/me`)
* Matches the identical 2-column layout of public profiles for seamless mental model.
* Adds **Drafts Management** tab, allowing creators to prepare unpublished works.
* Floating **"Edit Project"** actions on creator cards.
* Interactive **Edit Profile Modal** for instant bio, location, website, and skill customization.

### 4.6. Comprehensive Notification System
* **Trigger Events:**
  1. `appreciation`: Peer appreciates a published project.
  2. `comment`: Peer writes a comment on a case study.
  3. `follow`: Peer follows your studio.
  4. `publish`: Followed studio releases a new project.
* **Notification Popover Dropdown:**
  * Unread badge counter in header.
  * Filter tabs: *All, Appreciations, Comments, Follows*.
  * Mark individual or all notifications as read.
  * Deep navigation links directly to relevant projects and user profiles.

### 4.7. Global Navigation & Capsule Active States
* **Capsule Navigation Links:** High-contrast pill active state (`bg-[var(--chip-bg)] text-[var(--chip-fg)]`) for *Home*, *Explore*, and *Creators*.
* **Omni-Search Bar:** Instant debounced search for projects, creators, and tags across the entire collective.
* **Wide-Screen Layouts:** Expansive container width (`max-w-[1580px]` with `px-4 sm:px-6`) maximizing widescreen monitors.

---

## 5. Technology Stack & Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CRAFT. TECH STACK                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Frontend Core      │ Next.js 16.3 (Turbopack, App Router, React 19)        │
│  Type Safety        │ TypeScript 5.0 (Strict mode enabled)                  │
│  Styling & Tokens   │ Vanilla CSS Variables + Utility-First Tailwind CSS     │
│  Motion Engine      │ Framer Motion (Spring physics & Reduced Motion)       │
│  Iconography        │ Lucide React (Streamlined SVG icons)                  │
│  Typography System  │ Bricolage Grotesque (Headings) + Inter (Body/UI)      │
│  State Hydration    │ React Context API + LocalStorage Persistent Cache     │
│  Zero Bloat Rule    │ Zero external heavy UI libraries (pure artisanal code)│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Architecture Principles
1. **Server-Driven Metadata & SSG:** All static project routes and profiles are statically generated (`generateStaticParams`) with 0ms client-side latency.
2. **Optimistic Client Interactions:** Follows, appreciations, and comments reflect immediately on the client before persisting.
3. **Responsive Container Architecture:** Zero hardcoded pixel widths; responsive grid primitives (`1 -> 2 -> 3 -> 4 cols`) ensuring fluid scaling from iPhone to 4K displays.

---

## 6. Data Schema & Entity Models

```typescript
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  location: string;
  city: string;
  website: string;
  skills: string[];
  followersCount: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  coverImage: string;
  galleryImages: string[];
  creator: User;
  tags: string[];
  tools: string[];
  category: "Brand" | "UI" | "Architecture" | "Editorial" | "Photo" | "Type" | "Product";
  medium: string;
  published: boolean;
  publishedAt: string;
  appreciations: number;
  featured?: boolean;
  comments: Comment[];
}

export interface Notification {
  id: string;
  type: "appreciation" | "comment" | "follow" | "publish";
  actor: User;
  project?: { id: string; slug: string; title: string };
  createdAt: string;
  read: boolean;
}
```

---

## 7. Key Performance Indicators (KPIs)

| Metric | Target Goal | Measurement Mechanism |
| :--- | :--- | :--- |
| **Case Study Read-Through Rate** | > 65% scroll completion | Tracking scroll depth past the 2nd gallery spread. |
| **Studio Follow Conversion** | > 18% of profile visitors | Ratio of `Follow Studio` clicks to profile views. |
| **Publishing Velocity** | 2.4 case studies / creator / mo | Monthly published projects per active studio. |
| **First-Visit Signup Conversion** | > 8.5% | CTA conversions on `/` and `/explore`. |

---

## 8. Product Roadmap & Future Milestones

### Phase 1: MVP Core Foundation (Completed)
- [x] Kinetic Dual-Stream Hero & 4-Column Specialized Showcase Sections.
- [x] Intrinsic High-Resolution Project Detail View with Technical Specs.
- [x] 2-Column Sticky Studio Profile & Personal Studio Dashboard.
- [x] Interactive Follow Studio & Real-time Notification Engine.
- [x] Site-wide margin optimization to `max-w-[1580px]`.

### Phase 2: Studio Collaboration & Rich Blocks (Next)
- [ ] Multi-author collaborative projects (Co-creators attribution).
- [ ] Embeddable live Figma, Spline 3D, and CodeSandbox interactive viewports.
- [ ] Direct Studio Inquiries & Commissioning messenger.

### Phase 3: Custom Domains & Studio Monograph Export
- [ ] Custom domain mapping for creator profiles (`studio.yourname.com`).
- [ ] One-click PDF Monograph generator with print-ready typesetting.

---
*Craft. — Engineered with precision for creators worldwide.*
