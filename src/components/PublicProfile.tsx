import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { MapPin, Globe, Github, Linkedin, Mail, Twitter, GraduationCap, Award, User, Briefcase, Loader2, ArrowLeft, ExternalLink, Code } from 'lucide-react';
import type{ UserProfile } from '../types';

export function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('username', username).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <Github size={20} />;
      case 'linkedin': return <Linkedin size={20} />;
      case 'twitter': return <Twitter size={20} />;
      case 'email': return <Mail size={20} />;
      default: return <Globe size={20} />;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  if (!profile) return <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white"><h1>Profile not found</h1><Link to="/" className="text-blue-600 mt-4">Go Home</Link></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-20">
      
      {/* 1. COVER IMAGE */}
      <div className="h-64 w-full relative bg-gray-300 dark:bg-gray-800 overflow-hidden">
        {profile.cover_url ? (
           <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
           <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
        )}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          <div className="p-6 sm:p-8">
            {/* 2. HEADER INFO */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full md:w-auto">
                <div className="relative">
                   {profile.avatar_url ? (
                     <img src={profile.avatar_url} className="w-36 h-36 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover bg-white" />
                   ) : (
                     <div className="w-36 h-36 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-blue-100 flex items-center justify-center text-blue-600"><User size={48} /></div>
                   )}
                </div>
                
                <div className="text-center md:text-left mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.full_name}</h1>
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-1">{profile.headline || 'Job Seeker'}</p>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 dark:text-gray-400 text-sm">
                     {profile.location && <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>}
                  </div>
                </div>
              </div>

              {/* 3. SOCIAL ICONS */}
              <div className="flex gap-2">
                {profile.social_links?.map((link, i) => (
                  <a key={i} href={link.platform === 'email' ? `mailto:${link.url}` : link.url} target="_blank" rel="noreferrer" 
                     className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-600 dark:text-gray-300 transition-colors">
                     {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700 my-8" />

            {/* 4. ABOUT */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{profile.about || "No bio yet."}</p>
            </div>

            {/* 5. FEATURED PROJECTS */}
            {profile.projects && profile.projects.length > 0 && (
              <div className="mb-10">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                   <Briefcase className="text-blue-500" size={20} /> Featured Projects
                 </h2>
                 <div className="grid md:grid-cols-2 gap-6">
                   {profile.projects.map((proj, i) => (
                     <div key={i} className="group p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md bg-gray-50 dark:bg-gray-700/20">
                       <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{proj.title}</h3>
                         {proj.url && <a href={proj.url} target="_blank" className="text-gray-400 hover:text-blue-500"><ExternalLink size={16}/></a>}
                       </div>
                       <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{proj.description}</p>
                       {proj.tech_stack && (
                         <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                           <Code size={12} /> {proj.tech_stack}
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {/* 6. SKILLS & EDUCATION GRID */}
            <div className="grid md:grid-cols-2 gap-10">
               <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><GraduationCap className="text-green-500"/> Education</h2>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                     <h3 className="font-bold text-gray-800 dark:text-gray-200">{profile.university || 'University'}</h3>
                     <p className="text-sm text-gray-500">Class of {profile.graduation_year}</p>
                  </div>
               </div>
               <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Award className="text-purple-500"/> Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.split(',').map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-blue-100 dark:border-blue-800">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
               </div>
            </div>

          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 text-center border-t dark:border-gray-700">
             <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 font-medium">Create your own portfolio on JobTracker Pro</Link>
          </div>
        </div>
      </div>
    </div>
  );
}