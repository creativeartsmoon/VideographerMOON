/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, CheckCircle2, Mail, Phone, Sparkles } from 'lucide-react';
import { ContactInquiry, SiteSettings } from '../types';

interface ContactFormProps {
  settings: SiteSettings;
  onSubmit: (inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ settings, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Brand & Promotional',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const projectTypes = [
    'Brand & Promotional',
    'Events',
    'Cultural Projects',
    'Documentary & Interviews',
    'Other Creative Project',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);

    fetch('https://formspree.io/f/xvzepnoj', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        projectType: formData.projectType,
        message: formData.message,
      }),
    })
    .then(response => {
      if (response.ok) {
        onSubmit({
          name: formData.name,
          email: formData.email,
          projectType: formData.projectType,
          message: formData.message,
        });
        setIsSuccess(true);
        setFormData({
          name: '',
          email: '',
          projectType: 'Brand & Promotional',
          message: '',
        });
      } else {
        alert('There was a problem submitting your inquiry. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start" id="contact-form-grid">
      
      {/* Left: Contact Info Column */}
      <div className="lg:col-span-2 space-y-6" id="contact-info-col">
        <div className="space-y-4">
          <p className="text-neutral-400 font-light text-sm leading-relaxed max-w-sm">
            From initial planning to final delivery, I work closely with clients to create films that reflect their vision and engage their audience. If you have a project in mind, I'd be pleased to hear more about it.
          </p>
        </div>

        <div className="space-y-5 pt-8 border-t border-white/5 text-sm font-light text-neutral-400">
          
          {/* Email Item */}
          {settings.contactEmail && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-accent-purple shrink-0" />
              <div>
                <span className="block text-[9px] font-mono text-neutral-600 uppercase tracking-widest leading-none mb-1">Email</span>
                <a href={`mailto:${settings.contactEmail}`} className="text-white hover:text-accent-purple transition-colors font-light">
                  {settings.contactEmail}
                </a>
              </div>
            </div>
          )}

          {/* Phone Item */}
          {settings.contactPhone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-accent-purple shrink-0" />
              <div>
                <span className="block text-[9px] font-mono text-neutral-600 uppercase tracking-widest leading-none mb-1">Direct Line</span>
                <a href={`tel:${settings.contactPhone}`} className="text-white hover:text-accent-purple transition-colors font-light">
                  {settings.contactPhone}
                </a>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Right: Contact Form Column */}
      <div className="lg:col-span-3 p-0 relative overflow-hidden" id="contact-form-panel">
        
        {isSuccess ? (
          /* Success Screen */
          <div className="py-12 text-center space-y-6 animate-fade-in" id="contact-success-screen">
            <div className="w-16 h-16 rounded-full bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mx-auto text-accent-purple shadow-[0_0_30px_rgba(138,43,226,0.15)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-display font-bold text-lg text-white uppercase tracking-wider">Transmission Received</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed font-light">
                Your inquiry has been sent successfully. I will review your request and get back to you soon.
              </p>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setIsSuccess(false)}
                className="px-5 py-2 rounded-full border border-accent-purple/40 hover:border-accent-purple text-[10px] font-mono tracking-widest uppercase text-white hover:bg-accent-purple/10 transition-all focus:outline-none cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          </div>
        ) : (
          /* Main Interactive Input Form */
          <form onSubmit={handleSubmit} className="space-y-5" id="client-booking-form">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest">Your Name <span className="text-accent-purple">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full px-3 py-2.5 rounded bg-neutral-900/60 border border-white/5 focus:border-accent-purple text-white text-xs transition-colors focus:outline-none placeholder:text-neutral-600 font-light"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest">Email Address <span className="text-accent-purple">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2.5 rounded bg-neutral-900/60 border border-white/5 focus:border-accent-purple text-white text-xs transition-colors focus:outline-none placeholder:text-neutral-600 font-light"
                />
              </div>

            </div>

            {/* Project Category Selection (Full Width) */}
            <div className="space-y-1.5">
              <label htmlFor="projectType" className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest font-light">Project Category</label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded bg-neutral-900/60 border border-white/5 focus:border-accent-purple text-white text-xs transition-colors focus:outline-none font-light cursor-pointer"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type} className="bg-neutral-950 text-neutral-200">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Narrative text */}
            <div className="space-y-1.5">
              <label htmlFor="message" className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest">Project Scope &amp; Details <span className="text-accent-purple">*</span></label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Briefly describe the concept, timeline, location, and key requirements for your project..."
                className="w-full px-3 py-2.5 rounded bg-neutral-900/60 border border-white/5 focus:border-accent-purple text-white text-xs transition-colors focus:outline-none placeholder:text-neutral-600 leading-relaxed font-light resize-none"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              id="submit-booking-btn"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 fill-current" />
                  <span>Send Message</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>

    </div>
  );
};
