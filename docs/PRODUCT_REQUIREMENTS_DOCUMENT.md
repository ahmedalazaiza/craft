# Layerat. — Product Requirements Document (PRD) & Platform Hub

> **Document Version:** 1.2.0  
> **Status:** Active / Production-Ready Living Specification  
> **Repository:** [https://github.com/ahmedalazaiza/craft.git](https://github.com/ahmedalazaiza/craft.git)  
> **Role:** Product Management & Technical Architecture  
> **Target Audience:** Engineering, Product, Design, and Executive Stakeholders  

---

## 1. Executive Summary & Product Vision

### 1.1 Product Overview
**Layerat.** is a specialized portfolio, monograph publishing, and community showcase platform engineered specifically for independent creators, art directors, brand architects, and creative engineers. 

Unlike mainstream design aggregators that compress work into generic thumbnail grids and prioritize engagement-bait algorithms, **Layerat.** treats each creative artifact as an editorial case study. It balances monumental typography, intrinsic-resolution media spreads, and tactile micro-interactions to elevate individual studio identities.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  LAYERAT.                                   │
│             "The Living Showcase for Independent Creators"                 │
│                                                                             │
│  • Living Case Studies with 2px Zero-Radius Continuous Gallery Spreads     │
│  • Left Floating Action Rail (Appreciations, Comments, Share, Creator)      │
│  • 2-Column Sticky Studio Profiles & Follow Network                         │
│  • Universal Accessible Breadcrumbs Navigation on 100% of Routes            │
│  • Real-Time Social Sharing (𝕏 Twitter, LinkedIn, WhatsApp, 1-Click Copy)  │
│  • Zero Algorithmic Noise — Pure Focus on Singular Craft                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Mission Statement
To provide independent designers and studios with a zero-noise, high-fidelity publishing environment that honors the technical depth and aesthetic integrity of physical and digital craft.

---

## 2. Feature Implementation Status Matrix & Checklist

### 2.1 Core Navigation & Architecture
- [x] **Universal Breadcrumbs System**: Semantic, accessible `<Breadcrumbs />` with Home icon and smart title truncation deployed across 100% of pages (`/explore`, `/creators`, `/search`, `/project/[slug]`, `/u/[username]`, `/me`, `/me/projects/new`, `/me/projects/[id]`, `/login`, `/signup`).
- [x] **Global Sticky Header**: Dynamic blur navigation with active capsule tokens, notification bell with unread count, profile avatar dropdown, and responsive mobile menu.
- [x] **Omni-Search Field**: Debounced instant search across projects, creators, tools, categories, and tags with filter counter badge.
- [x] **Widescreen Architectural Layout**: Standardized `max-w-[1580px]` container across the entire platform.
- [x] **Dual Theme System**: Dark / Light modes powered by `next-themes` with tailored HSL tokens, dark obsidian ink, and `#8DFF00` kinetic lime accents.

### 2.2 Project Showcase & Detail Engine (`/project/[slug]`)
- [x] **Monumental Typographic Header**: Bricolage Grotesque display headline with proportional hierarchy and clean sub-description.
- [x] **Zero-Radius Continuous Gallery Stack**: Full-bleed images stacked vertically with strictly **2px gap** and **0px border radius**.
- [x] **Left Floating Action Rail (Sticky Desktop & Floating Mobile Bar)**:
  - [x] **Like / Appreciation Button**: Real-time heart toggle with live counter.
  - [x] **Comment Button**: Counter badge with smooth scroll directly to Discussion & Critique.
  - [x] **Share Button**: 1-click trigger opening the universal `ShareModal`.
  - [x] **Publisher Profile Avatar**: Dedicated separated circular badge linking directly to creator studio.
- [x] **Full-Screen Image Lightbox**: High-res keyboard-navigable image inspection.
- [x] **Discussion & Critique Section**: Community comment composer with optimistic updates and timestamps.
- [x] **Technical Specifications Rail**: Tools used badges (*Figma, Blender, WebGL, InDesign*) and discipline tags.

### 2.3 Universal Sharing Engine (`ShareModal`)
- [x] **1-Click Social Sharing**: Direct integrations for 𝕏 (Twitter), LinkedIn, and WhatsApp with prefilled title and attribution.
- [x] **Direct Public URL Copy**: Instant clipboard copy with visual feedback indicator (`Copied! ✅`).
- [x] **Universal Deployment**: Connected to My Studio (`/me`), Public Creator Studios (`/u/[username]`), Project Detail pages (`/project/[slug]`), and cards in Explore/Creators grids.

### 2.4 Studio Profiles & Collective Network
- [x] **2-Column Creator Studio Profile (`/u/[username]`)**: Sticky studio credentials, verified badge, bio, disciplines, live follower count, and case study grid.
- [x] **Follow Studio Engine**: Real-time follow toggle with automatic notification dispatch.
- [x] **Creator Collective Directory (`/creators`)**: Searchable index of makers with discipline filters and studio share buttons.
- [x] **Personal Studio Dashboard (`/me`)**: Drafts management, project editing, and live profile editor modal.

### 2.5 Notification & Activity Engine
- [x] **Multi-Event Notifications**: Appreciations, comments, follows, and new publication alerts.
- [x] **Interactive Popover**: Filter tabs (*All, Appreciations, Comments, Follows*), mark all read, and direct deep links.
- [x] **Optimized Typography**: High-contrast white weights in dark mode for optimal legibility.

### 2.6 Security, Environment & Codebase Infrastructure
- [x] **Git Repository & Remote Setup**: Initialized and pushed to GitHub (`main` branch).
- [x] **Environment Configuration**: Private `.env.local` protected via `.gitignore` with `.env.example` public template.
- [x] **Production Build Validation**: 100% compilation across all 50 routes with Turbopack and TypeScript strict mode.

---

## 3. Pending & Upcoming Roadmap

### Phase 2: Database & Backend Integration (Next In Progress)
- [ ] **Supabase Client Setup**: Install `@supabase/supabase-js` and configure typed client.
- [ ] **Database Schema & Migrations (SQL)**:
  - [ ] `profiles` table (id, username, display_name, avatar_url, bio, city, website, skills, followers_count).
  - [ ] `projects` table (id, slug, title, summary, body, cover_image, gallery_images, creator_id, category, tools, tags, published, appreciations_count).
  - [ ] `comments` table (id, project_id, author_id, content, created_at).
  - [ ] `appreciations` table (user_id, project_id, created_at).
  - [ ] `follows` table (follower_id, creator_id, created_at).
  - [ ] `notifications` table (id, user_id, actor_id, type, project_id, read, created_at).
- [ ] **Supabase Storage Buckets**: `project-media` and `avatars` for direct image uploads.
- [ ] **Authentication Integration**: Real login, signup, session recovery, and protected API routes.

### Phase 3: Advanced Creator Tools
- [ ] Multi-author collaborative projects (Co-creators attribution).
- [ ] Embeddable live Figma, Spline 3D, and CodeSandbox interactive viewports.
- [ ] Custom domain mapping for creator profiles (`studio.yourname.com`).
- [ ] One-click PDF Monograph generator with print-ready typesetting.

---

*Layerat. — Engineered with precision for creators worldwide.*
