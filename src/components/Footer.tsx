/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, Instagram, Youtube, Video, ArrowUp, Mail, Phone } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, setActiveTab }) => {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black border-t border-white/5 pt-16 pb-8 text-neutral-400 overflow-hidden" id="app-footer">
      {/* Decorative subtle gradient radial flare */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px] bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-white/5">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-5" id="footer-brand-col">
            <button 
               onClick={() => { setActiveTab('home'); handleScrollToTop(); }}
              className="flex items-center text-left focus:outline-none group"
            >
              <div className="flex flex-col select-none">
                <span className="text-[10px] font-semibold text-neutral-400 block tracking-[0.2em] uppercase mb-0.5 group-hover:text-accent-purple transition-colors duration-300">
                  videographer
                </span>
                <span className="font-bold text-base tracking-[0.45em] block leading-none uppercase text-white group-hover:text-accent-purple transition-colors duration-500">
                  MOON
                </span>
              </div>
            </button>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed font-light whitespace-pre-line">
              {settings.siteTagline || 'From vision to story. From story to impact.\nCrafting thoughtful visual stories for brands, artists, and cultural projects.'}
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3 pt-1">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center hover:border-accent-purple hover:text-white hover:scale-105 hover:bg-neutral-800 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center hover:border-accent-purple hover:text-white hover:scale-105 hover:bg-neutral-800 transition-all duration-300"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-4 space-y-4 flex flex-col items-center text-center" id="footer-links-col">
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-[0.15em]">Navigation</h4>
            <ul className="space-y-2.5 text-sm font-light flex flex-col items-center">
              <li>
                <button 
                  onClick={() => { setActiveTab('home'); handleScrollToTop(); }} 
                  className="text-neutral-400 hover:text-white hover:scale-105 transition-all duration-300 py-0.5 text-center block"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('about'); handleScrollToTop(); }} 
                  className="text-neutral-400 hover:text-white hover:scale-105 transition-all duration-300 py-0.5 text-center block"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('portfolio'); handleScrollToTop(); }} 
                  className="text-neutral-400 hover:text-white hover:scale-105 transition-all duration-300 py-0.5 text-center block"
                >
                  Portfolio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('contact'); handleScrollToTop(); }} 
                  className="text-neutral-400 hover:text-white hover:scale-105 transition-all duration-300 py-0.5 text-center block"
                >
                  Contact
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('admin'); handleScrollToTop(); }} 
                  className="text-neutral-400 hover:text-white hover:scale-105 transition-all duration-300 py-0.5 text-center block"
                >
                  Admin
                </button>
              </li>
            </ul>
          </div>

          {/* Contacts Column */}
          <div className="md:col-span-4 space-y-4" id="footer-contact-col">
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-[0.15em]">Direct Inquiries</h4>
            <div className="space-y-3.5 text-sm font-light">
              {settings.contactEmail && (
                <a 
                  href={`mailto:${settings.contactEmail}`}
                  className="flex items-center gap-2.5 text-neutral-400 hover:text-white transition-colors duration-300"
                >
                  <Mail className="w-4 h-4 text-accent-purple" />
                  <span>{settings.contactEmail}</span>
                </a>
              )}
              {settings.contactPhone && (
                <a 
                  href={`tel:${settings.contactPhone}`}
                  className="flex items-center gap-2.5 text-neutral-400 hover:text-white transition-colors duration-300"
                >
                  <Phone className="w-4 h-4 text-accent-purple" />
                  <span>{settings.contactPhone}</span>
                </a>
              )}
              <div className="text-xs text-neutral-500 font-mono mt-3 leading-relaxed max-w-xs pt-1 border-t border-white/5">
                Welcoming all creative inquiries, collaborations, and global production opportunities.
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8" id="footer-bottom-bar">
          <p className="text-xs text-neutral-600 font-mono">
            &copy; {currentYear} {settings.siteTitle || 'Videographer Moon'}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('admin')} 
              className="text-xs text-neutral-600 hover:text-neutral-400 font-mono transition-colors"
            >
              System Operations
            </button>
            <button
              onClick={handleScrollToTop}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-accent-purple transition-all font-mono uppercase tracking-wider"
              aria-label="Scroll to top"
            >
              Top <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
