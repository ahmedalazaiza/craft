import { Project, Creator } from "./types";

/**
 * Computes a weighted quality, relevance, and engagement ranking score for a Project.
 * Used for the default "Curated & Trending" discovery feed in Explore.
 * 
 * Signals:
 * 1. Editorial Spotlight (`featured`): +100 pts
 * 2. Community Appreciations (`appreciations`): +5 pts per heart
 * 3. Discussion Depth (`comments`): +3 pts per comment
 * 4. Real Views (`views`): +0.05 pts per view (capped at 30 pts)
 * 5. Verified Creator Signal: +15 pts
 * 6. Smooth Freshness Time Decay (Boosts new high-craftsmanship releases)
 */
export function computeProjectExploreRank(project: Project): number {
  let score = 0;

  // 1. Featured / Staff Curated Boost
  if (project.featured) {
    score += 100;
  }

  // 2. Real Community Appreciations
  score += (project.appreciations || 0) * 5;

  // 3. Discussion & Comments
  score += (project.comments?.length || 0) * 3;

  // 4. Real Views (logarithmic/capped visibility signal)
  score += Math.min((project.views || 0) * 0.05, 30);

  // 5. Verified Creator
  if (project.creator?.isVerified) {
    score += 15;
  }

  // 6. Recency Freshness Bonus (smooth time decay)
  const time = project.createdAt ? new Date(project.createdAt).getTime() : 0;
  if (time > 0) {
    const hoursAgo = Math.max(0, (Date.now() - time) / (1000 * 60 * 60));
    if (hoursAgo < 48) {
      score += 50 * (1 - hoursAgo / 48); // Linearly scales from 50 to 0 over 48h
    } else if (hoursAgo < 168) {
      // 2 to 7 days
      score += 25 * (1 - (hoursAgo - 48) / 120);
    } else if (hoursAgo < 720) {
      // 7 to 30 days
      score += 10 * (1 - (hoursAgo - 168) / 552);
    }
  }

  return score;
}

/**
 * Sorts an array of Projects based on the selected mode.
 */
export function sortProjects(
  projects: Project[],
  sortBy: "curated" | "newest" | "appreciated" = "curated"
): Project[] {
  return [...projects].sort((a, b) => {
    if (sortBy === "appreciated") {
      const diff = (b.appreciations || 0) - (a.appreciations || 0);
      if (diff !== 0) return diff;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    }

    if (sortBy === "newest") {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    }

    // Default: "curated" / trending score
    const scoreA = computeProjectExploreRank(a);
    const scoreB = computeProjectExploreRank(b);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
}

/**
 * Computes a weighted ranking score for a Creator.
 * 
 * Signals:
 * 1. Search Query Relevance (if searching: exact/prefix match gives top priority)
 * 2. Published Portfolio Volume & Depth (+15 pts per monograph)
 * 3. Total Community Appreciations across all their works (+4 pts per like)
 * 4. Total Views across their works (+0.05 pts per view, max 30)
 * 5. Verified Studio / Creator Badge (+40 pts)
 * 6. Follower Base (+2 pts per follower)
 * 7. Fresh Creative Activity (bonus if published recently)
 */
export function computeCreatorRank(
  creator: Creator,
  creatorProjects: Project[],
  searchQuery?: string
): number {
  let score = 0;

  // 1. Search relevance priority
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    const uLower = creator.username.toLowerCase();
    const dLower = creator.displayName.toLowerCase();

    if (uLower === q || dLower === q) {
      score += 500;
    } else if (uLower.startsWith(q) || dLower.startsWith(q)) {
      score += 250;
    } else if (uLower.includes(q) || dLower.includes(q)) {
      score += 100;
    } else if (creator.skills.some((s) => s.toLowerCase().includes(q))) {
      score += 50;
    }
  }

  // 2. Published Portfolio Depth
  score += creatorProjects.length * 15;

  // 3. Total Project Appreciations
  const totalAppreciations = creatorProjects.reduce(
    (sum, p) => sum + (p.appreciations || 0),
    0
  );
  score += totalAppreciations * 4;

  // 4. Total Project Views
  const totalViews = creatorProjects.reduce(
    (sum, p) => sum + (p.views || 0),
    0
  );
  score += Math.min(totalViews * 0.05, 30);

  // 5. Verified Studio / Creator
  if (creator.isVerified) {
    score += 40;
  }

  // 6. Follower Base
  score += (creator.followersCount || 0) * 2;

  // 7. Recent Publishing Activity
  if (creatorProjects.length > 0) {
    const latestPublishTime = Math.max(
      ...creatorProjects.map((p) => (p.createdAt ? new Date(p.createdAt).getTime() : 0))
    );
    if (latestPublishTime > 0) {
      const daysAgo = (Date.now() - latestPublishTime) / (1000 * 60 * 60 * 24);
      if (daysAgo < 7) score += 35; // Active this week
      else if (daysAgo < 30) score += 20; // Active this month
      else if (daysAgo < 90) score += 10;
    }
  }

  return score;
}
