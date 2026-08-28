export * from "./taxonomy";

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  email?: string;
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

export type MasterProjectCategory =
  | "User Interface Design (UI)"
  | "User Experience Design (UX)"
  | "Graphic Design"
  | "Brand Identity"
  | "Motion Design"
  | "3D Design"
  | "Illustration"
  | "Game Design"
  | "AR/VR & Spatial Design"
  | "Industrial & Physical Product Design"
  | "Animation (2D & Traditional)"
  | "Type Design & Lettering"
  | "Presentation & Information Design";

export type LegacyProjectCategory =
  | "UI"
  | "Brand"
  | "Photo"
  | "Editorial"
  | "3D & Motion"
  | "Product"
  | "Architecture"
  | "Type";

export type ProjectCategory = MasterProjectCategory | LegacyProjectCategory | string;

export type ProjectMedium =
  | "Image"
  | "Video"
  | "PDF/Case study"
  | "Prototype"
  | "3D"
  | string;

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
  subCategory?: string;
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
