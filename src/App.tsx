/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Camera, Film, Sparkles, Mail, Phone, Calendar, ArrowUpRight, 
  ChevronRight, Award, Compass, Play, MapPin, CheckCircle,
  BookOpen, Rocket, Mic, ArrowDown, Instagram, Check
} from 'lucide-react';
import { PortfolioItem, SiteSettings, ContactInquiry } from './types';
import { 
  INITIAL_PORTFOLIO_ITEMS, 
  INITIAL_SITE_SETTINGS, 
  INITIAL_CONTACT_INQUIRIES 
} from './data';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { FeaturedGrid } from './components/FeaturedGrid';
import { ProjectModal } from './components/ProjectModal';
import { ContactForm } from './components/ContactForm';
import { sha256 } from './utils/security';

const AdminPanel = React.lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));

export default function App() {
  // Navigation active state
  const [activeTab, setActiveTab] = useState<string>('home');

  // Database Local States
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);

  // Selected project for modal detail popup
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Initialize local storage database on load
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('videomoon_portfolio_items');
      const savedSettings = localStorage.getItem('videomoon_site_settings');
      const savedInquiries = localStorage.getItem('videomoon_contact_inquiries');

      if (savedItems) {
        try {
          const parsed = JSON.parse(savedItems) as PortfolioItem[];
          let updated = false;
          const migrated = parsed.map(item => {
            let category = item.category;
            if (category === 'Music Video') {
              category = 'Brand Story (For Brands & Artists)';
              updated = true;
            } else if (category === 'Narrative') {
              category = 'Interview & Documentary';
              updated = true;
            } else if (category === 'Fashion') {
              category = 'Brand Story (For Brands & Artists)';
              updated = true;
            } else if (category === 'Commercial') {
              category = 'Startup Content (Product & Promo)';
              updated = true;
            } else if (category === 'Travel') {
              category = 'Culture Project (Performance & Festival)';
              updated = true;
            } else if (category === 'Culture Film (Event & Space)') {
              category = 'Culture Project (Performance & Festival)';
              updated = true;
            }
            return { ...item, category };
          });
          setPortfolioItems(migrated);
          if (updated) {
            localStorage.setItem('videomoon_portfolio_items', JSON.stringify(migrated));
          }
        } catch (e) {
          console.error('Error parsing or migrating saved portfolio items:', e);
          setPortfolioItems(INITIAL_PORTFOLIO_ITEMS);
        }
      } else {
        setPortfolioItems(INITIAL_PORTFOLIO_ITEMS);
        localStorage.setItem('videomoon_portfolio_items', JSON.stringify(INITIAL_PORTFOLIO_ITEMS));
      }

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        let updated = false;
        if (parsed.siteTagline === 'Cinematic Storytelling through a Luxurious, Minimalist Lens.' || 
            parsed.siteTagline === 'Cinematic storytelling through a luxurious, minimalist lens.' ||
            parsed.siteTagline === '빛의 궤적으로 그리는 시네마틱 서사, 감각적인 모든 찰나의 기록.' ||
            parsed.siteTagline === 'Capturing the unique stories of brands and people through captivating cinematic visuals.' ||
            parsed.siteTagline === 'From vision to story, from story to impact' ||
            parsed.siteTagline === 'From vision to story, from story to impact — crafting cinematic narratives for visionary artists and innovative startups.' ||
            parsed.siteTagline === 'From vision to story. From story to impact. Crafting thoughtful films for brands, artists, and cultural projects.' ||
            parsed.siteTagline === 'From vision to story. From story to impact. Crafting thoughtful visual stories for brands, artists, and cultural projects.') {
          parsed.siteTagline = 'From vision to story. From story to impact.\nCrafting thoughtful visual stories for brands, artists, and cultural projects.';
          updated = true;
        }
        const NEW_BIO = "I am Moon Young-Woo, a dedicated video producer and visual creator specializing in crafting thoughtful films for brands, artists, and cultural projects. I focus on translating a client's vision into structured narrative content—ranging from brand storytelling to startup promo videos and cultural performance archives.\n\nMy work is driven by a collaborative, step-by-step production process where transparent communication and technical reliability come first. Rather than chasing superficial aesthetics, I believe that a true visual story is built on absolute reliability, precise execution, and a deep understanding of your brand's core message. I manage the entire production cycle with systematic precision to ensure your project is delivered on time, within scope, and with absolute peace of mind.";
        if (!parsed.bio || 
            parsed.bio.includes("award-winning") || 
            parsed.bio.includes("high-end") || 
            parsed.bio.includes("cinematic masterpiece") ||
            parsed.bio.includes("professional filmmaker and creative producer entering my third year")) {
          parsed.bio = NEW_BIO;
          updated = true;
        }
        if (parsed.heroVideoUrl === 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054aa2b97fcc85a21e9ec6b0631620c&profile_id=164&oauth2_token_id=57447761') {
          parsed.heroVideoUrl = '';
          updated = true;
        }
        const oldPasscodeHash = '981cf69707e4bc8310c3f596b9968434863c1a3ebfa9eb2b3ef7bf3c9a62a98f'; // SHA-256 of 'moon123'
        const defaultPasscodeHash = '0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c'; // SHA-256 of '1111'
        const wrongDefaultHash = '011ece28a562ce5a5288b2225a07c4b03650f00f07df4d68bf4e7e6001090332'; // Incorrect hash previously set
        
        if (!parsed.adminPasscode) {
          parsed.adminPasscode = defaultPasscodeHash;
          updated = true;
        } else if (parsed.adminPasscode.length !== 64) {
          const hashedInput = sha256(parsed.adminPasscode.trim());
          if (hashedInput === oldPasscodeHash) {
            parsed.adminPasscode = defaultPasscodeHash;
          } else {
            parsed.adminPasscode = hashedInput;
          }
          updated = true;
        } else if (parsed.adminPasscode === oldPasscodeHash || parsed.adminPasscode === wrongDefaultHash) {
          // If the stored value is already the old hash or incorrect default hash, upgrade it to the new default '1111' hash
          parsed.adminPasscode = defaultPasscodeHash;
          updated = true;
        }
        setSiteSettings(parsed);
        if (updated) {
          localStorage.setItem('videomoon_site_settings', JSON.stringify(parsed));
        }
      } else {
        setSiteSettings(INITIAL_SITE_SETTINGS);
        localStorage.setItem('videomoon_site_settings', JSON.stringify(INITIAL_SITE_SETTINGS));
      }

      if (savedInquiries) {
        setInquiries(JSON.parse(savedInquiries));
      } else {
        setInquiries(INITIAL_CONTACT_INQUIRIES);
        localStorage.setItem('videomoon_contact_inquiries', JSON.stringify(INITIAL_CONTACT_INQUIRIES));
      }
    } catch (e) {
      console.error('Local database initialization failed, falling back to static schema.', e);
      setPortfolioItems(INITIAL_PORTFOLIO_ITEMS);
      setSiteSettings(INITIAL_SITE_SETTINGS);
      setInquiries(INITIAL_CONTACT_INQUIRIES);
    }
  }, []);

  // 2. SEO Meta-tag & Document title sync hook
  useEffect(() => {
    if (siteSettings) {
      // Set Document Title
      document.title = `${siteSettings.siteTitle || 'Videographer Moon'} | ${siteSettings.siteSubtitle || 'Cinematography portfolio'}`;

      // Set meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', siteSettings.siteTagline || 'Cinematic storytelling through a luxurious, minimalist lens.');

      // Set meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', siteSettings.seoKeywords || 'videography portfolio');
    }
  }, [siteSettings]);

  // Database mutation sync handlers
  const handleUpdatePortfolio = (updatedItems: PortfolioItem[]) => {
    setPortfolioItems(updatedItems);
    localStorage.setItem('videomoon_portfolio_items', JSON.stringify(updatedItems));
  };

  const handleUpdateSettings = (updatedSettings: SiteSettings) => {
    setSiteSettings(updatedSettings);
    localStorage.setItem('videomoon_site_settings', JSON.stringify(updatedSettings));
  };

  const handleUpdateInquiries = (updatedInquiries: ContactInquiry[]) => {
    setInquiries(updatedInquiries);
    localStorage.setItem('videomoon_contact_inquiries', JSON.stringify(updatedInquiries));
  };

  // Submit client inquiry booking message
  const handleContactSubmit = (newInquiryData: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: ContactInquiry = {
      ...newInquiryData,
      id: 'inq-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    const updated = [newInquiry, ...inquiries];
    handleUpdateInquiries(updated);
  };

  // Click on a project
  const handleProjectSelect = (item: PortfolioItem) => {
    setSelectedProject(item);
    setIsModalOpen(true);
  };

  // Dynamic Custom Accent Color Hex injector
  const dynamicAccentColor = siteSettings.accentColor || '#8A2BE2';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-accent-purple selection:text-white" id="videomoon-root-app">
      
      {/* 1. Dynamic Design Engine: Injecting customized theme color variables */}
      <style>{`
        :root {
          --color-accent-purple: ${dynamicAccentColor} !important;
          --color-accent-glow: ${dynamicAccentColor}66 !important;
        }
        
        /* Dynamic neon accents overrides */
        .text-accent-purple {
          color: ${dynamicAccentColor} !important;
        }
        .bg-accent-purple {
          background-color: ${dynamicAccentColor} !important;
        }
        .border-accent-purple {
          border-color: ${dynamicAccentColor} !important;
        }
        .focus\\:border-accent-purple:focus {
          border-color: ${dynamicAccentColor} !important;
        }
        .selection\\:bg-accent-purple::selection {
          background-color: ${dynamicAccentColor} !important;
        }
      `}</style>

      {/* 2. Sleek Floating Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        settings={siteSettings} 
      />

      {/* 3. Main Route Shell */}
      <main className="flex-grow">
        
        {/* ================= VIEW A: HOME SHOWCASE ================= */}
        {activeTab === 'home' && (
          <div className="space-y-24 pb-24" id="home-view-container">
            {/* Cinematic Hero Background */}
            <HeroSection 
              settings={siteSettings} 
              onExploreClick={() => setActiveTab('portfolio')} 
              onBookClick={() => setActiveTab('contact')} 
            />

            {/* ================= SECTION 1: WHAT I DO ================= */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12" id="home-services-section">
              <div className="text-center space-y-3">
                <span className="text-xs font-mono text-accent-purple uppercase tracking-[0.25em]">Services</span>
                <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">What I Do</h2>
                <div className="w-12 h-[2px] bg-accent-purple mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* Card 1: Brand Story */}
                <div className="p-8 rounded-xl bg-neutral-900/35 border border-white/5 hover:border-accent-purple/30 hover:bg-neutral-900/65 transition-all duration-500 flex flex-col justify-between group h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full blur-3xl group-hover:bg-accent-purple/10 transition-colors pointer-events-none" />
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">Brand Story</h3>
                      <p className="text-xs font-mono text-accent-purple/80 tracking-widest uppercase">Premium Narrative Campaign</p>
                    </div>
                    <div className="border-t border-white/5 pt-4">
                      <p className="text-neutral-400 text-sm font-light leading-relaxed">
                        Films capturing the brand's core philosophy, vision, and deep human connections.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Startup Content */}
                <div className="p-8 rounded-xl bg-neutral-900/35 border border-white/5 hover:border-accent-purple/30 hover:bg-neutral-900/65 transition-all duration-500 flex flex-col justify-between group h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full blur-3xl group-hover:bg-accent-purple/10 transition-colors pointer-events-none" />
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform duration-300">
                      <Rocket className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">Startup Content</h3>
                      <p className="text-xs font-mono text-accent-purple/80 tracking-widest uppercase">Promotional & Core Media</p>
                    </div>
                    <div className="border-t border-white/5 pt-4">
                      <p className="text-neutral-400 text-sm font-light leading-relaxed">
                        Content introducing startup products, digital services, and dynamic team culture.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3: Culture Project */}
                <div className="p-8 rounded-xl bg-neutral-900/35 border border-white/5 hover:border-accent-purple/30 hover:bg-neutral-900/65 transition-all duration-500 flex flex-col justify-between group h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full blur-3xl group-hover:bg-accent-purple/10 transition-colors pointer-events-none" />
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform duration-300">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">Culture Project</h3>
                      <p className="text-xs font-mono text-accent-purple/80 tracking-widest uppercase">Performance & Festival</p>
                    </div>
                    <div className="border-t border-white/5 pt-4">
                      <p className="text-neutral-400 text-sm font-light leading-relaxed">
                        Videos documenting high-energy live performances, cultural festivals, exhibitions, and creative brand events.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 4: Interview & Documentary */}
                <div className="p-8 rounded-xl bg-neutral-900/35 border border-white/5 hover:border-accent-purple/30 hover:bg-neutral-900/65 transition-all duration-500 flex flex-col justify-between group h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full blur-3xl group-hover:bg-accent-purple/10 transition-colors pointer-events-none" />
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform duration-300">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">Interview & Documentary</h3>
                      <p className="text-xs font-mono text-accent-purple/80 tracking-widest uppercase">In-Depth Dialogue Profile</p>
                    </div>
                    <div className="border-t border-white/5 pt-4">
                      <p className="text-neutral-400 text-sm font-light leading-relaxed">
                        Interview-style documentary capturing the raw stories of founders, creators, and team members.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= SECTION 2: PROCESS ================= */}
            <section className="bg-neutral-950/40 border-y border-white/5 py-24 relative overflow-hidden" id="home-process-section">
              <div className="absolute inset-0 bg-radial-gradient from-accent-purple/5 to-transparent blur-3xl pointer-events-none" />
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-center space-y-3">
                  <span className="text-xs font-mono text-accent-purple uppercase tracking-[0.25em]">Workflow</span>
                  <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">The Process</h2>
                  <div className="w-12 h-[2px] bg-accent-purple mx-auto rounded-full" />
                </div>

                {/* Elegant Left-to-Right Horizontal Step-by-Step Flow */}
                <div className="flex flex-col md:flex-row items-center justify-center md:items-stretch gap-6 md:gap-2 max-w-6xl mx-auto">
                  
                  {/* Step 1: Consultation */}
                  <div className="flex-1 w-full flex flex-col items-center bg-neutral-900/35 border border-white/5 rounded-xl p-6 hover:border-accent-purple/20 transition-all duration-300 relative text-center">
                    <div className="w-10 h-10 rounded-full bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple font-mono text-xs font-semibold mb-4">
                      01
                    </div>
                    <h3 className="font-display font-bold text-sm tracking-widest uppercase text-white mb-2">Consultation</h3>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      Goal alignment, scope definition, budget profiling, and creative exploration.
                    </p>
                  </div>

                  {/* Arrow connector */}
                  <div className="flex items-center justify-center py-1 md:py-0">
                    <ArrowDown className="w-5 h-5 text-accent-purple/50 md:-rotate-90" />
                  </div>

                  {/* Step 2: Planning */}
                  <div className="flex-1 w-full flex flex-col items-center bg-neutral-900/35 border border-white/5 rounded-xl p-6 hover:border-accent-purple/20 transition-all duration-300 relative text-center">
                    <div className="w-10 h-10 rounded-full bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple font-mono text-xs font-semibold mb-4">
                      02
                    </div>
                    <h3 className="font-display font-bold text-sm tracking-widest uppercase text-white mb-2">Planning</h3>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      Concept moodboards, script development, and shot list mapping.
                    </p>
                  </div>

                  {/* Arrow connector */}
                  <div className="flex items-center justify-center py-1 md:py-0">
                    <ArrowDown className="w-5 h-5 text-accent-purple/50 md:-rotate-90" />
                  </div>

                  {/* Step 3: Production */}
                  <div className="flex-1 w-full flex flex-col items-center bg-neutral-900/35 border border-white/5 rounded-xl p-6 hover:border-accent-purple/20 transition-all duration-300 relative text-center">
                    <div className="w-10 h-10 rounded-full bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple font-mono text-xs font-semibold mb-4">
                      03
                    </div>
                    <h3 className="font-display font-bold text-sm tracking-widest uppercase text-white mb-2">Production</h3>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      On-set cinematography with high-end cine gear and precise light control.
                    </p>
                  </div>

                  {/* Arrow connector */}
                  <div className="flex items-center justify-center py-1 md:py-0">
                    <ArrowDown className="w-5 h-5 text-accent-purple/50 md:-rotate-90" />
                  </div>

                  {/* Step 4: Editing */}
                  <div className="flex-1 w-full flex flex-col items-center bg-neutral-900/35 border border-white/5 rounded-xl p-6 hover:border-accent-purple/20 transition-all duration-300 relative text-center">
                    <div className="w-10 h-10 rounded-full bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple font-mono text-xs font-semibold mb-4">
                      04
                    </div>
                    <h3 className="font-display font-bold text-sm tracking-widest uppercase text-white mb-2">Editing</h3>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      Post-production, multi-cam assembly, custom audio, and cinematic grading.
                    </p>
                  </div>

                  {/* Arrow connector */}
                  <div className="flex items-center justify-center py-1 md:py-0">
                    <ArrowDown className="w-5 h-5 text-accent-purple/50 md:-rotate-90" />
                  </div>

                  {/* Step 5: Delivery */}
                  <div className="flex-1 w-full flex flex-col items-center bg-neutral-900/35 border border-white/5 rounded-xl p-6 hover:border-accent-purple/20 transition-all duration-300 relative text-center">
                    <div className="w-10 h-10 rounded-full bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple font-mono text-xs font-semibold mb-4">
                      05
                    </div>
                    <h3 className="font-display font-bold text-sm tracking-widest uppercase text-white mb-2">Delivery</h3>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      High-resolution exports optimized for theatrical, web, or social platforms.
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* ================= SECTION 3: SELECTED WORK ================= */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="home-portfolio-section">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-mono text-accent-purple uppercase tracking-[0.25em]">Showcase</span>
                  <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">Selected Work</h2>
                  <div className="w-12 h-[2px] bg-accent-purple sm:hidden mx-auto rounded-full mt-2" />
                </div>
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white hover:gap-2.5 transition-all focus:outline-none"
                  id="view-all-reels-btn"
                >
                  View Full Portfolio <ChevronRight className="w-4 h-4 text-accent-purple" />
                </button>
              </div>

              {/* Renders 3 Featured Reels */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" id="home-portfolio-grid">
                {portfolioItems.slice(0, 3).map((project) => (
                  <article
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className="group relative aspect-video bg-neutral-900 rounded-lg overflow-hidden border border-white/5 cursor-pointer shadow-lg hover:shadow-2xl hover:border-accent-purple/30 transition-all duration-500"
                    id={`portfolio-card-${project.id}`}
                  >
                    {/* Thumbnail Image */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                      <img
                        src={project.thumbnailUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80'}
                        alt={project.title}
                        className="w-full h-full object-cover transform scale-100 group-hover:scale-105 filter brightness-[0.7] group-hover:brightness-[0.4] transition-all duration-700"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Elegant Purple-Midnight Color Grading Vignette Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:bg-accent-purple/20 group-hover:opacity-40 transition-all duration-500" />
                    </div>

                    {/* Glowing decorative border line inside */}
                    <div className="absolute inset-0 border border-transparent group-hover:border-accent-purple/20 rounded-lg pointer-events-none transition-colors duration-500" />

                    {/* Play Button micro-animation overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-90 group-hover:scale-100 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-accent-purple text-white flex items-center justify-center shadow-lg shadow-accent-purple/50">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Tag / Category Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono uppercase tracking-widest text-neutral-300">
                        {project.category}
                      </span>
                    </div>

                    {/* Year label top-right */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="text-[10px] font-mono text-neutral-400">
                        {project.year}
                      </span>
                    </div>

                    {/* Project details card info (bottom) */}
                    <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end">
                      <span className="text-[10px] font-mono text-accent-purple uppercase tracking-widest mb-1 group-hover:text-purple-300 transition-colors">
                        {project.client || 'Independent'}
                      </span>
                      <h3 className="font-display font-bold text-lg text-white tracking-wide uppercase leading-tight group-hover:translate-x-1 transition-transform duration-300">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-neutral-400 font-light opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                        <Film className="w-3.5 h-3.5 text-accent-purple" />
                        <span className="truncate max-w-[240px]">{project.role}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Instagram Connector Link Button Box */}
              <div className="flex justify-center pt-8" id="instagram-connector-container">
                <a
                  href={siteSettings.instagramUrl || 'https://instagram.com'}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-3 px-8 py-4.5 rounded-full border border-white/10 bg-neutral-900/30 text-white font-mono text-xs uppercase tracking-widest hover:border-accent-purple/40 hover:bg-neutral-900/80 hover:shadow-[0_0_20px_rgba(138,43,226,0.15)] active:scale-95 transition-all duration-300"
                >
                  <Instagram className="w-4.5 h-4.5 text-accent-purple animate-pulse" />
                  <span>Connect On Instagram</span>
                </a>
              </div>
            </section>

            {/* ================= SECTION 4: CONTACT & INQUIRY FORM ================= */}
            <section className="bg-neutral-950/40 border-t border-white/5 py-24 relative overflow-hidden" id="home-contact-section">
              <div className="absolute inset-0 bg-radial-gradient from-accent-purple/5 to-transparent blur-3xl pointer-events-none" />
              
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in">
                <div className="text-center space-y-3">
                  <span className="text-xs font-mono text-accent-purple uppercase tracking-[0.25em]">Bookings & Collaboration</span>
                  <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
                    Shape Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-purple-400 glow-text-purple">Visual Story</span>
                  </h2>
                  <div className="w-12 h-[2px] bg-accent-purple mx-auto rounded-full mt-2" />
                </div>

                <div className="p-0 bg-transparent">
                  <ContactForm 
                    settings={siteSettings} 
                    onSubmit={handleContactSubmit} 
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= VIEW B: PORTFOLIO WORKS ================= */}
        {activeTab === 'portfolio' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12" id="portfolio-view-container">
            <div className="text-center space-y-4 max-w-3xl mx-auto border-b border-white/5 pb-10" id="portfolio-header">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
                  <span className="text-xs font-mono text-accent-purple uppercase tracking-[0.25em]">Portfolio</span>
                </div>
                <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-tight whitespace-nowrap">
                  Creative Works
                </h2>
              </div>
              <div className="max-w-2xl mx-auto pt-1">
                <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed">
                  A curated collection of visual work developed in collaboration with startups, artists, and creative brands, crafted to communicate ideas with clarity and purpose.
                </p>
              </div>
            </div>

            {/* Filterable works grid */}
            <FeaturedGrid 
              items={portfolioItems} 
              onProjectSelect={handleProjectSelect} 
              featuredOnly={false} 
            />
          </section>
        )}

        {/* ================= VIEW C: ABOUT BIOGRAPHY ================= */}
        {activeTab === 'about' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20" id="about-view-container">
            
            {/* Visual Header Grid with Portrait */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Profile portrait frame */}
              <div className="lg:col-span-5 flex justify-center" id="about-portrait-frame">
                <div className="relative group w-full max-w-sm aspect-[4/5] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                  {siteSettings.profileImage ? (
                    <img
                      src={siteSettings.profileImage}
                      alt={siteSettings.siteTitle}
                      className="w-full h-full object-cover filter saturate-[0.85] contrast-[1.05] group-hover:scale-102 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-700">
                      <Camera className="w-16 h-16" />
                    </div>
                  )}
                  {/* Subtle purple shadow bloom behind portrait */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                  <div className="absolute inset-0 border border-transparent group-hover:border-accent-purple/30 rounded-xl transition-all duration-500 pointer-events-none" />
                </div>
              </div>

              {/* Bio description text block */}
              <div className="lg:col-span-7 space-y-6" id="about-bio-panel">
                <span className="text-xs font-mono text-accent-purple uppercase tracking-[0.25em]">Video Producer & Visual Creator</span>
                <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
                  Moon <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">Young-Woo</span>
                </h2>
                
                <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed whitespace-pre-wrap">
                  {siteSettings.bio || 'Professional filmmaker specializing in luxury commercial videos and artistic documentaries.'}
                </p>

                {/* Compact Production & Creative Specs (Formerly My Approach Layout Style) */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse"></span>
                    <h3 className="text-xs font-mono text-accent-purple uppercase tracking-[0.3em] font-bold">
                      Production &amp; Specs
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                    {/* Scope Card */}
                    <div className="group relative p-5 rounded-xl bg-neutral-950/60 border-l-2 border-l-accent-purple/60 border-y border-r border-white/5 hover:border-accent-purple/40 hover:bg-neutral-900/40 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full shadow-lg shadow-black/40">
                      <div className="absolute top-2 right-4 text-5xl font-black font-display text-neutral-800/15 group-hover:text-accent-purple/10 transition-colors pointer-events-none select-none">
                        01
                      </div>
                      <div className="space-y-3">
                        <div className="p-2 w-fit rounded-lg bg-accent-purple/10 text-accent-purple">
                          <Film className="w-4 h-4" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider group-hover:text-accent-purple transition-colors">
                            Production Scope
                          </h4>
                          <ul className="space-y-1 text-[11px] font-light text-neutral-400">
                            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-purple/60 shrink-0" /> Brand Story</li>
                            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-purple/60 shrink-0" /> Interview &amp; Doc</li>
                            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-purple/60 shrink-0" /> Startup Content</li>
                            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-purple/60 shrink-0" /> Culture Project</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Setup Card */}
                    <div className="group relative p-5 rounded-xl bg-neutral-950/60 border-l-2 border-l-accent-purple/60 border-y border-r border-white/5 hover:border-accent-purple/40 hover:bg-neutral-900/40 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full shadow-lg shadow-black/40">
                      <div className="absolute top-2 right-4 text-5xl font-black font-display text-neutral-800/15 group-hover:text-accent-purple/10 transition-colors pointer-events-none select-none">
                        02
                      </div>
                      <div className="space-y-3">
                        <div className="p-2 w-fit rounded-lg bg-accent-purple/10 text-accent-purple">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider group-hover:text-accent-purple transition-colors">
                            Production Setup
                          </h4>
                          <ul className="space-y-1 text-[11px] font-light text-neutral-400">
                            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-purple/60 shrink-0" /> Camera</li>
                            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-purple/60 shrink-0" /> Lighting</li>
                            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-purple/60 shrink-0" /> Audio</li>
                            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-purple/60 shrink-0" /> Workflow</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Post Card */}
                    <div className="group relative p-5 rounded-xl bg-neutral-950/60 border-l-2 border-l-accent-purple/60 border-y border-r border-white/5 hover:border-accent-purple/40 hover:bg-neutral-900/40 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full shadow-lg shadow-black/40">
                      <div className="absolute top-2 right-4 text-5xl font-black font-display text-neutral-800/15 group-hover:text-accent-purple/10 transition-colors pointer-events-none select-none">
                        03
                      </div>
                      <div className="space-y-3">
                        <div className="p-2 w-fit rounded-lg bg-accent-purple/10 text-accent-purple">
                          <Sparkles className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider group-hover:text-accent-purple transition-colors">
                            Post Production
                          </h4>
                          <ul className="space-y-1 text-[11px] font-light text-neutral-400">
                            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-purple/60 shrink-0" /> Editing</li>
                            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-purple/60 shrink-0" /> Color</li>
                            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-accent-purple/60 shrink-0" /> Sound</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-xs font-mono font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Bookings & Collaboration <ArrowUpRight className="w-4 h-4 text-accent-purple" />
                  </button>
                </div>
              </div>

            </div>

            {/* Bento-grid Capabilities & Kit details - Re-designed to be an elegant, balanced asymmetrical layout (Showing My Approach) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-8 border-t border-white/5" id="about-bento-specs">
              
              {/* Left Column: Heading & Description (Balancing the page layout) */}
              <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse"></span>
                  <h3 className="text-xs font-mono text-accent-purple uppercase tracking-[0.3em] font-bold">Philosophy</h3>
                </div>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight leading-tight">
                  My <br className="hidden lg:block" />Approach
                </h3>
                <div className="w-8 h-[2px] bg-accent-purple/40 rounded-full" />
              </div>

              {/* Right Column: Spec Cards (Symmetric & responsive) */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
                
                {/* Box 1: Story First */}
                <div className="group relative p-6 rounded-xl bg-neutral-950/60 border border-white/5 hover:border-accent-purple/30 hover:-translate-y-1 transition-all duration-300 space-y-4 shadow-lg shadow-black/30">
                  <div className="flex items-center justify-between">
                    <BookOpen className="w-5 h-5 text-accent-purple" />
                    <span className="text-[10px] font-mono text-neutral-600 group-hover:text-accent-purple/50 transition-colors">01 / STORY</span>
                  </div>
                  <h4 className="font-display font-bold text-xs text-white uppercase tracking-widest border-b border-white/5 pb-2">
                    Story First
                  </h4>
                  <p className="text-xs text-neutral-300 font-light leading-relaxed group-hover:text-white transition-colors duration-300">
                    Understanding the purpose and core message behind the content.
                  </p>
                </div>

                {/* Box 2: Thoughtful Production */}
                <div className="group relative p-6 rounded-xl bg-neutral-950/60 border border-white/5 hover:border-accent-purple/30 hover:-translate-y-1 transition-all duration-300 space-y-4 shadow-lg shadow-black/30">
                  <div className="flex items-center justify-between">
                    <Compass className="w-5 h-5 text-accent-purple" />
                    <span className="text-[10px] font-mono text-neutral-600 group-hover:text-accent-purple/50 transition-colors">02 / PROCESS</span>
                  </div>
                  <h4 className="font-display font-bold text-xs text-white uppercase tracking-widest border-b border-white/5 pb-2">
                    Thoughtful Production
                  </h4>
                  <p className="text-xs text-neutral-300 font-light leading-relaxed group-hover:text-white transition-colors duration-300">
                    A customized and reliable process designed for your project.
                  </p>
                </div>

                {/* Box 3: Detailed Finishing */}
                <div className="group relative p-6 rounded-xl bg-neutral-950/60 border border-white/5 hover:border-accent-purple/30 hover:-translate-y-1 transition-all duration-300 space-y-4 shadow-lg shadow-black/30">
                  <div className="flex items-center justify-between">
                    <Sparkles className="w-5 h-5 text-accent-purple animate-pulse" />
                    <span className="text-[10px] font-mono text-neutral-600 group-hover:text-accent-purple/50 transition-colors">03 / FINISH</span>
                  </div>
                  <h4 className="font-display font-bold text-xs text-white uppercase tracking-widest border-b border-white/5 pb-2">
                    Detailed Finishing
                  </h4>
                  <p className="text-xs text-neutral-300 font-light leading-relaxed group-hover:text-white transition-colors duration-300">
                    Editing, color, and sound to bring the final narrative to life.
                  </p>
                </div>

              </div>
            </div>

          </section>
        )}

        {/* ================= VIEW D: CONTACT INQUIRY ================= */}
        {activeTab === 'contact' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16 animate-fade-in" id="contact-view-container">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono text-accent-purple uppercase tracking-[0.25em]">Bookings & Collaboration</span>
              <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
                Shape Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-purple-400 glow-text-purple">Visual Story</span>
              </h2>
              <div className="w-12 h-[2px] bg-accent-purple mx-auto rounded-full mt-2" />
            </div>

            <ContactForm 
              settings={siteSettings} 
              onSubmit={handleContactSubmit} 
            />
          </section>
        )}

        {/* ================= VIEW E: ADMIN CONTROL CONSOLE ================= */}
        {activeTab === 'admin' && (
          <section className="py-12 bg-neutral-950/20" id="admin-view-container">
            <React.Suspense fallback={
              <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
                <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Loading Secure Control Console...</p>
              </div>
            }>
              <AdminPanel
                portfolioItems={portfolioItems}
                siteSettings={siteSettings}
                inquiries={inquiries}
                onUpdatePortfolio={handleUpdatePortfolio}
                onUpdateSettings={handleUpdateSettings}
                onUpdateInquiries={handleUpdateInquiries}
              />
            </React.Suspense>
          </section>
        )}

      </main>

      {/* 4. Elegant Project Showcase Detail Popups */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => {
          setSelectedProject(null);
          setIsModalOpen(false);
        }}
      />

      {/* 5. Minimalist Footer */}
      <Footer 
        settings={siteSettings} 
        setActiveTab={setActiveTab} 
      />

    </div>
  );
}
