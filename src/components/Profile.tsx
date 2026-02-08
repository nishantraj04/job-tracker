import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  X, CheckCircle2, AlertCircle, Loader2, ShieldAlert, 
  Plus, Trash2, Camera, User, Layout, Shield,
  MapPin, Building2, GraduationCap, Award, Linkedin, 
  Github, Globe, Twitter, Mail, Link as LinkIcon, Copy,
  Instagram, Facebook, Youtube, Eye, EyeOff
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

interface ProfileProps {
  session: Session;
  onClose: () => void;
}

type TabType = 'public' | 'experience' | 'security';

export function Profile({ session, onClose }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>('public');
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const [hibLoading, setHibLoading] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    headline: '', 
    about: '',
    location: '',
    avatar_url: '',
    cover_url: '',
    status: 'active',
    experience: [] as any[],
    education: [] as any[],
    certifications: [] as any[],
    skills: [] as string[],
    interests: [] as string[],
    social_links: [] as any[]
  });

  useEffect(() => {
    getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          username: data.username || '',
          headline: data.header_text || data.headline || '',
          about: data.about || '',
          location: data.location || '',
          avatar_url: data.avatar_url || session.user.user_metadata.avatar_url || '',
          cover_url: data.cover_url || '',
          status: data.status || 'active',
          experience: Array.isArray(data.experience) ? data.experience : [],
          education: Array.isArray(data.education) ? data.education : [],
          certifications: Array.isArray(data.certifications) ? data.certifications : [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          interests: Array.isArray(data.interests) ? data.interests : [],
          social_links: Array.isArray(data.social_links) ? data.social_links : []
        });
      }
    } finally { setLoading(false); }
  };

  // --- HELPER: AUTO-DETECT SOCIAL ICON ---
  const getSocialIcon = (url: string) => {
    if (!url) return <Globe size={18} className="text-gray-400" />;
    let domain = '';
    try { domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } catch (e) { return <Globe size={18} className="text-gray-400" />; }
    const lower = domain.toLowerCase();

    if (lower.includes('linkedin')) return <Linkedin size={18} className="text-[#0077b5]" />;
    if (lower.includes('github')) return <Github size={18} className="text-gray-900 dark:text-white" />;
    if (lower.includes('twitter') || lower.includes('x.com')) return <Twitter size={18} className="text-[#1DA1F2]" />;
    if (lower.includes('instagram')) return <Instagram size={18} className="text-[#E1306C]" />;
    if (lower.includes('facebook')) return <Facebook size={18} className="text-[#1877F2]" />;
    if (lower.includes('youtube')) return <Youtube size={18} className="text-[#FF0000]" />;
    if (lower.includes('mailto')) return <Mail size={18} className="text-gray-500" />;

    return (
      <img 
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
        alt="logo" 
        className="w-5 h-5 rounded-full bg-white" 
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  };

  const detectPlatformName = (url: string) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return domain.replace('www.', '').split('.')[0]; 
    } catch (e) { return 'Website'; }
  };

  const handleUsernameChange = async (val: string) => {
    const cleanVal = val.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    setFormData({ ...formData, username: cleanVal });
    if (cleanVal.length < 3) return setIsAvailable(null);
    
    const { data } = await supabase.from('profiles').select('id').eq('username', cleanVal).single();
    if (data && data.id !== session.user.id) {
      setIsAvailable(false);
      const variations = [`${cleanVal}pro`, `${cleanVal}dev`, `iam${cleanVal}`, `${cleanVal}${Math.floor(Math.random()*99)}`];
      const avail = [];
      for (const v of variations) {
        const { data: d } = await supabase.from('profiles').select('id').eq('username', v).single();
        if (!d) avail.push(v);
      }
      setSuggestions(avail);
    } else { setIsAvailable(true); }
  };

  const copyFullUrl = () => {
    if (!formData.username) return;
    const url = `${window.location.origin}/p/${formData.username}`;
    navigator.clipboard.writeText(url);
    alert("Full profile URL copied!");
  };

  // --- SAFE UPDATE FUNCTION (FIXED) ---
  const updateProfile = async () => {
    if (isAvailable === false) return alert("Please select a unique username.");
    setLoading(true);

    // FIX: We explicitly map fields to avoid sending 'headline' which crashes the DB
    const updates = {
      id: session.user.id,
      full_name: formData.full_name,
      username: formData.username,
      header_text: formData.headline, // MAPPING HEADLINE TO HEADER_TEXT
      about: formData.about,
      location: formData.location,
      avatar_url: formData.avatar_url,
      cover_url: formData.cover_url,
      status: formData.status,
      experience: formData.experience,
      education: formData.education,
      certifications: formData.certifications,
      skills: formData.skills,
      interests: formData.interests,
      social_links: formData.social_links,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase.from('profiles').upsert(updates);
    
    if (error) {
      console.error("Save Error:", error);
      alert('Error saving profile: ' + error.message);
    } else {
      alert('Profile updated successfully!');
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${type}-${Date.now()}.${fileExt}`;
      await supabase.storage.from('profile-media').upload(filePath, file);
      const { data } = supabase.storage.from('profile-media').getPublicUrl(filePath);
      setFormData({ ...formData, [type === 'avatar' ? 'avatar_url' : 'cover_url']: data.publicUrl });
    } catch (err: any) { alert(err.message); } 
    finally { setLoading(false); }
  };

  // --- SECURITY: PASSWORD ---
  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) return alert("Password must be 6+ chars.");
    setPassLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      alert(error.message);
    } else {
      await supabase.functions.invoke('send-email', {
        body: { email: session.user.email, type: 'password_change' }
      });
      alert("Password updated! Security alert sent to your email.");
      setNewPassword('');
    }
    setPassLoading(false);
  };

  // --- SECURITY: HIBERNATE ---
  const toggleHibernate = async () => {
    const newStatus = formData.status === 'hibernated' ? 'active' : 'hibernated';
    const confirmMsg = newStatus === 'hibernated' 
      ? "Hide your profile from the public? You can reactivate by logging in." 
      : "Reactivate your public profile?";
    
    if (!window.confirm(confirmMsg)) return;

    setHibLoading(true);
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', session.user.id);
    
    if (!error) {
      if (newStatus === 'hibernated') {
        await supabase.functions.invoke('send-email', {
          body: { email: session.user.email, type: 'hibernate' }
        });
        await supabase.auth.signOut();
        window.location.reload();
      } else {
        setFormData({ ...formData, status: newStatus });
        alert("Welcome back! Your profile is visible again.");
      }
    } else {
      alert("Error: " + error.message);
    }
    setHibLoading(false);
  };

  // --- SECURITY: DELETE ---
  const deleteAccount = async () => {
    const txt = "DELETE";
    if (window.prompt(`This will wipe all data. Type "${txt}" to confirm.`) !== txt) return;
    
    setDelLoading(true);
    try {
      await supabase.functions.invoke('send-email', {
        body: { email: session.user.email, type: 'delete_account' }
      });

      const { error } = await supabase.functions.invoke('delete-user-permanently', { 
        body: { userId: session.user.id } 
      });
      
      if (error) throw error;

      await supabase.auth.signOut();
      window.location.reload();
    } catch (err: any) {
      alert("Deletion failed: " + err.message);
    } finally {
      setDelLoading(false);
    }
  };

  // --- LIST HELPERS ---
  const addItem = (field: 'experience' | 'education' | 'certifications' | 'social_links') => {
    let newItem: any;
    // Initializing with ALL fields to prevent "undefined" errors
    if (field === 'experience') newItem = { id: Date.now().toString(), title: '', company: '', start_date: '', end_date: '', current: false, description: '' };
    else if (field === 'education') newItem = { id: Date.now().toString(), school: '', degree: '', field: '', start_date: '', end_date: '', current: false };
    else if (field === 'certifications') newItem = { id: Date.now().toString(), name: '', org: '', issue_date: '', url: '' };
    else newItem = { id: Date.now().toString(), url: '', platform: '' };
    setFormData({ ...formData, [field]: [newItem, ...formData[field]] });
  };
  
  const removeItem = (field: string, idx: number) => {
    const list = (formData as any)[field];
    const newList = list.filter((_: any, i: number) => i !== idx);
    setFormData({ ...formData, [field]: newList });
  };

  const updateItem = (field: string, idx: number, key: string, value: any) => {
    const list = [...(formData as any)[field]];
    list[idx] = { ...list[idx], [key]: value };
    if (field === 'social_links' && key === 'url') {
      list[idx].platform = detectPlatformName(value);
    }
    setFormData({ ...formData, [field]: list });
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 font-sans text-gray-900 dark:text-gray-100">
      <div className="bg-white dark:bg-[#1b1f23] w-full max-w-6xl h-full sm:h-[90vh] flex flex-col sm:flex-row overflow-hidden sm:rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800">
        
        {/* LEFT NAV */}
        <aside className="w-full sm:w-64 bg-white dark:bg-[#1b1f23] border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold tracking-tight">Edit Profile</h2>
          </div>
          <nav className="flex sm:flex-col gap-1 p-2">
            {[
              { id: 'public', label: 'Public Profile', icon: User },
              { id: 'experience', label: 'Portfolio Data', icon: Layout },
              { id: 'security', label: 'Security', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-all ${
                  activeTab === tab.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-700 dark:border-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800 hidden sm:block">
            <button onClick={onClose} className="w-full py-2 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white font-semibold text-sm transition-colors">
              <X size={16} /> Close
            </button>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f3f2ef] dark:bg-[#0d1117] relative">
          <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 pb-32">
            
            {/* === TAB 1: PUBLIC PROFILE === */}
            {activeTab === 'public' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-[#1b1f23] rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden relative">
                  <div className="h-40 sm:h-52 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-800 dark:to-slate-700 relative group">
                    {formData.cover_url && <img src={formData.cover_url} className="w-full h-full object-cover" alt="Cover" />}
                    <label className="absolute top-4 right-4 p-2 bg-white dark:bg-[#1b1f23] rounded-full cursor-pointer shadow-sm hover:text-blue-600 transition-colors z-10">
                      <Camera size={18} className="text-blue-600" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />
                    </label>
                  </div>

                  <div className="px-6 pb-8">
                    <div className="relative -mt-20 mb-4 inline-block group">
                      <div className="w-40 h-40 rounded-full border-[4px] border-white dark:border-[#1b1f23] bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
                         <img src={formData.avatar_url || `https://ui-avatars.com/api/?name=${formData.full_name}`} className="w-full h-full object-cover" alt="Avatar" />
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Camera size={24} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">First & Last Name</label>
                        <input value={formData.full_name || ''} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:border-blue-600 outline-none transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Headline</label>
                        <input value={formData.headline || ''} onChange={(e) => setFormData({...formData, headline: e.target.value})} placeholder="Ex: Student at University of X" className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:border-blue-600 outline-none transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Location</label>
                        <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded p-2 focus-within:border-blue-600 transition-colors">
                          <MapPin size={16} className="text-gray-400" />
                          <input value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="City, Country" className="w-full bg-transparent outline-none text-gray-900 dark:text-white" />
                        </div>
                      </div>
                       <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Custom URL</label>
                        <div className={`flex items-center gap-2 border rounded p-2 ${isAvailable === false ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                          <span className="text-gray-400 text-sm font-medium">jobtracker.pro/p/</span>
                          <input value={formData.username || ''} onChange={(e) => handleUsernameChange(e.target.value)} placeholder="username" className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-medium" />
                          {isAvailable === true && <CheckCircle2 size={16} className="text-green-600" />}
                          <button onClick={copyFullUrl} title="Copy Full URL" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 transition-colors">
                            <Copy size={16} />
                          </button>
                        </div>
                        {isAvailable === false && suggestions.length > 0 && (
                          <div className="flex gap-2 flex-wrap text-xs">
                             <span className="text-red-500 font-bold">Taken. Try:</span>
                             {suggestions.map(s => <button key={s} onClick={()=>handleUsernameChange(s)} className="text-blue-600 hover:underline">{s}</button>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1b1f23] rounded-lg border border-gray-300 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact Info</h3>
                    <button onClick={() => addItem('social_links')} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm">
                      <Plus size={16} /> Add Link
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.social_links.map((link, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shrink-0 overflow-hidden">
                          {getSocialIcon(link.url)}
                        </div>
                        <input 
                          value={link.url || ''}
                          onChange={(e) => updateItem('social_links', idx, 'url', e.target.value)}
                          placeholder="Paste ANY URL (e.g. vercel.com/user)"
                          className="flex-1 p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none focus:border-blue-600 placeholder-gray-400"
                        />
                        <button onClick={() => removeItem('social_links', idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                      </div>
                    ))}
                    {formData.social_links.length === 0 && <p className="text-sm text-gray-500 italic">No links added yet.</p>}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1b1f23] rounded-lg border border-gray-300 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About</h3>
                  <textarea value={formData.about || ''} onChange={(e) => setFormData({...formData, about: e.target.value})} rows={5} className="w-full p-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none focus:border-blue-600 resize-none" placeholder="Talk about your experience, skills, and goals..." />
                </div>
              </div>
            )}

            {/* === TAB 2: PORTFOLIO DATA === */}
            {activeTab === 'experience' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* EXPERIENCE */}
                <section className="bg-white dark:bg-[#1b1f23] rounded-lg border border-gray-300 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Experience</h3>
                    <button onClick={() => addItem('experience')} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"><Plus size={24} /></button>
                  </div>
                  <div className="space-y-8">
                    {formData.experience.map((item, idx) => (
                      <div key={idx} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-8 last:pb-0">
                         <div className="flex justify-between items-start mb-4">
                           <div>
                              <h4 className="text-base font-bold text-gray-900 dark:text-white">{item.title || 'New Position'}</h4>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.company || 'Company Name'}</p>
                           </div>
                           <button onClick={() => removeItem('experience', idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1">
                             <label className="text-xs font-semibold text-gray-500">Title</label>
                             <input value={item.title || ''} onChange={(e) => updateItem('experience', idx, 'title', e.target.value)} className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:border-blue-600 outline-none" placeholder="Ex: Retail Sales Manager" />
                           </div>
                           <div className="space-y-1">
                             <label className="text-xs font-semibold text-gray-500">Company Name</label>
                             <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded p-2 focus-within:border-blue-600">
                               <Building2 size={16} className="text-gray-400" />
                               <input value={item.company || ''} onChange={(e) => updateItem('experience', idx, 'company', e.target.value)} className="w-full bg-transparent outline-none text-gray-900 dark:text-white" placeholder="Ex: Microsoft" />
                             </div>
                           </div>
                           <div className="md:col-span-2 space-y-3">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={item.current || false} onChange={(e) => updateItem('experience', idx, 'current', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label className="text-sm text-gray-700 dark:text-gray-300">I am currently working in this role</label>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-gray-500">Start Date</label>
                                  <input type="date" value={item.start_date || ''} onChange={(e) => updateItem('experience', idx, 'start_date', e.target.value)} className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none dark:[color-scheme:dark]" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-gray-500">End Date</label>
                                  <input type="date" disabled={item.current} value={item.current ? '' : (item.end_date || '')} onChange={(e) => updateItem('experience', idx, 'end_date', e.target.value)} className={`w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none dark:[color-scheme:dark] ${item.current ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`} />
                                </div>
                              </div>
                           </div>
                            <div className="space-y-1 md:col-span-2">
                             <label className="text-xs font-semibold text-gray-500">Description</label>
                             <textarea rows={3} value={item.description || ''} onChange={(e) => updateItem('experience', idx, 'description', e.target.value)} className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none resize-none" placeholder="Describe your responsibilities..." />
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* EDUCATION */}
                <section className="bg-white dark:bg-[#1b1f23] rounded-lg border border-gray-300 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Education</h3>
                    <button onClick={() => addItem('education')} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"><Plus size={24} /></button>
                  </div>
                  <div className="space-y-8">
                    {formData.education.map((item, idx) => (
                      <div key={idx} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-8 last:pb-0">
                         <div className="flex justify-between items-start mb-4">
                           <div>
                              <h4 className="text-base font-bold text-gray-900 dark:text-white">{item.school || 'New School'}</h4>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.degree} {item.field ? `• ${item.field}` : ''}</p>
                           </div>
                           <button onClick={() => removeItem('education', idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1 md:col-span-2">
                             <label className="text-xs font-semibold text-gray-500">School / Institution</label>
                             <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded p-2 focus-within:border-blue-600">
                               <GraduationCap size={16} className="text-gray-400" />
                               <input value={item.school || ''} onChange={(e) => updateItem('education', idx, 'school', e.target.value)} className="w-full bg-transparent outline-none text-gray-900 dark:text-white" placeholder="Ex: Stanford University" />
                             </div>
                           </div>
                           <div className="space-y-1">
                             <label className="text-xs font-semibold text-gray-500">Degree</label>
                             <input value={item.degree || ''} onChange={(e) => updateItem('education', idx, 'degree', e.target.value)} className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none" placeholder="Ex: Bachelor's" />
                           </div>
                            <div className="space-y-1">
                             <label className="text-xs font-semibold text-gray-500">Field of Study</label>
                             <input value={item.field || ''} onChange={(e) => updateItem('education', idx, 'field', e.target.value)} className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none" placeholder="Ex: Computer Science" />
                           </div>
                           <div className="md:col-span-2 space-y-3">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={item.current || false} onChange={(e) => updateItem('education', idx, 'current', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label className="text-sm text-gray-700 dark:text-gray-300">I am currently studying here</label>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                   <label className="text-xs font-semibold text-gray-500">Start Date</label>
                                   <input type="date" value={item.start_date || ''} onChange={(e) => updateItem('education', idx, 'start_date', e.target.value)} className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none dark:[color-scheme:dark]" />
                                 </div>
                                  <div className="space-y-1">
                                   <label className="text-xs font-semibold text-gray-500">End Date (or expected)</label>
                                   <input type="date" disabled={item.current} value={item.current ? '' : (item.end_date || '')} onChange={(e) => updateItem('education', idx, 'end_date', e.target.value)} className={`w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none dark:[color-scheme:dark] ${item.current ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`} />
                                 </div>
                              </div>
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* CERTIFICATIONS */}
                 <section className="bg-white dark:bg-[#1b1f23] rounded-lg border border-gray-300 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Licenses & Certifications</h3>
                    <button onClick={() => addItem('certifications')} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"><Plus size={24} /></button>
                  </div>
                  <div className="space-y-8">
                    {formData.certifications.map((item, idx) => (
                      <div key={idx} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-8 last:pb-0">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-base font-bold text-gray-900 dark:text-white">{item.name || 'New Certification'}</h4>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.org || 'Issuing Org'}</p>
                           </div>
                           <button onClick={() => removeItem('certifications', idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1 md:col-span-2">
                             <label className="text-xs font-semibold text-gray-500">Name</label>
                             <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded p-2 focus-within:border-blue-600">
                               <Award size={16} className="text-gray-400" />
                               <input value={item.name || ''} onChange={(e) => updateItem('certifications', idx, 'name', e.target.value)} className="w-full bg-transparent outline-none text-gray-900 dark:text-white" placeholder="Ex: AWS Certified Solutions Architect" />
                             </div>
                           </div>
                           <div className="space-y-1">
                             <label className="text-xs font-semibold text-gray-500">Issuing Organization</label>
                             <input value={item.org || ''} onChange={(e) => updateItem('certifications', idx, 'org', e.target.value)} className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none" placeholder="Ex: Amazon Web Services" />
                           </div>
                            <div className="space-y-1">
                             <label className="text-xs font-semibold text-gray-500">Issue Date</label>
                             <input type="date" value={item.issue_date || ''} onChange={(e) => updateItem('certifications', idx, 'issue_date', e.target.value)} className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none dark:[color-scheme:dark]" />
                           </div>
                            <div className="space-y-1 md:col-span-2">
                             <label className="text-xs font-semibold text-gray-500">Credential URL</label>
                             <input value={item.url || ''} onChange={(e) => updateItem('certifications', idx, 'url', e.target.value)} className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none" placeholder="https://..." />
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* === TAB 3: SECURITY === */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                 <div className="bg-white dark:bg-[#1b1f23] rounded-lg border border-gray-300 dark:border-gray-700 p-6 space-y-6">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Shield size={20}/> Sign in & Security</h3>
                   <div className="flex flex-col sm:flex-row gap-4">
                     <div className="flex-1 relative">
                       <label className="text-xs font-bold text-gray-500 uppercase">Change Password</label>
                       <input 
                         type={showPassword ? "text" : "password"} 
                         value={newPassword}
                         onChange={(e) => setNewPassword(e.target.value)}
                         placeholder="New strong password"
                         className="w-full mt-2 p-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none"
                       />
                       <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-10 text-gray-400 hover:text-gray-600">
                         {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                       </button>
                     </div>
                     <button onClick={handleUpdatePassword} disabled={passLoading} className="self-end px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors">
                       {passLoading ? <Loader2 className="animate-spin" /> : 'Update Password'}
                     </button>
                   </div>
                 </div>

                 <div className="bg-white dark:bg-[#1b1f23] rounded-lg border border-gray-300 dark:border-gray-700 p-6 space-y-6">
                    <h3 className="text-lg font-bold text-red-600">Account Management</h3>
                    
                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Hibernate Account</h4>
                        <p className="text-sm text-gray-500">
                          {formData.status === 'hibernated' 
                            ? "Your account is currently hidden." 
                            : "Temporarily hide your public profile."}
                        </p>
                      </div>
                      <button onClick={toggleHibernate} disabled={hibLoading} className={`px-4 py-2 border font-bold rounded transition-colors ${formData.status === 'hibernated' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        {hibLoading ? <Loader2 className="animate-spin" size={16}/> : (formData.status === 'hibernated' ? 'Reactivate' : 'Hibernate')}
                      </button>
                    </div>

                     <div className="flex items-center justify-between py-4">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Close Account</h4>
                        <p className="text-sm text-gray-500">Permanently delete your account and remove all data.</p>
                      </div>
                      <button onClick={deleteAccount} disabled={delLoading} className="px-4 py-2 text-red-600 hover:text-red-700 font-bold transition-colors">
                         {delLoading ? <Loader2 className="animate-spin" /> : 'Close account'}
                      </button>
                    </div>
                 </div>
              </div>
            )}
            
          </div>

          {/* FLOATING SAVE BAR */}
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#1b1f23] border-t border-gray-200 dark:border-gray-800 flex justify-end gap-4 z-20">
             <button onClick={updateProfile} disabled={loading} className="px-8 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2">
               {loading && <Loader2 className="animate-spin" size={16} />} Save
             </button>
          </div>
        </main>
      </div>
    </div>
  );
}