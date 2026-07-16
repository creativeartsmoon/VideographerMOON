/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, Calendar, User, Briefcase, Cpu, ArrowLeftRight } from 'lucide-react';
import { PortfolioItem } from '../types';
import { VideoPlayer } from './VideoPlayer';

interface ProjectModalProps {
  project: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose }) => {
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10" id="project-modal-root">
      
      {/* Dark Ambient Backdrop Filter */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" 
        id="modal-backdrop"
      />

      {/* Modal Main Content Container */}
      <div className="relative w-full max-w-5xl bg-neutral-950 rounded-xl border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh] sm:max-h-[85vh] flex flex-col z-10 animate-fade-in" id="modal-container">
        
        {/* Floating close button (Top Right) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-neutral-900 text-neutral-400 hover:text-white border border-white/5 hover:border-accent-purple/30 transition-all focus:outline-none"
          aria-label="Close modal"
          id="modal-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cinematic Media Section */}
        <div className="w-full bg-black" id="modal-player-wrapper">
          <VideoPlayer
            url={project.videoUrl}
            thumbnailUrl={project.thumbnailUrl}
            autoplay={true}
            muted={false}
          />
        </div>

        {/* Detailed Metadata Section */}
        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8" id="modal-info-panel">
          
          {/* Header titles */}
          <div className="space-y-2 border-b border-white/5 pb-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-accent-purple tracking-widest uppercase">
              <span>{project.category}</span>
              <span className="text-neutral-700">&bull;</span>
              <span>{project.year}</span>
            </div>
            
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white uppercase tracking-wide">
              {project.title}
            </h2>
          </div>

          {/* Double Column Info structure */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Project Narrative description */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Project Narrative</h4>
              <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
                {project.description || 'No detailed description specified for this videography project.'}
              </p>
            </div>

            {/* Right: Technical & Production Details specs */}
            <div className="space-y-5 bg-neutral-900/40 p-5 rounded-lg border border-white/5">
              <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 border-b border-white/5 pb-2">Production Specs</h4>
              
              <div className="space-y-3.5 text-xs">
                
                {/* Client item */}
                <div className="flex items-start gap-2.5">
                  <Briefcase className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-neutral-500 uppercase tracking-wider text-[10px] font-mono">Client</span>
                    <span className="text-neutral-200 font-medium">{project.client || 'Independent / Spec'}</span>
                  </div>
                </div>

                {/* Role item */}
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-neutral-500 uppercase tracking-wider text-[10px] font-mono">My Role</span>
                    <span className="text-neutral-200 font-medium">{project.role || 'Solo Director-Editor'}</span>
                  </div>
                </div>

                {/* Gear Used list */}
                {project.gearUsed && (
                  <div className="flex items-start gap-2.5">
                    <Cpu className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-neutral-500 uppercase tracking-wider text-[10px] font-mono mb-1">Aesthetic Toolset</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {project.gearUsed.split(',').map((tool, index) => (
                          <span 
                            key={index} 
                            className="inline-block px-2 py-0.5 rounded bg-neutral-900 border border-white/10 text-[10px] text-neutral-300 font-light whitespace-nowrap"
                          >
                            {tool.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
