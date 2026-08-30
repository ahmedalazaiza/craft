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
  status?: "published" | "draft" | "pending";
  createdAt?: string;
  updatedAt?: string;
  appreciations: number;
  comments: Comment[];
  featured?: boolean;
}

export type NotificationType =
  | "appreciation"
  | "comment"
  | "follow"
  | "publish"
  | "community_like"
  | "community_comment"
  | "community_vote";

export interface Notification {
  id: string;
  type: NotificationType;
  actor: Creator;
  project?: {
    id: string;
    slug: string;
    title: string;
  };
  post?: {
    id: string;
    title: string;
  };
  content?: string;
  createdAt: string;
  read: boolean;
}

export type CommunityPostType = "text" | "image" | "ab_test" | "poll";

export interface PollOption {
  id: string;
  text: string;
  votesCount: number;
}

export interface ABTestOption {
  id: "A" | "B";
  label: string;
  imageUrl?: string;
  votesCount: number;
}

export interface CommunityComment {
  id: string;
  author: Creator;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  author: Creator;
  type: CommunityPostType;
  title: string;
  content: string;
  category: ProjectCategory;
  tags: string[];
  images?: string[];
  abTest?: {
    optionA: ABTestOption;
    optionB: ABTestOption;
  };
  poll?: {
    question: string;
    options: PollOption[];
    totalVotes: number;
  };
  createdAt: string;
  likesCount: number;
  userLikes?: number; // 0 to 10 claps given by current user
  userVotedOptionId?: string; // id of option voted by current user in Poll ("opt-1" etc.) or A/B ("A" | "B")
  comments: CommunityComment[];
}

