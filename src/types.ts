/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  videoUrl: string; // YouTube, Vimeo, or direct MP4 URL
  thumbnailUrl: string;
  year: string;
  role: string;
  client: string;
  gearUsed: string; // e.g. "Sony FX3, Sirui Anamorphic Lenses, DJI Ronin RS3"
  featured: boolean;
}

export interface SiteSettings {
  siteTitle: string;
  siteSubtitle: string;
  siteTagline: string;
  bio: string;
  profileImage: string;
  instagramUrl: string;
  vimeoUrl: string;
  youtubeUrl: string;
  contactEmail: string;
  contactPhone: string;
  accentColor: string; // Hex color code
  heroVideoUrl: string;
  seoKeywords: string;
  adminPasscode: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied' | 'archived';
}
