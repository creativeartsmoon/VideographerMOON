/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Play, Film, Calendar, Eye, Layers, BookOpen, Rocket, Compass, Mic, Briefcase, Music, Video } from 'lucide-react';
import { PortfolioItem } from '../types';

interface FeaturedGridProps {
  items: PortfolioItem[];
  onProjectSelect: (item: PortfolioItem) => void;
  featuredOnly?: boolean;
}

export const FeaturedGrid: React.FC<FeaturedGridProps> = ({ items, onProjectSelect, featuredOnly = false }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Dynamically extract unique categories from loaded portfolio items database
  const categories = useMemo(() => {
    const list = items.map(item => item.category);
    // filter duplicates and clean
    const unique = Array.from(new Set(list)).filter(Boolean);
    return ['All', ...unique];
  }, [items]);

  // Filter items according to active selection
  const filteredItems = useMemo(() => {
    let result = items;
    if (featuredOnly) {
      result = result.filter(item => item.featured);
    }
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }
    return result;
  }, [items, selectedCategory, featuredOnly]);

  // Helper to map category name to a clean icon
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat === 'all') return <Layers className="w-3.5 h-3.5 text-neutral-400" />;
    if (cat.includes('brand')) return <BookOpen className="w-3.5 h-3.5 text-accent-purple" />;
    if (cat.includes('startup') || cat.includes('content')) return <Rocket className="w-3.5 h-3.5 text-accent-purple" />;
    if (cat.includes('culture') || cat.includes('film')) return <Compass className="w-3.5 h-3.5 text-accent-purple" />;
    if (cat.includes('interview') || cat.includes('documentary')) return <Mic className="w-3.5 h-3.5 text-accent-purple" />;
    if (cat.includes('commercial')) return <Briefcase className="w-3.5 h-3.5 text-accent-purple" />;
    if (cat.includes('music')) return <Music className="w-3.5 h-3.5 text-accent-purple" />;
    if (cat.includes('narrative') || cat.includes('video') || cat.includes('travel') || cat.includes('fashion')) return <Video className="w-3.5 h-3.5 text-accent-purple" />;
    return <Film className="w-3.5 h-3.5 text-accent-purple" />;
  };

  return (
    <div className="space-y-10" id="featured-grid-container">
      
      {/* Category Filter Navigation Bar */}
      {!featuredOnly && categories.length > 1 && (
        <div className="w-full overflow-x-auto scrollbar-none flex flex-nowrap items-center md:justify-center gap-2 md:gap-3 pb-3 px-4" id="portfolio-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono tracking-widest uppercase transition-all duration-300 focus:outline-none border whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-accent-purple/10 border-accent-purple text-white shadow-[0_0_15px_rgba(138,43,226,0.15)]'
                  : 'bg-transparent border-white/5 text-neutral-400 hover:border-white/10 hover:text-white'
              }`}
              id={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {getCategoryIcon(cat)}
              <span>{cat.replace(/\s*\(.*?\)/g, '')}</span>
            </button>
          ))}
        </div>
      )}

      {/* Grid of Video Projects */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" id="portfolio-grid">
          {filteredItems.map((project) => (
            <article
              key={project.id}
              onClick={() => onProjectSelect(project)}
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
                <div className="w-14 h-14 rounded-full bg-accent-purple text-white flex items-center justify-center shadow-lg shadow-accent-purple/50">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
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
                <h3 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide uppercase leading-tight group-hover:translate-x-1 transition-transform duration-300">
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
      ) : (
        <div className="text-center py-16 bg-neutral-950/40 rounded-xl border border-white/5 max-w-lg mx-auto p-8" id="empty-grid-state">
          <Layers className="w-10 h-10 mx-auto text-neutral-700 mb-3" />
          <p className="text-sm font-medium text-neutral-400">No projects found</p>
          <p className="text-xs text-neutral-600 mt-1">
            There are no active works matches for the &quot;{selectedCategory}&quot; category filter.
          </p>
        </div>
      )}

    </div>
  );
};
