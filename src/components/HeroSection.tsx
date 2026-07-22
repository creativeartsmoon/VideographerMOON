/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Play, ArrowDown, Film, Sparkles, Layers } from 'lucide-react';
import { SiteSettings } from '../types';
import darkWaveBg from '../assets/images/dark_wave_bg_1783872017132.jpg';
import { optimizeVideoUrl } from '../utils/media';

interface HeroSectionProps {
  settings: SiteSettings;
  onExploreClick: () => void;
  onBookClick: () => void;
  onScrollClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings, onExploreClick, onBookClick, onScrollClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleScrollClick = () => {
    if (onScrollClick) {
      onScrollClick();
      return;
    }
    const target = document.getElementById('home-services-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      onExploreClick();
    }
  };

  useEffect(() => {
    // Attempt auto-play with silent audio fallback if browser interrupts
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        console.log('Background video autoplay was restricted. Playing silent.');
      });
    }
  }, [settings.heroVideoUrl]);

  return (
    <section className="relative w-full min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-black py-20" id="hero-section">
      
      {/* Background Image/Video Layer */}
      {settings.heroVideoUrl ? (
        <div className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none">
          <video
            ref={videoRef}
            src={optimizeVideoUrl(settings.heroVideoUrl)}
            className="w-full h-full object-cover filter brightness-[0.38] contrast-[1.05] saturate-[0.8]"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            id="hero-bg-video"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none">
          <img
            src={darkWaveBg}
            alt="Cinematic Dark Abstract Wave Background"
            className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.05]"
            referrerPolicy="no-referrer"
            id="hero-bg-image"
          />
          {/* Soft elegant gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/75" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-purple/15 via-transparent to-transparent opacity-60" />
        </div>
      )}

      {/* Futuristic Grid Overlay overlaying background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />

      {/* Floating purple dust orb ornaments */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-accent-purple/8 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-purple/10 rounded-full blur-[160px] animate-pulse pointer-events-none" />

      {/* Content wrapper with generous typography and layouts */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        
        {/* Cinematic Display Header */}
        <h1 className="font-display font-extrabold tracking-tight text-white uppercase leading-none drop-shadow-2xl select-none flex flex-col items-center gap-1 sm:gap-2" id="hero-title">
          <span className="block text-xl sm:text-2xl md:text-3xl font-light text-neutral-400 tracking-[0.25em] uppercase">
            {settings.siteTitle ? settings.siteTitle.split(' ').slice(0, -1).join(' ').toUpperCase() : 'VIDEOGRAPHER'}
          </span>
          <span className="block text-5xl sm:text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-purple to-purple-400 glow-text-purple tracking-widest leading-none mt-1">
            {settings.siteTitle ? settings.siteTitle.split(' ').pop() : 'Moon'}
          </span>
        </h1>

        {/* Subtitle / Description text block */}
        <p className="mt-6 sm:mt-8 max-w-3xl text-base sm:text-xl text-neutral-300 font-light tracking-wide leading-relaxed whitespace-pre-line" id="hero-tagline">
          {settings.siteTagline || 'From vision to story. From story to impact.\nCrafting thoughtful visual stories for brands, artists, and cultural projects.'}
        </p>

        {/* Dynamic customized mini metadata */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs font-mono tracking-widest text-neutral-400 uppercase">
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-accent-purple" /> Concept & Planning</span>
            <span className="hidden sm:inline-block text-neutral-800">|</span>
            <span className="flex items-center gap-1.5"><Film className="w-3.5 h-3.5 text-accent-purple" /> Production & Filming</span>
            <span className="hidden sm:inline-block text-neutral-800">|</span>
            <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-accent-purple" /> Post-Production & Editing</span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            Full-Cycle Production • All-In-One Service
          </span>
        </div>

        {/* Interactive CTA buttons */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto" id="hero-actions">
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold text-sm uppercase tracking-widest transition-all duration-300 shadow-xl relative overflow-hidden group hover:bg-accent-purple hover:text-white hover:shadow-[0_0_30px_rgba(138,43,226,0.65)] hover:border-accent-purple border border-transparent active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            id="hero-explore-btn"
          >
            <span className="relative z-10 font-bold tracking-widest">Works</span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent-purple via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          <button
            onClick={onBookClick}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white font-semibold text-sm uppercase tracking-widest border border-white/10 hover:border-accent-purple/60 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            id="hero-inquire-btn"
          >
            <Play className="w-3.5 h-3.5 text-accent-purple fill-current" />
            Get In Touch
          </button>
        </div>

      </div>

      {/* Sleek down pointer badge */}
      <div 
        className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-400 select-none pointer-events-none"
        id="hero-scroll-indicator"
      >
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase opacity-80">
          Scroll
        </span>
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-black/40 shadow-md">
          <ArrowDown className="w-3.5 h-3.5 text-accent-purple animate-bounce" />
        </div>
      </div>

    </section>
  );
};
