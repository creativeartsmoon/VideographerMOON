/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, CheckCircle2, Mail, Phone, MapPin, Globe, Sparkles } from 'lucide-react';
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

  const [agreed, setAgreed] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setSuccessMessage('');

    if (!formData.name || !formData.email || !formData.message) {
      setValidationError('Please fill out all required fields.');
      return;
    }

    if (!agreed) {
      setValidationError('This field is required.');
      return;
    }

    setValidationError('');
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
        setSuccessMessage('Your message has been sent successfully.');
        setValidationError('');
        setFormData({
          name: '',
          email: '',
          projectType: 'Brand & Promotional',
          message: '',
        });
        setAgreed(false);
      } else {
        setValidationError('There was a problem submitting your inquiry. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error submitting form:', error);
      setValidationError('An error occurred while sending your message. Please try again.');
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-stretch" id="contact-form-grid">
      
      {/* Left: Contact Info Column (Width 1) */}
      <div className="lg:col-span-1 flex flex-col justify-start space-y-4 h-full py-1" id="contact-info-col">
        <div>
          <p className="text-neutral-400 font-light text-xs leading-relaxed">
            From initial planning to final delivery, I work closely with clients to create films that reflect their vision and engage their audience. If you have a project in mind, I'd be pleased to hear more about it.
          </p>
          
          <div className="w-full h-[1px] bg-neutral-400/20 mt-3 mb-4" />
        </div>

        <div className="space-y-4.5 text-xs font-light text-neutral-400">
          
          {/* Email Item */}
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple shrink-0 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest leading-none mb-1">Email</span>
              <a href={`mailto:${settings.contactEmail || 'creativearts.moon@gmail.com'}`} className="text-white hover:text-accent-purple transition-colors font-light text-sm sm:text-base">
                {settings.contactEmail || 'creativearts.moon@gmail.com'}
              </a>
            </div>
          </div>

          {/* Direct Line / Call Item */}
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple shrink-0 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest leading-none mb-1">Call</span>
              <a href={`tel:${settings.contactPhone || '+82 10-1234-5678'}`} className="text-white hover:text-accent-purple transition-colors font-light text-sm sm:text-base">
                {settings.contactPhone || '+82 10-1234-5678'}
              </a>
            </div>
          </div>

          {/* Based in Item */}
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest leading-none mb-1">Based in</span>
              <p className="text-white font-light text-sm sm:text-base">Köln, Germany</p>
            </div>
          </div>

          {/* Available Across Item */}
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple shrink-0 mt-0.5">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest leading-none mb-1">Available Across</span>
              <p className="text-white font-light text-sm sm:text-base">Europe &amp; worldwide</p>
            </div>
          </div>

        </div>
      </div>

      {/* Right: Contact Form Column (Width 2) */}
      <div className="lg:col-span-2 h-full flex flex-col justify-between py-1" id="contact-form-panel">
        
        {/* Main Interactive Input Form */}
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
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Briefly describe the concept, timeline, location, and key requirements for your project..."
              className="w-full px-3 py-2.5 rounded bg-neutral-900/60 border border-white/5 focus:border-accent-purple text-white text-xs transition-colors focus:outline-none placeholder:text-neutral-600 leading-relaxed font-light resize-none"
            />
          </div>

          {/* Privacy Consent Checkbox & Status Message */}
          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-400 font-light select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (e.target.checked) {
                    setValidationError('');
                  }
                }}
                className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-accent-purple focus:ring-accent-purple/50 accent-purple cursor-pointer"
              />
              <span>
                By using this form you agree with the storage and handling of your data by this website. <span className="text-accent-purple">*</span>
              </span>
            </label>

            {/* Validation / Success Messages */}
            {validationError && (
              <p className="text-red-500 text-xs font-mono font-medium pt-0.5 animate-fade-in">
                {validationError}
              </p>
            )}
            {successMessage && (
              <p className="text-emerald-400 text-xs font-mono font-medium pt-0.5 animate-fade-in">
                {successMessage}
              </p>
            )}
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

      </div>

    </div>
  );
};
