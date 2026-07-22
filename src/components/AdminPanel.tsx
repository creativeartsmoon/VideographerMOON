/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Lock, KeyRound, LayoutGrid, Settings, Inbox, Database, Plus, Trash2, 
  Edit3, Check, Save, Download, Upload, Eye, EyeOff, Film, Sparkles, CheckSquare, Square, Camera
} from 'lucide-react';
import { PortfolioItem, SiteSettings, ContactInquiry } from '../types';
import { sha256 } from '../utils/security';

interface AdminPanelProps {
  portfolioItems: PortfolioItem[];
  siteSettings: SiteSettings;
  inquiries: ContactInquiry[];
  onUpdatePortfolio: (items: PortfolioItem[]) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onUpdateInquiries: (inquiries: ContactInquiry[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  portfolioItems,
  siteSettings,
  inquiries,
  onUpdatePortfolio,
  onUpdateSettings,
  onUpdateInquiries,
}) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  // Security Hardening State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Active Admin View Tab
  const [activeTab, setActiveTab] = useState<'works' | 'settings' | 'inquiries' | 'backup'>('works');

  // Drag and Drop state for Profile Photo
  const [isDragging, setIsDragging] = useState(false);

  // CRUD Editing State
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states for items
  const [itemForm, setItemForm] = useState<Partial<PortfolioItem>>({
    title: '',
    category: 'Brand Story (For Brands & Artists)',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    year: new Date().getFullYear().toString(),
    role: '',
    client: '',
    gearUsed: '',
    featured: false,
  });

  // Backup file state
  const [importedJson, setImportedJson] = useState('');
  const [importStatus, setImportStatus] = useState({ success: false, message: '' });

  // Handle lockout countdown timer
  useEffect(() => {
    if (!lockoutTime) return;
    
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutTime(null);
        setSecondsRemaining(0);
        setAuthError('');
      } else {
        setSecondsRemaining(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lockoutTime]);

  // Inactivity auto-lock mechanism (10 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    let timeoutId: any = null;
    
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsAuthenticated(false);
        setPasscode('');
        alert('Security Alert: Session automatically locked due to 10 minutes of inactivity.');
      }, 10 * 60 * 1000); // 10 minutes
    };
    
    // Set up activity listeners
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);
    
    resetTimer(); // Initialize timer
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isAuthenticated]);

  // Handle Passcode verification
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lockout verification check
    if (lockoutTime && Date.now() < lockoutTime) {
      const remainingSecs = Math.ceil((lockoutTime - Date.now()) / 1000);
      setAuthError(`Too many failed attempts. Console locked. Try again in ${remainingSecs}s.`);
      return;
    }

    const defaultPasscodeHash = '0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c';
    const correctPasscodeHash = siteSettings.adminPasscode || defaultPasscodeHash;
    const inputHash = sha256(passcode.trim());
    
    // CRITICAL BUG FIX: Only allow inputHash === correctPasscodeHash.
    // If the passcode has been changed, correctPasscodeHash is the new hash, and defaultPasscodeHash (1111) is no longer allowed!
    if (inputHash === correctPasscodeHash) {
      setIsAuthenticated(true);
      setAuthError('');
      setFailedAttempts(0);
    } else {
      const nextFailedCount = failedAttempts + 1;
      setFailedAttempts(nextFailedCount);
      if (nextFailedCount >= 5) {
        const lockUntil = Date.now() + 30000; // 30 seconds lockout
        setLockoutTime(lockUntil);
        setAuthError('Too many failed attempts. Console locked for 30 seconds.');
      } else {
        setAuthError(`Incorrect passcode. Access denied. (${5 - nextFailedCount} attempts remaining)`);
      }
    }
  };

  // Site Settings Form save
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({ ...siteSettings });
  const [newPasscodeInput, setNewPasscodeInput] = useState('');
  const [currentPasscodeConfirm, setCurrentPasscodeConfirm] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Password strength check utility
  const checkPasscodeStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    if (pass.length < 4) {
      return { score: 1, label: 'Too Short (Min 4 chars)', color: 'text-red-500' };
    }
    
    // Check for trivial repetitiveness or sequence
    const isRepeated = /^(\w)\1+$/.test(pass);
    const sequences = ['1234', '2345', '3456', '4567', '5678', '6789', '0123', 'abcd', 'qwer'];
    const isSequential = sequences.some(seq => seq.includes(pass.toLowerCase()) || pass.toLowerCase().includes(seq));
    
    if (isRepeated || isSequential) {
      return { score: 2, label: 'Insecure (Too simple/sequential)', color: 'text-orange-500 font-bold' };
    }
    
    if (pass.length < 6) {
      return { score: 3, label: 'Medium security', color: 'text-yellow-500' };
    }
    
    return { score: 4, label: 'Strong security', color: 'text-green-500' };
  };

  const passcodeStrength = checkPasscodeStrength(newPasscodeInput);

  useEffect(() => {
    setSettingsForm({ ...siteSettings });
  }, [siteSettings]);

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    const finalSettings = { ...settingsForm };
    
    if (newPasscodeInput.trim() !== '') {
      const pass = newPasscodeInput.trim();
      
      // 1. Current Passcode authorization check
      const currentHash = sha256(currentPasscodeConfirm.trim());
      const savedHash = siteSettings.adminPasscode || '0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c';
      
      if (currentHash !== savedHash) {
        setPasscodeError('Current passcode verification failed. Please enter your correct current passcode to authorize changes.');
        return;
      }
      
      // 2. Strength Validation Block
      const strength = checkPasscodeStrength(pass);
      if (strength.score <= 2) {
        setPasscodeError(`Cannot set insecure passcode: ${strength.label}. Please choose a secure sequence.`);
        return;
      }
      
      finalSettings.adminPasscode = sha256(pass);
      setSettingsForm(prev => ({ ...prev, adminPasscode: finalSettings.adminPasscode }));
      setNewPasscodeInput('');
      setCurrentPasscodeConfirm('');
    }
    
    onUpdateSettings(finalSettings);
    alert('Site-wide settings updated successfully!');
  };

  // Image upload and Drag/Drop handlers for profile portrait
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB for storage efficiency.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSettingsForm(prev => ({ ...prev, profileImage: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB for storage efficiency.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSettingsForm(prev => ({ ...prev, profileImage: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // CRUD: Trigger adding new item
  const startAddNew = () => {
    setItemForm({
      title: '',
      category: 'Brand & Promotional',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      year: new Date().getFullYear().toString(),
      role: 'Director of Photography',
      client: '',
      gearUsed: '',
      featured: false,
    });
    setIsAddingNew(true);
    setEditingItem(null);
  };

  // CRUD: Trigger edit existing item
  const startEdit = (item: PortfolioItem) => {
    setItemForm({ ...item });
    setEditingItem(item);
    setIsAddingNew(false);
  };

  // CRUD: Save item (create or update)
  const saveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title || !itemForm.videoUrl) {
      alert('Title and Video URL are required.');
      return;
    }

    let updatedList: PortfolioItem[] = [];

    if (isAddingNew) {
      const newItem: PortfolioItem = {
        id: 'work-' + Date.now(),
        title: itemForm.title || 'Untitled Video',
        category: itemForm.category || 'Commercial',
        description: itemForm.description || '',
        videoUrl: itemForm.videoUrl || '',
        thumbnailUrl: itemForm.thumbnailUrl || '',
        year: itemForm.year || new Date().getFullYear().toString(),
        role: itemForm.role || 'Videographer',
        client: itemForm.client || 'Independent',
        gearUsed: itemForm.gearUsed || '',
        featured: !!itemForm.featured,
      };
      updatedList = [newItem, ...portfolioItems];
    } else if (editingItem) {
      updatedList = portfolioItems.map((item) =>
        item.id === editingItem.id ? { ...item, ...itemForm } as PortfolioItem : item
      );
    }

    onUpdatePortfolio(updatedList);
    setIsAddingNew(false);
    setEditingItem(null);
    alert('Portfolio project saved successfully!');
  };

  // CRUD: Delete project item
  const deleteItem = (id: string) => {
    if (confirm('Are you absolutely sure you want to delete this portfolio project? This cannot be undone.')) {
      const updatedList = portfolioItems.filter((item) => item.id !== id);
      onUpdatePortfolio(updatedList);
    }
  };

  // Inquiries Actions
  const toggleInquiryStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'new' ? 'read' : currentStatus === 'read' ? 'replied' : 'archived';
    const updated = inquiries.map((inq) =>
      inq.id === id ? { ...inq, status: nextStatus as any } : inq
    );
    onUpdateInquiries(updated);
  };

  const deleteInquiry = (id: string) => {
    if (confirm('Delete this inquiry message log?')) {
      const updated = inquiries.filter((inq) => inq.id !== id);
      onUpdateInquiries(updated);
    }
  };

  // System Configuration backup export
  const handleExportConfig = () => {
    const fullBackup = {
      siteSettings,
      portfolioItems,
      inquiries
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `videomoon_schema_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // System Configuration backup import
  const handleImportConfig = () => {
    try {
      const parsed = JSON.parse(importedJson);
      if (parsed.siteSettings && parsed.portfolioItems) {
        onUpdateSettings(parsed.siteSettings);
        onUpdatePortfolio(parsed.portfolioItems);
        if (parsed.inquiries) {
          onUpdateInquiries(parsed.inquiries);
        }
        setImportStatus({ success: true, message: 'Schema Backup synced & reloaded successfully! Refreshing pages.' });
        setImportedJson('');
        // Sync setting form
        setSettingsForm({ ...parsed.siteSettings });
      } else {
        setImportStatus({ success: false, message: 'Invalid format: siteSettings and portfolioItems must be defined.' });
      }
    } catch (e) {
      setImportStatus({ success: false, message: 'Parsing failed. Please verify raw JSON syntax.' });
    }
  };

  // Access check protection wall
  if (!isAuthenticated) {
    return (
      <section className="min-h-[75vh] flex items-center justify-center py-20 px-4" id="admin-login-screen">
        <div className="w-full max-w-md bg-neutral-950 p-8 rounded-xl border border-white/10 glass-card shadow-2xl relative">
          
          {/* Subtle logo inside portal lock */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black border border-accent-purple flex items-center justify-center text-accent-purple shadow-[0_0_20px_rgba(138,43,226,0.4)]">
            <Lock className="w-5 h-5" />
          </div>

          <div className="text-center pt-4 space-y-2 mb-6">
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white uppercase tracking-wider">Moon Operations</h3>
            <p className="text-xs text-neutral-500 font-mono">AUTHORIZED PERSONNEL ONLY &bull; SECURE ENGINE</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Entry Passcode</label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full pl-4 pr-11 py-3 rounded-lg bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm transition-colors focus:outline-none placeholder:text-neutral-700 font-mono tracking-wider"
                  id="admin-passcode-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-white transition-colors"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && (
                <p className="text-xs text-red-500 font-mono animate-pulse mt-1" id="login-error-msg">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              id="admin-login-submit"
            >
              <KeyRound className="w-4 h-4" />
              Unlock Console
            </button>
          </form>

        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="admin-dashboard-container">
      
      {/* Top dashboard header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
        <div>
          <span className="text-xs font-mono text-accent-purple uppercase tracking-widest">Operator Portal</span>
          <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">System Controls</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-mono text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" /> Connection secure
          </span>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs font-mono text-neutral-500 hover:text-white transition-colors"
          >
            Lock System
          </button>
        </div>
      </div>

      {/* Main Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Navigation Links */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => { setActiveTab('works'); setIsAddingNew(false); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-left text-sm font-medium transition-all ${
              activeTab === 'works'
                ? 'bg-accent-purple/10 border-l-2 border-accent-purple text-white'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-accent-purple" />
            <span>Manage Portfolio</span>
            <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-neutral-400">{portfolioItems.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-left text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-accent-purple/10 border-l-2 border-accent-purple text-white'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4 text-accent-purple" />
            <span>Site Customizer</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-left text-sm font-medium transition-all ${
              activeTab === 'inquiries'
                ? 'bg-accent-purple/10 border-l-2 border-accent-purple text-white'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Inbox className="w-4 h-4 text-accent-purple" />
            <span>Client Inquiries</span>
            {inquiries.filter((inq) => inq.status === 'new').length > 0 && (
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-purple/20 text-accent-purple font-semibold animate-pulse">
                {inquiries.filter((inq) => inq.status === 'new').length} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-left text-sm font-medium transition-all ${
              activeTab === 'backup'
                ? 'bg-accent-purple/10 border-l-2 border-accent-purple text-white'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4 text-accent-purple" />
            <span>Schema Backup</span>
          </button>
        </div>

        {/* Right Side: Tab Panes */}
        <div className="lg:col-span-3 min-h-[50vh] bg-neutral-950 p-6 sm:p-8 rounded-xl border border-white/5 glass-card">
          
          {/* TAB 1: MANAGE PORTFOLIO CRUD */}
          {activeTab === 'works' && (
            <div className="space-y-6" id="panel-portfolio-crud">
              
              {!isAddingNew && !editingItem ? (
                <>
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">Works Database</h3>
                    <button
                      onClick={startAddNew}
                      className="px-4 py-2 rounded-lg bg-accent-purple hover:bg-opacity-90 text-white font-medium text-xs font-mono uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Project
                    </button>
                  </div>

                  <div className="divide-y divide-white/5">
                    {portfolioItems.map((item) => (
                      <div key={item.id} className="py-4 flex items-center justify-between gap-4 group">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-16 h-10 object-cover rounded bg-neutral-900 shrink-0 border border-white/5"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wide group-hover:text-accent-purple transition-colors">{item.title}</h4>
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-[10px] font-mono text-neutral-500">
                              <span>{item.category}</span>
                              <span>&bull;</span>
                              <span>{item.year}</span>
                              <span>&bull;</span>
                              <span className={item.featured ? 'text-accent-purple font-semibold' : 'text-neutral-600'}>
                                {item.featured ? 'Featured' : 'Standard'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 rounded bg-neutral-900 border border-white/5 hover:border-accent-purple/40 text-neutral-400 hover:text-white transition-all"
                            title="Edit project"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-2 rounded bg-neutral-900 border border-white/5 hover:border-red-500/40 text-neutral-400 hover:text-red-400 transition-all"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Edit/Add Form Screen */
                <form onSubmit={saveItem} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
                      {isAddingNew ? 'Create New Video' : `Edit: ${editingItem?.title}`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => { setIsAddingNew(false); setEditingItem(null); }}
                      className="text-xs font-mono text-neutral-500 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Project Title *</label>
                      <input
                        type="text"
                        required
                        value={itemForm.title}
                        onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                        placeholder="e.g. Neon Dreams"
                        className="w-full px-4.5 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Video Category</label>
                      <select
                        value={itemForm.category}
                        onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                        className="w-full px-4.5 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none"
                      >
                        <option value="Brand & Promotional">Brand &amp; Promotional</option>
                        <option value="Events">Events</option>
                        <option value="Cultural Projects">Cultural Projects</option>
                        <option value="Documentary & Interviews">Documentary &amp; Interviews</option>
                        <option value="Other Creative Project">Other Creative Project</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Video URL */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Video Embed or File URL *</label>
                      <input
                        type="url"
                        required
                        value={itemForm.videoUrl}
                        onChange={(e) => setItemForm({ ...itemForm, videoUrl: e.target.value })}
                        placeholder="Vimeo, YouTube, or MP4 URL link"
                        className="w-full px-4.5 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none font-mono"
                      />
                    </div>

                    {/* Thumbnail Image Direct Upload & URL Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Thumbnail Image</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={itemForm.thumbnailUrl}
                          onChange={(e) => setItemForm({ ...itemForm, thumbnailUrl: e.target.value })}
                          placeholder="Image URL or upload a file..."
                          className="flex-1 px-4.5 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none font-mono text-xs"
                        />
                        <label className="cursor-pointer px-4 py-2.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs font-mono text-neutral-300 flex items-center gap-1.5 shrink-0 transition-colors">
                          <Camera className="w-3.5 h-3.5 text-accent-purple" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 2 * 1024 * 1024) {
                                  alert('Image size should be less than 2MB for storage efficiency.');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === 'string') {
                                    setItemForm(prev => ({ ...prev, thumbnailUrl: reader.result as string }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      {itemForm.thumbnailUrl && (
                        <div className="mt-2 relative inline-block group/preview">
                          <img
                            src={itemForm.thumbnailUrl}
                            alt="Thumbnail Preview"
                            className="w-28 h-16 object-cover rounded border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setItemForm(prev => ({ ...prev, thumbnailUrl: '' }))}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] shadow-md cursor-pointer"
                            title="Remove image"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Year */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Year of Shoot</label>
                      <input
                        type="text"
                        value={itemForm.year}
                        onChange={(e) => setItemForm({ ...itemForm, year: e.target.value })}
                        placeholder="2026"
                        className="w-full px-4.5 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none"
                      />
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">My Role</label>
                      <input
                        type="text"
                        value={itemForm.role}
                        onChange={(e) => setItemForm({ ...itemForm, role: e.target.value })}
                        placeholder="e.g. Director"
                        className="w-full px-4.5 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none"
                      />
                    </div>

                    {/* Client */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Brand Client</label>
                      <input
                        type="text"
                        value={itemForm.client}
                        onChange={(e) => setItemForm({ ...itemForm, client: e.target.value })}
                        placeholder="e.g. Vogue Korea"
                        className="w-full px-4.5 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Toolset/Gear list */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Toolset / Gear Used (comma-separated)</label>
                    <input
                      type="text"
                      value={itemForm.gearUsed}
                      onChange={(e) => setItemForm({ ...itemForm, gearUsed: e.target.value })}
                      placeholder="Sony FX3, Sirui Anamorphic, DJI Mavic Drone"
                      className="w-full px-4.5 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Narrative Description</label>
                    <textarea
                      rows={3}
                      value={itemForm.description}
                      onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                      placeholder="Describe the shooting settings and stylistic decisions..."
                      className="w-full px-4.5 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Featured flag checkbox */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setItemForm({ ...itemForm, featured: !itemForm.featured })}
                      className="flex items-center justify-center p-1 rounded hover:bg-white/5 text-accent-purple focus:outline-none"
                    >
                      {itemForm.featured ? (
                        <CheckSquare className="w-5 h-5 text-accent-purple fill-accent-purple/20" />
                      ) : (
                        <Square className="w-5 h-5 text-neutral-600" />
                      )}
                    </button>
                    <div>
                      <span className="block text-xs font-semibold text-white font-mono uppercase tracking-wider">Highlight as Featured Work</span>
                      <span className="block text-[10px] text-neutral-500">Displays this project directly on the home page marquee carousel.</span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-4 flex items-center justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => { setIsAddingNew(false); setEditingItem(null); }}
                      className="px-5 py-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 text-xs font-mono uppercase tracking-widest transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg bg-white text-black font-semibold text-xs font-mono uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" /> Save Project
                    </button>
                  </div>

                </form>
              )}

            </div>
          )}

          {/* TAB 2: SITE SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSettingsSave} className="space-y-6" id="panel-site-settings">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">Site Customizer</h3>
                <p className="text-xs text-neutral-500">Edit core branding information, accent colors, passwords, and SEO metas.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Site Title */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Site Logo Title</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.siteTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, siteTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none font-display font-semibold"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Sub-Label Title</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.siteSubtitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, siteSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Site Hero Tagline</label>
                <input
                  type="text"
                  required
                  value={settingsForm.siteTagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteTagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none font-light"
                />
              </div>

              {/* Dynamic Design elements: Accent Color Hex & Hero Video */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Accent Color Picker */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Brand Accent Color (Hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settingsForm.accentColor}
                      onChange={(e) => setSettingsForm({ ...settingsForm, accentColor: e.target.value })}
                      className="w-12 h-10 rounded border border-white/10 bg-neutral-900 cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={settingsForm.accentColor}
                      onChange={(e) => setSettingsForm({ ...settingsForm, accentColor: e.target.value })}
                      placeholder="#8A2BE2"
                      className="w-full px-4 py-2 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Hero Background Video */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Hero Video stream URL</label>
                  <input
                    type="url"
                    value={settingsForm.heroVideoUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroVideoUrl: e.target.value })}
                    placeholder="Provide MP4 or vimeo background link"
                    className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Biographic Bio */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Biographic Bio copy</label>
                <textarea
                  rows={4}
                  required
                  value={settingsForm.bio}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none resize-none leading-relaxed font-light"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl border border-white/5 bg-neutral-900/20">
                {/* Profile Portrait Direct File Upload & URL */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Profile Portrait Photo</label>
                  
                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group ${
                      isDragging 
                        ? 'border-accent-purple bg-accent-purple/5' 
                        : 'border-white/10 hover:border-accent-purple/30 bg-neutral-950/40'
                    }`}
                    onClick={() => document.getElementById('about-photo-upload')?.click()}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      id="about-photo-upload"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <Upload className="w-6 h-6 text-neutral-500 mb-2 group-hover:text-accent-purple transition-colors" />
                    <p className="text-xs text-neutral-300 font-light">
                      Drag &amp; drop profile picture here, or <span className="text-accent-purple font-medium">browse</span>
                    </p>
                    <p className="text-[10px] text-neutral-500 font-mono mt-1">Supports JPG, PNG (Max 2MB)</p>
                  </div>

                  {/* Fallback URL input */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] text-neutral-500 font-mono uppercase tracking-wider text-center">&mdash; OR ENTER IMAGE URL &mdash;</span>
                    <input
                      type="url"
                      value={settingsForm.profileImage}
                      onChange={(e) => setSettingsForm({ ...settingsForm, profileImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-neutral-300 text-xs focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Portrait Preview and Info */}
                <div className="flex flex-col justify-between p-4 rounded-xl bg-neutral-950/40 border border-white/5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">Image Preview</span>
                    <div className="relative w-32 aspect-[4/5] rounded-lg overflow-hidden border border-white/10 bg-neutral-900 mx-auto sm:mx-0">
                      {settingsForm.profileImage ? (
                        <>
                          <img
                            src={settingsForm.profileImage}
                            alt="Preview"
                            className="w-full h-full object-cover filter saturate-[0.85]"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setSettingsForm(prev => ({ ...prev, profileImage: '' }))}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-red-500 text-white transition-colors"
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-1 p-2 text-center">
                          <Camera className="w-6 h-6" />
                          <span className="text-[9px] font-mono">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-white/5 sm:pt-0 sm:border-0">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Update Admin Passcode</label>
                      <input
                        type="password"
                        value={newPasscodeInput}
                        onChange={(e) => setNewPasscodeInput(e.target.value)}
                        placeholder="Type new passcode to update, or leave empty..."
                        className="w-full px-4 py-2 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-xs focus:outline-none font-mono"
                      />
                      
                      {newPasscodeInput.trim() !== '' && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-mono text-neutral-400">Complexity Strength:</span>
                            <span className={`font-mono ${passcodeStrength.color}`}>{passcodeStrength.label}</span>
                          </div>
                          <div className="h-1 w-full bg-neutral-950 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                passcodeStrength.score === 1 ? 'w-1/4 bg-red-500' :
                                passcodeStrength.score === 2 ? 'w-2/4 bg-orange-500' :
                                passcodeStrength.score === 3 ? 'w-3/4 bg-yellow-500' :
                                passcodeStrength.score === 4 ? 'w-full bg-green-500' : 'w-0'
                              }`} 
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {newPasscodeInput.trim() !== '' && (
                      <div className="space-y-1.5 border-t border-white/5 pt-3">
                        <label className="block text-[10px] font-mono text-red-400 uppercase tracking-widest">Confirm Current Passcode</label>
                        <input
                          type="password"
                          required
                          value={currentPasscodeConfirm}
                          onChange={(e) => setCurrentPasscodeConfirm(e.target.value)}
                          placeholder="Verify current passcode to authorize..."
                          className="w-full px-4 py-2 rounded bg-neutral-900 border border-red-500/20 focus:border-red-500 text-white text-xs focus:outline-none font-mono"
                        />
                        <p className="text-[9px] font-mono text-neutral-500">Required to authorize and commit credential changes.</p>
                      </div>
                    )}

                    {passcodeError && (
                      <p className="text-[10px] font-mono text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">
                        {passcodeError}
                      </p>
                    )}

                    <p className="text-[9px] font-mono text-neutral-500">Current passcode is stored securely as a cryptographic SHA-256 hash.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Inquiry Email</label>
                  <input
                    type="email"
                    value={settingsForm.contactEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Booking Hotline</label>
                  <input
                    type="text"
                    value={settingsForm.contactPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none"
                  />
                </div>

                {/* Instagram */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Instagram Link</label>
                  <input
                    type="text"
                    value={settingsForm.instagramUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Explore Dance URL */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-accent-purple uppercase tracking-widest font-semibold">Explore Dance Button Link URL</label>
                <input
                  type="url"
                  value={settingsForm.exploreDanceUrl || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, exploreDanceUrl: e.target.value })}
                  placeholder="https://instagram.com"
                  className="w-full px-4.5 py-2.5 rounded bg-neutral-900 border border-accent-purple/30 focus:border-accent-purple text-white text-sm focus:outline-none font-mono"
                />
                <p className="text-[10px] font-mono text-neutral-500">Destination link for the Explore Dance → button in header navigation.</p>
              </div>

              {/* SEO Tags */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">SEO Meta Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={settingsForm.seoKeywords}
                  onChange={(e) => setSettingsForm({ ...settingsForm, seoKeywords: e.target.value })}
                  placeholder="videography, cinema, seoul portfolio"
                  className="w-full px-4.5 py-2.5 rounded bg-neutral-900 border border-white/5 focus:border-accent-purple text-white text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs font-mono uppercase tracking-widest transition-all"
                  id="settings-save-btn"
                >
                  Save Schema Configurations
                </button>
              </div>

            </form>
          )}

          {/* TAB 3: CLIENT INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6" id="panel-inquiries-inbox">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">Inquiries Mailbox</h3>
                <p className="text-xs text-neutral-500">Live incoming bookings, budget profiles, and direct transmission inquiries.</p>
              </div>

              {inquiries.length > 0 ? (
                <div className="space-y-4">
                  {inquiries.map((inq) => (
                    <div 
                      key={inq.id} 
                      className={`p-5 rounded-lg border transition-all ${
                        inq.status === 'new' 
                          ? 'bg-neutral-900/80 border-accent-purple/30' 
                          : 'bg-neutral-900/30 border-white/5'
                      }`}
                      id={`inquiry-log-${inq.id}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white uppercase text-sm tracking-wide">{inq.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase ${
                              inq.status === 'new'
                                ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/20'
                                : inq.status === 'read'
                                ? 'bg-neutral-800 text-neutral-400'
                                : 'bg-green-500/10 text-green-400'
                            }`}>
                              {inq.status}
                            </span>
                          </div>
                          <span className="block text-xs text-neutral-400 font-light mt-0.5">{inq.email}</span>
                        </div>

                        <div className="text-right">
                          <span className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{inq.projectType} &bull; {inq.budget}</span>
                          <span className="block text-[9px] text-neutral-600 font-mono mt-0.5">{new Date(inq.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light whitespace-pre-wrap">{inq.message}</p>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end gap-2 text-xs">
                        <button
                          onClick={() => toggleInquiryStatus(inq.id, inq.status)}
                          className="px-3 py-1.5 rounded bg-neutral-950 border border-white/5 hover:border-accent-purple/40 text-neutral-400 hover:text-white transition-all font-mono text-[10px] uppercase tracking-wider"
                        >
                          Mark: {inq.status === 'new' ? 'Read' : inq.status === 'read' ? 'Replied' : 'Archive'}
                        </button>
                        <button
                          onClick={() => deleteInquiry(inq.id)}
                          className="p-1.5 rounded hover:bg-neutral-900 text-neutral-600 hover:text-red-400 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-neutral-900/10 border border-white/5 rounded-lg">
                  <Inbox className="w-8 h-8 text-neutral-800 mx-auto mb-2" />
                  <p className="text-xs text-neutral-600 font-mono">No incoming booking inquiries yet.</p>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: BACKUP & PORTABILITY */}
          {activeTab === 'backup' && (
            <div className="space-y-6" id="panel-backup-portability">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">Site Portability & Backups</h3>
                <p className="text-xs text-neutral-500">Download your customized layout, database, and settings schema as a portable JSON backup file, or upload one to restore instantly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Export Card */}
                <div className="p-6 rounded-lg bg-neutral-900/40 border border-white/5 space-y-4">
                  <div className="w-10 h-10 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Export Site Data Schema</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed mt-1 font-light">
                      Downloads site settings, portfolio CRUD posts, and inquiries logs into a self-contained portable schema JSON. Securely save this to disk.
                    </p>
                  </div>
                  <button
                    onClick={handleExportConfig}
                    className="w-full py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                    id="backup-export-btn"
                  >
                    <Download className="w-4 h-4" /> Export Config JSON
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-6 rounded-lg bg-neutral-900/40 border border-white/5 space-y-4">
                  <div className="w-10 h-10 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Import Site Data Schema</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed mt-1 font-light">
                      Restore your site from a previous JSON configuration backup. Paste the raw JSON text content in the input field below to sync and re-initialize instantly.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={importedJson}
                      onChange={(e) => setImportedJson(e.target.value)}
                      placeholder="Paste JSON config code here..."
                      className="w-full p-2.5 rounded bg-black border border-white/10 text-xs text-neutral-400 focus:border-accent-purple focus:outline-none font-mono resize-none leading-normal"
                    />
                    
                    {importStatus.message && (
                      <p className={`text-[10px] font-mono leading-normal ${importStatus.success ? 'text-green-400' : 'text-red-400'}`}>
                        {importStatus.message}
                      </p>
                    )}

                    <button
                      onClick={handleImportConfig}
                      disabled={!importedJson}
                      className="w-full py-2.5 rounded-lg bg-accent-purple hover:bg-opacity-90 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-white font-semibold text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      id="backup-import-btn"
                    >
                      <Upload className="w-4 h-4" /> Sync Schema Configuration
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </section>
  );
};
