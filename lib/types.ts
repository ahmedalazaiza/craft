export * from "./taxonomy";

export type UserRole = "member" | "curator" | "moderator" | "admin";

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
  role?: UserRole;
  isFeatured?: boolean;
  badge?: string;
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
  categories?: string[];
  subCategory?: string;
  subCategories?: string[];
  medium: ProjectMedium;
  published: boolean;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
  appreciations: number;
  views?: number;
  comments: Comment[];
  featured?: boolean;
  featuredOrder?: number;
  badge?: string;
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

export interface PlatformSettings {
  id: string;
  announcementBannerText: string;
  announcementBannerLink?: string;
  announcementBannerActive: boolean;
  allowSignups: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  maxUploadSizeMb: number;
  enableCollections: boolean;
  updatedAt?: string;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  projectIds: string[];
  projectsCount?: number;
  sortOrder: number;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ReportReason =
  | "copyright"
  | "inappropriate_content"
  | "spam"
  | "harassment"
  | "other";

export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface Report {
  id: string;
  reporterId?: string;
  projectId?: string;
  reportedCreatorId?: string;
  reason: ReportReason;
  notes?: string;
  status: ReportStatus;
  createdAt?: string;
}

export interface LegalSection {
  title: string;
  content: string;
  bullets?: string[];
}

export interface LegalDocument {
  id: "terms" | "privacy" | "guidelines" | string;
  title: string;
  subtitle: string;
  version: string;
  summary: string;
  sections: LegalSection[];
  isPublished: boolean;
  publishedAt: string;
  updatedAt: string;
}



