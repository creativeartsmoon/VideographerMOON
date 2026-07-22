/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Instagram, Youtube, Menu, X, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: SiteSettings;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, settings }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogoClick = () => {
    setActiveTab('home');
    setIsOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-white/5 transition-all duration-300" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo / Brand Name */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center text-left focus:outline-none group"
            id="logo-button"
          >
            <div className="flex flex-col select-none">
              <span className="text-[10px] sm:text-xs font-semibold text-neutral-400 block tracking-[0.2em] uppercase mb-0.5 group-hover:text-accent-purple transition-colors duration-300">
                videographer
              </span>
              <span className="font-bold text-sm sm:text-lg tracking-[0.45em] block leading-none uppercase text-white group-hover:text-accent-purple transition-colors duration-500">
                MOON
              </span>
            </div>
          </button>

          {/* Desktop Navigation & SNS Icons next to Contact */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" id="desktop-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative py-2 text-sm font-medium uppercase tracking-widest transition-all duration-300 focus:outline-none hover:text-white ${
                  activeTab === item.id 
                    ? 'text-white' 
                    : 'text-neutral-400'
                }`}
                id={`nav-${item.id}`}
              >
                {item.label}
                {activeTab === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-purple rounded-full glow-border-purple-strong" />
                )}
              </button>
            ))}

            {/* SNS Icons immediately beside Contact */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-5 text-neutral-400" id="desktop-socials">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-accent-purple transition-colors p-1"
                  aria-label="Instagram Profile"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-accent-purple transition-colors p-1"
                  aria-label="YouTube Channel"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </nav>

          {/* Explore Dance → Button on the right */}
          <div className="hidden md:flex items-center" id="header-explore-dance-btn">
            <a
              href={settings.exploreDanceUrl || 'https://instagram.com'}
              target="_blank"
              rel="noreferrer noopener"
              className="px-4 py-2 rounded-full bg-accent-purple/10 border border-accent-purple/40 hover:border-accent-purple text-xs font-mono uppercase tracking-wider text-white hover:bg-accent-purple/20 transition-all duration-300 flex items-center gap-2 group shadow-[0_0_15px_rgba(138,43,226,0.15)] cursor-pointer"
            >
              <span>Explore Dance</span>
              <ArrowRight className="w-3.5 h-3.5 text-accent-purple group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors focus:outline-none"
            aria-label="Toggle Menu"
            id="mobile-menu-btn"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden glass-card border-t border-white/5 animate-fade-in py-4 px-6 space-y-4" id="mobile-nav-container">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-center py-2.5 px-3 rounded-lg text-sm font-medium uppercase tracking-widest transition-all ${
                  activeTab === item.id 
                    ? 'bg-accent-purple/10 text-accent-purple border-b border-accent-purple' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Explore Dance button for mobile */}
          <div className="pt-2">
            <a
              href={settings.exploreDanceUrl || 'https://instagram.com'}
              target="_blank"
              rel="noreferrer noopener"
              className="w-full py-2.5 rounded-full bg-accent-purple/10 border border-accent-purple/40 hover:border-accent-purple text-xs font-mono uppercase tracking-wider text-white flex items-center justify-center gap-2 group shadow-[0_0_15px_rgba(138,43,226,0.15)]"
            >
              <span>Explore Dance</span>
              <ArrowRight className="w-3.5 h-3.5 text-accent-purple group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Social Icons mobile */}
          <div className="flex items-center justify-center gap-6 pt-3 border-t border-white/5">
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-accent-purple transition-colors p-1"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {settings.youtubeUrl && (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-accent-purple transition-colors p-1"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
