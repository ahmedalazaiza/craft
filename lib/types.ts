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
