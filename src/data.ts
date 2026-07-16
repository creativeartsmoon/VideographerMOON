/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortfolioItem, SiteSettings, ContactInquiry } from './types';

export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'neon-dreams',
    title: 'Neon Dreams',
    category: 'Brand Story (For Brands & Artists)',
    description: 'A moody, cyber-aesthetic visual journey through dark alleys and high-contrast rain-slicked streets. Filmed entirely on location with custom anamorphic lenses and stylized deep-violet color grading.',
    videoUrl: 'https://player.vimeo.com/external/517725674.sd.mp4?s=d01072a44f91e9f1661642c2be63e3d2bf93f55e&profile_id=165&oauth2_token_id=57447761',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    year: '2025',
    role: 'Director of Photography & Colorist',
    client: 'RetroWave Collective',
    gearUsed: 'Sony FX6, Atlas Orion Anamorphic Lenses, DJI Ronin 2',
    featured: true
  },
  {
    id: 'whispering-summit',
    title: 'The Whispering Summit',
    category: 'Interview & Documentary',
    description: 'A slow-burn poetic documentary tracking a solo mountaineer attempting to climb the northern alpine ridges in winter. Captured the raw solitude, howling wind, and towering snow-capped peaks.',
    videoUrl: 'https://player.vimeo.com/external/435674703.sd.mp4?s=7a82b937000fa26f63334c975a5075d9e51c36b8&profile_id=165&oauth2_token_id=57447761',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    year: '2026',
    role: 'Director & Lead Cinematographer',
    client: 'Alpine Explorer Magazine',
    gearUsed: 'RED Komodo 6K, Canon Cine-Prime Lenses, DJI Inspire 3 Drone',
    featured: true
  },
  {
    id: 'aura-de-haute',
    title: 'Aura de Haute',
    category: 'Brand Story (For Brands & Artists)',
    description: 'High-contrast editorial fashion film focusing on kinetic motion, luxury silhouettes, and dramatic chiaroscuro studio lighting structures in an industrial concrete gallery.',
    videoUrl: 'https://player.vimeo.com/external/554142371.sd.mp4?s=c82662c19e5d4cb05ef259cbdf084478330d43a5&profile_id=165&oauth2_token_id=57447761',
    thumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    year: '2025',
    role: 'Director of Photography',
    client: 'Maison de L\'Aura',
    gearUsed: 'ARRI Alexa Mini LF, Cooke S7/i Lenses, Astera Tubes',
    featured: false
  },
  {
    id: 'chronos-precision',
    title: 'Chronos: Precision Redefined',
    category: 'Startup Content (Product & Promo)',
    description: 'Extreme macro-cinematography commercial showcasing the delicate gear assembly and premium material selection of an artisanal Swiss watchmaker.',
    videoUrl: 'https://player.vimeo.com/external/392270511.sd.mp4?s=27027598816c21e6ef6df0b73df05bf2fbf74b0c&profile_id=165&oauth2_token_id=57447761',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    year: '2026',
    role: 'Lighting Director & Macro Specialist',
    client: 'Chronos Horology',
    gearUsed: 'Sony FX3, Laowa Pro24mm Probe Lens, Nanlite Forza 500',
    featured: true
  },
  {
    id: 'echoes-of-coast',
    title: 'Echoes of the Coast',
    category: 'Culture Project (Performance & Festival)',
    description: 'An evocative cinematic travelogue shot along the rugged volcanic cliffs and black sand shores of Iceland, capturing raw environmental power, glacial rivers, and morning fog.',
    videoUrl: 'https://player.vimeo.com/external/394343160.sd.mp4?s=529e3a73c14d9bbf1f57917e76166a4f91ef2c0f&profile_id=165&oauth2_token_id=57447761',
    thumbnailUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
    year: '2024',
    role: 'Solo Director-Cameraperson',
    client: 'Iceland Tourism Board',
    gearUsed: 'Sony FX3, Tamron 28-75mm f/2.8, DJI Mavic 3 Pro',
    featured: false
  }
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteTitle: 'Videographer Moon',
  siteSubtitle: 'Moon Young-Woo',
  siteTagline: 'From vision to story. From story to impact.\nCrafting thoughtful visual stories for brands, artists, and cultural projects.',
  bio: "I am Moon Young-Woo, a dedicated video producer and visual creator specializing in crafting thoughtful films for brands, artists, and cultural projects. I focus on translating a client's vision into structured narrative content—ranging from brand storytelling to startup promo videos and cultural performance archives.\n\nMy work is driven by a collaborative, step-by-step production process where transparent communication and technical reliability come first. Rather than chasing superficial aesthetics, I believe that a true visual story is built on absolute reliability, precise execution, and a deep understanding of your brand's core message. I manage the entire production cycle with systematic precision to ensure your project is delivered on time, within scope, and with absolute peace of mind.",
  profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  instagramUrl: 'https://instagram.com',
  vimeoUrl: 'https://vimeo.com',
  youtubeUrl: 'https://youtube.com',
  contactEmail: 'creativearts.moon@gmail.com',
  contactPhone: '+82 10-1234-5678',
  accentColor: '#8A2BE2', // Electric Purple
  heroVideoUrl: '',
  seoKeywords: 'videographer moon, cinema portfolio, fashion videographer, commercial film director, k-videography, luxury brand filmmaker',
  adminPasscode: '0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c' // SHA-256 hash of '1111'
};

export const INITIAL_CONTACT_INQUIRIES: ContactInquiry[] = [
  {
    id: 'inq-1',
    name: 'Sarah Jenkins',
    email: 'sarah@voguemedia.co',
    projectType: 'Fashion Film',
    budget: '$5,000 - $10,000',
    message: 'Hello Moon! We absolutely loved your "Aura de Haute" fashion piece. We are looking to shoot a cinematic 60-second video campaign for our upcoming Autumn Collection in Seoul. We would love to discuss your availability for early next month!',
    createdAt: '2026-07-11T14:30:00Z',
    status: 'new'
  },
  {
    id: 'inq-2',
    name: 'David Oh',
    email: 'david.oh@hyundaicreative.com',
    projectType: 'Commercial',
    budget: '$15,000+',
    message: 'Greetings from Hyundai Creative Team. We are reviewing videographers for a cinematic documentary profiling a luxury custom electric vehicle project. We require high-end macro shots and sweeping drone footage reminiscent of your mountain video.',
    createdAt: '2026-07-10T09:15:00Z',
    status: 'read'
  }
];
