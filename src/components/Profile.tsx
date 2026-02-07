import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Mail, Calendar, Book, Code, Globe, Camera, Save, Loader2, X } from 'lucide-react';

interface ProfileProps {
  session: any;
  onClose: () => void;
}

export function Profile({ session, onClose }: ProfileProps) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [dob, setDob] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { user } = session;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setFullName(data.full_name || '');
        setEducation(data.education || '');
        setSkills(data.skills || '');
        setDob(data.dob || '');
        setWebsite(data.website || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error loading user data!', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { user } = session;

      const updates = {
        id: user.id,
        full_name: fullName,
        education,
        skills,
        dob,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      alert('Profile updated successfully!');
      onClose();
    } catch (error) {
      alert('Error updating the data!');
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: any) => {
    try {
      setLoading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (error) {
      alert('Error uploading avatar!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative border dark:border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
          <User className="text-blue-600" /> Edit Profile
        </h2>

        <form onSubmit={updateProfile} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                  <User size={40} />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-lg" htmlFor="avatar-upload">
                <Camera size={16} />
              </label>
              <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={loading} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Click camera to upload photo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="John Doe" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="text" value={session.user.email} disabled className="w-full p-3 rounded-lg border bg-gray-100 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Education</label>
            <textarea value={education} onChange={(e) => setEducation(e.target.value)} className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="University, Major, Year..." rows={2} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills</label>
            <textarea value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="React, TypeScript, Node.js..." rows={2} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Profile</>}
          </button>
        </form>
      </div>
    </div>
  );
}