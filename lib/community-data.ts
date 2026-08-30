import { CommunityPost, Creator } from "./types";

export const SAMPLE_CREATORS: Record<string, Creator> = {
  ahmed: {
    id: "creator-ahmed",
    username: "ahmed_al_azaiza",
    displayName: "Ahmed Al-Azaiza",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    bio: "Product Designer & Design Systems Architect based in Istanbul.",
    location: "Istanbul, Turkey",
    city: "Istanbul",
    skills: ["UI Design", "Design Systems", "iOS Design"],
    isVerified: true,
    followersCount: 428,
  },
  ameera: {
    id: "creator-ameera",
    username: "ameera_hamada_1",
    displayName: "Ameera Hamada",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
    bio: "Brand Identity Lead & Typography Specialist.",
    location: "Dubai, UAE",
    city: "Dubai",
    skills: ["Brand Identity", "Typography", "Packaging"],
    isVerified: true,
    followersCount: 312,
  },
  tariq: {
    id: "creator-tariq",
    username: "tariq_design",
    displayName: "Tariq Mansour",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    bio: "3D Spatial Artist & Motion Director.",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    skills: ["3D Design", "Blender", "Motion Design"],
    isVerified: true,
    followersCount: 289,
  },
  nour: {
    id: "creator-nour",
    username: "nour_khalil",
    displayName: "Nour Khalil",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    bio: "Senior UX Researcher & Design Strategist.",
    location: "Cairo, Egypt",
    city: "Cairo",
    skills: ["UX Research", "Usability Testing", "Wireframing"],
    isVerified: true,
    followersCount: 195,
  },
};

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    author: SAMPLE_CREATORS.ahmed,
    type: "ab_test",
    title: "A/B Test: Bottom Sheet vs Full Screen Checkout for Mobile Cinema Booking?",
    content:
      "We're optimizing the final seat allocation step for Dot Cinema on iOS. Option A uses a floating modal bottom sheet with swift swipe gestures, while Option B uses a dedicated full-screen stepped checkout with sticky price bar. Which option delivers higher completion rates for mobile ticketing in the Middle East?",
    category: "User Interface Design (UI)",
    tags: ["A/B Testing", "iOS", "Mobile UX", "E-Commerce", "Checkout"],
    abTest: {
      optionA: {
        id: "A",
        label: "Option A: Floating Bottom Sheet with Quick Gestures",
        imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1000&auto=format&fit=crop&q=80",
        votesCount: 42,
      },
      optionB: {
        id: "B",
        label: "Option B: Full-Screen Stepped Checkout Page",
        imageUrl: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1000&auto=format&fit=crop&q=80",
        votesCount: 29,
      },
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    likesCount: 56,
    userLikes: 0,
    comments: [
      {
        id: "comm-1",
        author: SAMPLE_CREATORS.ameera,
        content: "Option A feels much faster for cinema tickets where users just want to pick seats and pay with Apple Pay in 3 seconds!",
        createdAt: "30m ago",
      },
      {
        id: "comm-2",
        author: SAMPLE_CREATORS.nour,
        content: "From our user interviews in GCC, Option A reduces cognitive load significantly. Make sure the gesture dismiss threshold is well calibrated.",
        createdAt: "15m ago",
      },
    ],
  },
  {
    id: "post-2",
    author: SAMPLE_CREATORS.nour,
    type: "poll",
    title: "Poll: Which primary design tool does your team use for design systems in 2026?",
    content:
      "With variable fonts, multi-brand tokens, and AI code generation advancing rapidly, we want to know what tools design studios in our community rely on for their production systems.",
    category: "User Interface Design (UI)",
    tags: ["Poll", "Design Systems", "Figma", "Framer", "Tools"],
    poll: {
      question: "What is your team's primary tool for design systems & handoff?",
      options: [
        { id: "opt-1", text: "Figma (Variables & Token Studio)", votesCount: 148 },
        { id: "opt-2", text: "Framer (Direct Web & Code Components)", votesCount: 42 },
        { id: "opt-3", text: "Penpot (Open Source & CSS Grids)", votesCount: 18 },
        { id: "opt-4", text: "Adobe XD / Sketch / Other", votesCount: 7 },
      ],
      totalVotes: 215,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    likesCount: 84,
    userLikes: 0,
    comments: [
      {
        id: "comm-3",
        author: SAMPLE_CREATORS.tariq,
        content: "Figma remains king for component variants, but Framer is catching up rapidly for marketing sites and landing pages.",
        createdAt: "2h ago",
      },
    ],
  },
  {
    id: "post-3",
    author: SAMPLE_CREATORS.ameera,
    type: "image",
    title: "Visual Showcase: Arabic & Latin Bi-directional Typography Exploration",
    content:
      "Explored optical sizing and variable weight pairings for high-end luxury cosmetics branding. Matching the fluid curves of Arabic Naskh with clean geometric Latin grotesk letterforms without sacrificing cultural nuance.",
    category: "Brand Identity & Visual Design",
    tags: ["Typography", "Arabic Type", "Branding", "Visual Identity", "Luxury"],
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=85",
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    likesCount: 92,
    userLikes: 0,
    comments: [
      {
        id: "comm-4",
        author: SAMPLE_CREATORS.ahmed,
        content: "The contrast balance between the calligraphic strokes and Latin ascenders is immaculate. Would love to see the numbers/digits hierarchy as well!",
        createdAt: "5h ago",
      },
    ],
  },
  {
    id: "post-4",
    author: SAMPLE_CREATORS.tariq,
    type: "text",
    title: "Discussion: Best practices for optimizing 3D spatial models on mobile browsers (WebGL & Three.js)?",
    content:
      "We're building an interactive 3D product customizer for an electric mobility brand in the Gulf region. High temperatures and thermal throttling on mobile devices often drop 60fps down to 24fps.\n\nHere are the optimizations that gave us the biggest gains so far:\n1. Baking ambient occlusion into vertex colors instead of heavy shadow maps.\n2. Drastic reduction of draw calls by combining mesh primitives.\n3. Using KTX2 / Basis Universal compressed textures.\n\nWhat other techniques do you use to guarantee smooth 60fps on mid-range smartphones without compromising lighting quality?",
    category: "3D Design & Spatial Art",
    tags: ["3D", "WebGL", "Three.js", "Performance", "Optimization"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    likesCount: 67,
    userLikes: 0,
    comments: [],
  },
  {
    id: "post-5",
    author: SAMPLE_CREATORS.ahmed,
    type: "ab_test",
    title: "A/B Test: Dark OLED Glass vs Clean Minimal Light Mode for FinTech Dashboard?",
    content:
      "When designing high-frequency analytics dashboards for trading and personal wealth management, which theme aesthetic provides better legibility during extended usage sessions?",
    category: "User Interface Design (UI)",
    tags: ["A/B Testing", "FinTech", "Dark Mode", "Dashboard", "UI Design"],
    abTest: {
      optionA: {
        id: "A",
        label: "Option A: Dark OLED Glass with Vivid Accents",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80",
        votesCount: 88,
      },
      optionB: {
        id: "B",
        label: "Option B: Crisp Minimalist Light Paper Mode",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80",
        votesCount: 45,
      },
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), // 2 days ago
    likesCount: 114,
    userLikes: 0,
    comments: [],
  },
  {
    id: "post-6",
    author: SAMPLE_CREATORS.ameera,
    type: "poll",
    title: "Poll: How many rounds of design iterations do you usually include in client contracts?",
    content:
      "Scope creep is one of the most common issues for freelance designers and independent creative studios in the region. How do you structure your review cycles?",
    category: "Brand Identity & Visual Design",
    tags: ["Poll", "Freelancing", "Business of Design", "Client Work"],
    poll: {
      question: "How many revision cycles do you include before billing extra?",
      options: [
        { id: "opt-1", text: "2 Structured Rounds (Standard)", votesCount: 96 },
        { id: "opt-2", text: "3 Rounds (Comprehensive)", votesCount: 71 },
        { id: "opt-3", text: "Unlimited within a fixed time sprint", votesCount: 24 },
        { id: "opt-4", text: "Hourly rate only (No fixed revision count)", votesCount: 19 },
      ],
      totalVotes: 210,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    likesCount: 78,
    userLikes: 0,
    comments: [],
  },
];

const COMMUNITY_STORAGE_KEY = "layerat_community_posts_v1";
const COMMUNITY_USER_LIKES_KEY = "layerat_community_user_likes_v1";
const COMMUNITY_USER_VOTES_KEY = "layerat_community_user_votes_v1";

export function loadUserLikesMap(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(COMMUNITY_USER_LIKES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveUserLikesMap(map: Record<string, number>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMMUNITY_USER_LIKES_KEY, JSON.stringify(map));
  } catch {}
}

export function loadUserVotesMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(COMMUNITY_USER_VOTES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveUserVotesMap(map: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMMUNITY_USER_VOTES_KEY, JSON.stringify(map));
  } catch {}
}

export function loadCommunityPostsFromStorage(): CommunityPost[] {
  let posts = INITIAL_COMMUNITY_POSTS;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(COMMUNITY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          posts = parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load community posts from localStorage:", e);
    }
  }

  // Merge user personal likes and votes
  const userLikesMap = loadUserLikesMap();
  const userVotesMap = loadUserVotesMap();

  return posts.map((p) => ({
    ...p,
    userLikes: userLikesMap[p.id] !== undefined ? userLikesMap[p.id] : p.userLikes || 0,
    userVotedOptionId: userVotesMap[p.id] || p.userVotedOptionId || undefined,
  }));
}

export function saveCommunityPostsToStorage(posts: CommunityPost[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.warn("Failed to save community posts to localStorage:", e);
  }
}
