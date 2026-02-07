import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, X, Save, Loader2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import type{ UserProfile, SocialLink, Project } from '../types';
import type{ Session } from '@supabase/supabase-js'; 

interface ProfileProps {
  session: Session; 
  onClose: () => void;
}

export function Profile({ session, onClose }: ProfileProps) {
  const [loading, setLoading] = useState(false);
  
  // Force userId to be a string
  const userId = (session?.user?.id || '') as string;

  const [formData, setFormData] = useState<UserProfile>({
    id: userId, 
    full_name: '',
    username: '',
    headline: '',
    about: '',
    location: '',
    university: '',
    graduation_year: '',
    skills: '',
    avatar_url: '',
    cover_url: '',
    social_links: [],
    projects: []
  });

  useEffect(() => {
    if (userId) getProfile();
  }, [userId]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setFormData({
          ...data,
          social_links: data.social_links || [],
          projects: data.projects || []
        });
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // FIX: Removed 'id: userId' because ...formData already contains it
      const { error } = await supabase.from('profiles').upsert({
        ...formData,
        updated_at: new Date(),
      });
      
      if (error) throw error;
      onClose();
    } catch (error: any) { alert('Error updating profile!'); } finally { setLoading(false); }
  };

  const uploadImage = async (event: any, bucket: 'avatars' | 'covers', field: 'avatar_url' | 'cover_url') => {
    try {
      setLoading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const filePath = `${userId}/${Math.random()}.${file.name.split('.').pop()}`;
      await supabase.storage.from(bucket).upload(filePath, file);
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setFormData({ ...formData, [field]: data.publicUrl });
    } catch (error) { alert('Upload failed'); } finally { setLoading(false); }
  };

  // --- HELPER FOR ARRAYS ---
  const addSocial = () => {
    if ((formData.social_links?.length || 0) < 5) {
      setFormData({ ...formData, social_links: [...(formData.social_links || []), { platform: 'website', url: '' }] });
    }
  };

  const updateSocial = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...(formData.social_links || [])];
    // @ts-ignore
    newLinks[index][field] = value;
    setFormData({ ...formData, social_links: newLinks });
  };

  const removeSocial = (index: number) => {
    const newLinks = [...(formData.social_links || [])];
    newLinks.splice(index, 1);
    setFormData({ ...formData, social_links: newLinks });
  };

  const addProject = () => {
    setFormData({ ...formData, projects: [...(formData.projects || []), { title: '', description: '', url: '', tech_stack: '' }] });
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const newProjects = [...(formData.projects || [])];
    // @ts-ignore
    newProjects[index][field] = value;
    setFormData({ ...formData, projects: newProjects });
  };

  const removeProject = (index: number) => {
    const newProjects = [...(formData.projects || [])];
    newProjects.splice(index, 1);
    setFormData({ ...formData, projects: newProjects });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border dark:border-gray-700 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Profile</h2>
          <button onClick={onClose}><X className="text-gray-500 hover:text-red-500" /></button>
        </div>

        <form onSubmit={updateProfile} className="p-6 space-y-8">
          
          {/* 1. IMAGES SECTION */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Images</h3>
            
            {/* Cover Image */}
            <div className="relative h-32 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden border border-dashed border-gray-300 dark:border-gray-600 group">
              {formData.cover_url ? (
                <img src={formData.cover_url} className="w-full h-full object-cover" alt="Cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">Upload Cover Image</div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium">
                <ImageIcon className="mr-2" size={18} /> Change Cover
                <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadImage(e, 'covers', 'cover_url')} disabled={loading} />
              </label>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 -mt-8 ml-4 relative z-10">
              <div className="relative group">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-md" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white dark:border-gray-800"><User className="text-blue-500" /></div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs">
                  Change
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadImage(e, 'avatars', 'avatar_url')} disabled={loading} />
                </label>
              </div>
              <div className="pt-6">
                 <p className="text-sm font-medium text-gray-900 dark:text-white">Profile Photo</p>
                 <p className="text-xs text-gray-500">Recommended 400x400px</p>
              </div>
            </div>
          </div>

          {/* 2. BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Full Name" value={formData.full_name || ''} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
            <div className="flex">
               <span className="p-3 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-500 text-sm">jobtracker.pro/p/</span>
               <input placeholder="username" value={formData.username || ''} onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})} className="w-full p-3 rounded-r-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
            </div>
            <input placeholder="Headline (e.g. Frontend Dev)" value={formData.headline || ''} onChange={(e) => setFormData({...formData, headline: e.target.value})} className="col-span-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
            <textarea placeholder="About You..." value={formData.about || ''} onChange={(e) => setFormData({...formData, about: e.target.value})} className="col-span-full h-24 p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
          </div>

          {/* 3. SOCIAL LINKS (Max 5) */}
          <div className="space-y-3">
             <div className="flex justify-between items-center">
               <h3 className="font-semibold text-gray-900 dark:text-white">Social Links (Max 5)</h3>
               <button type="button" onClick={addSocial} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><Plus size={14}/> Add Link</button>
             </div>
             {formData.social_links?.map((link, i) => (
               <div key={i} className="flex gap-2">
                 <select value={link.platform} onChange={(e) => updateSocial(i, 'platform', e.target.value)} className="p-2 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                    <option value="website">Website</option>
                    <option value="github">GitHub</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="email">Email</option>
                 </select>
                 <input placeholder="URL (https://...)" value={link.url} onChange={(e) => updateSocial(i, 'url', e.target.value)} className="flex-1 p-2 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                 <button type="button" onClick={() => removeSocial(i)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
               </div>
             ))}
          </div>

          {/* 4. PROJECTS */}
          <div className="space-y-3">
             <div className="flex justify-between items-center">
               <h3 className="font-semibold text-gray-900 dark:text-white">Featured Projects</h3>
               <button type="button" onClick={addProject} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><Plus size={14}/> Add Project</button>
             </div>
             {formData.projects?.map((proj, i) => (
               <div key={i} className="p-4 rounded-lg border dark:border-gray-700 space-y-2 bg-gray-50 dark:bg-gray-700/30">
                 <div className="flex justify-between">
                   <input placeholder="Project Title" value={proj.title} onChange={(e) => updateProject(i, 'title', e.target.value)} className="font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white w-full" />
                   <button type="button" onClick={() => removeProject(i)} className="text-red-500"><Trash2 size={16}/></button>
                 </div>
                 <input placeholder="Description" value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} className="w-full text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none pb-1 dark:text-gray-300" />
                 <div className="grid grid-cols-2 gap-2">
                   <input placeholder="Project URL" value={proj.url} onChange={(e) => updateProject(i, 'url', e.target.value)} className="text-xs bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-600 dark:text-white" />
                   <input placeholder="Tech Stack (React, Supabase)" value={proj.tech_stack} onChange={(e) => updateProject(i, 'tech_stack', e.target.value)} className="text-xs bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-600 dark:text-white" />
                 </div>
               </div>
             ))}
          </div>

          {/* 5. EDUCATION & SKILLS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t dark:border-gray-700 pt-6">
             <input placeholder="University" value={formData.university || ''} onChange={(e) => setFormData({...formData, university: e.target.value})} className="p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
             <input placeholder="Graduation Year" value={formData.graduation_year || ''} onChange={(e) => setFormData({...formData, graduation_year: e.target.value})} className="p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
             <input placeholder="Skills (Comma separated)" value={formData.skills || ''} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="col-span-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
             <input placeholder="Location" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} className="p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
          </div>

          <div className="pt-4 border-t dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 p-4 -mx-6 -mb-6">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg">
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}