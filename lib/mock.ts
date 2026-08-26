export interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  location: string;
  city: string;
  website?: string;
  skills: string[];
  isCurrentUser?: boolean;
  followersCount?: number;
  isVerified?: boolean;
  isOnline?: boolean;
}

export interface Comment {
  id: string;
  author: Creator;
  content: string;
  createdAt: string;
}

export type ProjectCategory =
  | "UI"
  | "Brand"
  | "Photo"
  | "Editorial"
  | "3D & Motion"
  | "Product"
  | "Architecture"
  | "Type";

export type ProjectMedium =
  | "Image"
  | "Video"
  | "PDF/Case study"
  | "Prototype"
  | "3D";

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  coverImage: string;
  galleryImages: string[];
  creator: Creator;
  tags: string[];
  tools: string[];
  category: ProjectCategory;
  medium: ProjectMedium;
  published: boolean;
  publishedAt: string;
  appreciations: number;
  comments: Comment[];
  featured?: boolean;
}

export type NotificationType = "appreciation" | "comment" | "follow" | "publish";

export interface Notification {
  id: string;
  type: NotificationType;
  actor: Creator;
  project?: {
    id: string;
    slug: string;
    title: string;
  };
  content?: string;
  createdAt: string;
  read: boolean;
}

export const mockUsers: Creator[] = [
  {
    id: "user-1",
    username: "elena_v",
    displayName: "Elena Vance",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    bio: "Principal brand designer and spatial typographer exploring tactile digital surfaces and minimal editorial identity systems.",
    location: "Berlin, Germany",
    city: "Berlin",
    website: "https://elenavance.design",
    skills: ["Brand Systems", "Typography", "Art Direction", "Motion"],
    isCurrentUser: true, // Mock signed-in user
    followersCount: 1240,
    isVerified: true,
    isOnline: true,
  },
  {
    id: "user-2",
    username: "kai_sato",
    displayName: "Kai Sato",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    bio: "Product architect & UI engineer designing high-density interfaces, fluid interactions, and generative design tools.",
    location: "Tokyo, Japan",
    city: "Tokyo",
    website: "https://sato.works",
    skills: ["UI Systems", "Creative Code", "Interaction", "Next.js"],
    followersCount: 890,
    isVerified: true,
    isOnline: true,
  },
  {
    id: "user-3",
    username: "maya_lin",
    displayName: "Maya Lin",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    bio: "Architectural photographer and 3D visual artist capturing the interplay of concrete, brutalist forms, and natural sunlight.",
    location: "London, United Kingdom",
    city: "London",
    website: "https://mayalin.studio",
    skills: ["Photography", "3D Rendering", "CGI", "Editorial"],
    followersCount: 1420,
    isVerified: true,
    isOnline: false,
  },
  {
    id: "user-4",
    username: "marcus_k",
    displayName: "Marcus Keller",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    bio: "Editorial art director and printmaker focused on independent monograph publishing, risograph editions, and book craft.",
    location: "Zurich, Switzerland",
    city: "Zurich",
    website: "https://keller-editions.ch",
    skills: ["Editorial", "Print", "Book Design", "Identity"],
    followersCount: 650,
    isVerified: true,
    isOnline: true,
  },
  {
    id: "user-5",
    username: "sophia_chen",
    displayName: "Sophia Chen",
    avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80",
    bio: "Industrial designer & audio-hardware architect crafting tactile synthesizers, CNC machined enclosures, and physical interfaces.",
    location: "New York, USA",
    city: "New York",
    website: "https://sophiachen.audio",
    skills: ["Industrial Design", "Hardware UI", "Machining", "CAD"],
    followersCount: 1100,
    isVerified: false,
    isOnline: false,
  },
  {
    id: "user-6",
    username: "david_nord",
    displayName: "David Nordström",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
    bio: "Spatial architect & pavilion researcher exploring Scandinavian timber joints, daylight acoustics, and passive geothermal structures.",
    location: "Stockholm, Sweden",
    city: "Stockholm",
    website: "https://nordstrom-ark.se",
    skills: ["Architecture", "Spatial Design", "Timber Craft", "Structures"],
    followersCount: 780,
    isVerified: true,
    isOnline: false,
  }
];

export const currentUser = mockUsers[0];

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    slug: "kinfolk-sanctuary",
    title: "Sanctuary: Architectural Monograph & Spatial Identity",
    summary: "A tactile spatial monograph and editorial identity celebrating raw timber, poured concrete, and quiet domestic spaces.",
    body: `Sanctuary investigates the liminal boundary between built environment and untamed organic topography. Commissioned as both an architectural record and a bespoke monograph series, the identity centers on restraint, tactile paper stocks, and deliberate silence.

We developed a custom grotesque typeface with carved incised terminals to echo stone-masonry techniques, paired with a monochrome palette disrupted only by subtle moss-tone pigments.

The publication spans 280 pages of Japanese smyth-sewn binding, featuring extensive duotone photography shot on large-format 4x5 film. Every spread is engineered with asymmetrical grid structures that breathe with the architectural cadence of the structures themselves.`,
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1400&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&auto=format&fit=crop&q=85",
    ],
    creator: mockUsers[0],
    tags: ["Brand", "Editorial", "Typography", "Architecture"],
    tools: ["InDesign", "Figma", "Glyphs", "Film Photography"],
    category: "Brand",
    medium: "PDF/Case study",
    published: true,
    publishedAt: "Aug 22, 2026",
    appreciations: 248,
    featured: true,
    comments: [
      {
        id: "c-1",
        author: mockUsers[1],
        content: "The balance of white space and weight in the type specimen is breathtaking. Superb craft on the debossed cover treatment.",
        createdAt: "2 days ago",
      },
      {
        id: "c-2",
        author: mockUsers[2],
        content: "The tonal sensitivity of the film photography complements the binding choice effortlessly. Beautiful work, Elena.",
        createdAt: "Yesterday at 14:32",
      },
      {
        id: "c-3",
        author: mockUsers[3],
        content: "That incised grotesque terminal detail is pure gold. Would love to see the physical test prints!",
        createdAt: "4 hours ago",
      }
    ],
  },
  {
    id: "proj-2",
    slug: "aurora-interface-os",
    title: "Aurora OS: High-Density Canvas for Creative Engineers",
    summary: "An expansive spatial operating canvas designed for node-based visual programming and real-time audio-visual synthesis.",
    body: `Aurora OS rethinks how creative coders interact with multidimensional data streams. Rather than boxing users into rigid windowing paradigms, Aurora presents an infinite canvas with zoom-independent vector density and contextual micro-surfaces.

Built with bespoke rendering shaders and strict sub-pixel typography guidelines, the UI maintains 120fps fluid transitions even when handling tens of thousands of concurrent data nodes.

The design system incorporates custom color calibration tokens that reduce eye strain during 10-hour deep synthesis sessions, featuring subtle lime and forest highlights against crisp neutral bases.`,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1558655146-d09347e92766?w=1400&auto=format&fit=crop&q=85",
    ],
    creator: mockUsers[1],
    tags: ["UI", "Systems", "Interaction", "Design Engineering"],
    tools: ["Figma", "TypeScript", "WebGL", "Rust"],
    category: "UI",
    medium: "Prototype",
    published: true,
    publishedAt: "Aug 18, 2026",
    appreciations: 412,
    featured: true,
    comments: [
      {
        id: "c-4",
        author: mockUsers[0],
        content: "The spring dynamics on node snapping feel so organic. Incredible work on the density tokens.",
        createdAt: "3 days ago",
      }
    ],
  },
  {
    id: "proj-3",
    slug: "brutalist-concrete-silence",
    title: "Brutalist Silence: Monolithic Forms in Light & Dust",
    summary: "A high-contrast photographic study documenting raw brutalist architecture across European capitals at dawn.",
    body: `Brutalist Silence is an ongoing archive investigating how monolithic post-war concrete facades weather under varying atmospheric conditions.

Shot exclusively during blue hour using natural ambient illumination and long exposures, the series highlights structural textures, shuttering seams, and the poetic geometry of intentional concrete weight.`,
    coverImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&auto=format&fit=crop&q=85",
    ],
    creator: mockUsers[2],
    tags: ["Photography", "Architecture", "Editorial", "Monochrome"],
    tools: ["Hasselblad H6D", "Phase One", "Capture One"],
    category: "Photo",
    medium: "Image",
    published: true,
    publishedAt: "Aug 15, 2026",
    appreciations: 839,
    featured: true,
    comments: [],
  },
  {
    id: "proj-4",
    slug: "bauhaus-risograph-monograph",
    title: "Typographic Resonance: 4-Color Risograph Folio",
    summary: "A limited-edition risograph publication exploring asymmetric grid structures and grotesque typographic scale.",
    body: `Produced on a vintage two-drum GR-series Risograph press using fluorescent pink, cornflower blue, sunflower yellow, and soy black inks.

Each spread challenges standard margins, running glyph specimens into the gutter and across full bleeds.`,
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1400&auto=format&fit=crop&q=85",
    ],
    creator: mockUsers[3],
    tags: ["Editorial", "Print", "Risograph", "Typography"],
    tools: ["InDesign", "Risograph GR3750", "Hand Binding"],
    category: "Editorial",
    medium: "PDF/Case study",
    published: true,
    publishedAt: "Aug 10, 2026",
    appreciations: 184,
    comments: [],
  },
  {
    id: "proj-5",
    slug: "tactile-analog-synthesizer",
    title: "Aura 04: CNC Machined Modular Synthesizer Interface",
    summary: "Solid bead-blasted aluminum hardware synth enclosure with custom knurled rotary encoders and OLED display surfaces.",
    body: `Aura 04 merges physical analog synthesis with surgical tactile ergonomics. Every knob is CNC-milled from 6061 aerospace-grade aluminum and anodized in matte obsidian.

The weighted rotary resistance is tuned with custom high-viscosity damping grease to provide zero play and infinite resolution tactile precision.`,
    coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1400&auto=format&fit=crop&q=85",
    ],
    creator: mockUsers[4],
    tags: ["Product", "Industrial Design", "Hardware", "Audio"],
    tools: ["Fusion 360", "SolidWorks", "CNC Milling", "Altium"],
    category: "Product",
    medium: "3D",
    published: true,
    publishedAt: "Aug 06, 2026",
    appreciations: 295,
    comments: [],
  },
  {
    id: "proj-6",
    slug: "scandinavian-timber-pavilion",
    title: "Nordic Daylight Pavilion: Interlocking Timber Joints",
    summary: "A seasonal daylight observatory constructed from sustainable slow-growth spruce without metallic fasteners.",
    body: `Developed as a public contemplation shelter in Stockholm's archipelago, this pavilion utilizes traditional Japanese and Nordic joinery methods.

The roof louvers are mathematically oriented to trace the summer solstice sun arc, creating dynamic shadow patterns throughout the day.`,
    coverImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [],
    creator: mockUsers[5],
    tags: ["Architecture", "Spatial", "Woodwork", "Sustainability"],
    tools: ["Rhino", "Grasshopper", "Timber Framing"],
    category: "Architecture",
    medium: "PDF/Case study",
    published: true,
    publishedAt: "Aug 02, 2026",
    appreciations: 462,
    comments: [],
  },
  {
    id: "proj-7",
    slug: "kinetic-variable-typeface",
    title: "Kinesis Variable: Fluid Optical Axis & Generative Glyphs",
    summary: "An experimental variable font system responding to real-time audio frequencies and cursor proximity.",
    body: `Kinesis pushes the boundary of modern OpenType variable font axes. Featuring 4 custom axes: Weight, Width, Tension, and Gravity.`,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [],
    creator: mockUsers[0],
    tags: ["Type", "Typography", "Variable Font", "Creative Code"],
    tools: ["Glyphs 3", "Python", "RoboFont"],
    category: "Type",
    medium: "Prototype",
    published: true,
    publishedAt: "Jul 28, 2026",
    appreciations: 390,
    comments: [],
  },
  {
    id: "proj-8",
    slug: "monolith-exhibition-catalogue",
    title: "Monolith: Brutalist Identity & Cast Concrete Catalogue",
    summary: "A heavyweight custom publication featuring blind debossing and custom display grotesques.",
    body: `Monolith explores concrete architecture through tactile, dense print design. Screen-printed in 3 Pantone metallic passes on recycled greyboard.`,
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [],
    creator: mockUsers[3],
    tags: ["Brand", "Editorial", "Print", "Typography"],
    tools: ["InDesign", "Screen Printing", "Figma"],
    category: "Editorial",
    medium: "PDF/Case study",
    published: true,
    publishedAt: "Jul 20, 2026",
    appreciations: 512,
    comments: [],
  },
  {
    id: "proj-9",
    slug: "aether-generative-audio-canvas",
    title: "Aether: Real-time Audio-Visual Synthesis Canvas",
    summary: "A GPU-accelerated web interface for real-time shader generation and frequency mapping.",
    body: `Aether bridges WebGL shader programming with low-latency WebAudio oscillators to deliver responsive ambient visualizers.`,
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [],
    creator: mockUsers[1],
    tags: ["UI", "Creative Code", "Interaction", "Shaders"],
    tools: ["WebGL", "GLSL", "TypeScript", "Three.js"],
    category: "UI",
    medium: "Prototype",
    published: true,
    publishedAt: "Jul 15, 2026",
    appreciations: 630,
    featured: true,
    comments: [],
  },
  {
    id: "proj-10",
    slug: "terra-timber-joinery-study",
    title: "Terra: Japanese Hand-Hewn Cedar Pavilion & Joints",
    summary: "A research archive of complex wooden joinery prototypes and daylight meditation shelters.",
    body: `Constructed in Kyoto using centuries-old Kanawa-tsugi joinery without screws or adhesives, demonstrating structural resonance and flex.`,
    coverImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [],
    creator: mockUsers[5],
    tags: ["Architecture", "Timber Craft", "Structures", "Design"],
    tools: ["Rhino", "Hand Joinery", "Film"],
    category: "Architecture",
    medium: "PDF/Case study",
    published: true,
    publishedAt: "Jul 10, 2026",
    appreciations: 475,
    comments: [],
  },
  {
    id: "proj-11",
    slug: "nexus-design-system",
    title: "Nexus System: Multi-Brand Component Engine & Tokens",
    summary: "A unified cross-platform design token architecture supporting high-density dark mode and fluid type scaling.",
    body: `Nexus formalizes component primitives across Web, iOS, and Figma plugins with synchronized semantic token bindings.`,
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [],
    creator: mockUsers[1],
    tags: ["UI", "Design Systems", "Tokens", "Interaction"],
    tools: ["Figma", "Tokens Studio", "TypeScript"],
    category: "UI",
    medium: "Prototype",
    published: true,
    publishedAt: "Jul 05, 2026",
    appreciations: 520,
    comments: [],
  },
  {
    id: "proj-12",
    slug: "prism-raymarching-canvas",
    title: "Prism: Real-time SDF Raymarching & Shading Environment",
    summary: "An interactive browser-based compute shader engine for procedural geometric forms and refraction materials.",
    body: `Prism compiles custom fragment shaders in real-time, allowing designers to sculpt generative light fields with zero setup.`,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [],
    creator: mockUsers[1],
    tags: ["UI", "Creative Code", "Shaders", "WebGL"],
    tools: ["WebGPU", "GLSL", "React"],
    category: "UI",
    medium: "Prototype",
    published: true,
    publishedAt: "Jun 28, 2026",
    appreciations: 410,
    comments: [],
  },
  {
    id: "proj-13",
    slug: "verve-kinetic-identity",
    title: "Verve: Kinetic Swiss Typography & Dynamic Posters",
    summary: "An expressive visual identity exploring mathematical typographic grids and reactive motion behaviours.",
    body: `Commissioned for an experimental sound symposium, Verve balances rigorous modernist structure with playful kinetic unpredictability.`,
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [],
    creator: mockUsers[0],
    tags: ["Brand", "Typography", "Motion", "Poster"],
    tools: ["After Effects", "Glyphs", "Illustrator"],
    category: "Brand",
    medium: "Image",
    published: true,
    publishedAt: "Jun 20, 2026",
    appreciations: 388,
    comments: [],
  },
  {
    id: "proj-14",
    slug: "aperture-monograph-journal",
    title: "Aperture Vol. 03: Large-Format Editorial on Brutalism",
    summary: "A tactile printed journal featuring hand-tipped plates, exposed spine binding, and cold-foil accents.",
    body: `Printed in limited run of 500 copies on Munken Lynx 150gsm with metallic silver duotone printing.`,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [],
    creator: mockUsers[3],
    tags: ["Editorial", "Print", "Monograph", "Publishing"],
    tools: ["InDesign", "Letterpress", "Foil Stamping"],
    category: "Editorial",
    medium: "PDF/Case study",
    published: true,
    publishedAt: "Jun 15, 2026",
    appreciations: 290,
    comments: [],
  },
  {
    id: "proj-15",
    slug: "solarium-timber-observatory",
    title: "Solarium: Curved Glulam Timber & Daylight Acoustics",
    summary: "An off-grid alpine observatory utilizing steam-bent timber ribs and acoustic dampening moss walls.",
    body: `Engineered using algorithmic structural optimization to withstand extreme snowfall while maximizing winter solar heat gain.`,
    coverImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [],
    creator: mockUsers[5],
    tags: ["Architecture", "Spatial", "Woodwork", "Acoustics"],
    tools: ["Rhino", "Karamba3D", "Timber Framing"],
    category: "Architecture",
    medium: "PDF/Case study",
    published: true,
    publishedAt: "Jun 10, 2026",
    appreciations: 540,
    comments: [],
  },
  {
    id: "proj-16",
    slug: "concrete-forms-photobook",
    title: "Forms in Shadow: Post-War Concrete Monoliths Photobook",
    summary: "Monochrome medium-format film documentation of forgotten concrete monuments and architectural scale.",
    body: `Captured across 8 cities over 3 years on Kodak Tri-X 400 film, curated into an unvarnished hardbound volume.`,
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85",
    galleryImages: [],
    creator: mockUsers[2],
    tags: ["Photo", "Architecture", "Monochrome", "Film"],
    tools: ["Hasselblad 500C/M", "Darkroom Printing"],
    category: "Photo",
    medium: "Image",
    published: true,
    publishedAt: "Jun 02, 2026",
    appreciations: 710,
    comments: [],
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "appreciation",
    actor: mockUsers[1], // Kai Sato
    project: {
      id: "proj-1",
      slug: "kinfolk-sanctuary",
      title: "Sanctuary: Architectural Monograph",
    },
    createdAt: "2 hours ago",
    read: false,
  },
  {
    id: "notif-2",
    type: "comment",
    actor: mockUsers[3], // Marcus Keller
    project: {
      id: "proj-1",
      slug: "kinfolk-sanctuary",
      title: "Sanctuary: Architectural Monograph",
    },
    content: "That incised grotesque terminal detail is pure gold. Would love to see the physical test prints!",
    createdAt: "5 hours ago",
    read: false,
  },
  {
    id: "notif-3",
    type: "follow",
    actor: mockUsers[2], // Maya Lin
    createdAt: "Yesterday",
    read: false,
  },
  {
    id: "notif-4",
    type: "publish",
    actor: mockUsers[4], // Sophia Chen
    project: {
      id: "proj-5",
      slug: "tactile-analog-synthesizer",
      title: "Aura 04: CNC Machined Synthesizer",
    },
    createdAt: "2 days ago",
    read: true,
  },
  {
    id: "notif-5",
    type: "appreciation",
    actor: mockUsers[5], // David Nordström
    project: {
      id: "proj-7",
      slug: "kinetic-variable-typeface",
      title: "Kinesis Variable Font",
    },
    createdAt: "3 days ago",
    read: true,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return mockProjects.find((p) => p.slug === slug);
}

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

export function getCreatorByUsername(username: string): Creator | undefined {
  return mockUsers.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}
