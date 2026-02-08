import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  Briefcase, GraduationCap, Award, Globe, Github, Linkedin, 
  LayoutDashboard, Loader2, ArrowLeft, MapPin, 
  Calendar, Link as LinkIcon, Twitter, Mail, Instagram, Facebook, Youtube,
  Building2 // <--- Added this missing import
} from 'lucide-react';
import type { UserProfile } from '../types';

export function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // --- HELPER: SAFE JSON PARSER ---
  const parseData = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch { return []; }
    }
    return [];
  };

  useEffect(() => {
    async function fetchPublicData() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (error) throw error;

        if (data) {
          const formattedProfile: UserProfile = {
            ...data,
            id: data.id,
            experience: parseData(data.experience),
            education: parseData(data.education),
            certifications: parseData(data.certifications),
            skills: parseData(data.skills),
            interests: parseData(data.interests),
            social_links: parseData(data.social_links)
          };
          setProfile(formattedProfile);
        }
      } catch (err) {
        console.error("Profile lookup failed:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicData();
  }, [username]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // --- HELPER: SMART ICON DETECTOR ---
  const getSocialIcon = (url: string) => {
    if (!url) return <Globe size={16} className="text-gray-400" />;
    
    let domain = '';
    try { domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } 
    catch (e) { return <Globe size={16} className="text-gray-400" />; }

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
        className="w-4 h-4 rounded-full"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
      />
    );
  };

  const getPlatformName = (url: string) => {
    if (!url) return 'Website';
    const lower = url.toLowerCase();
    if (lower.includes('linkedin')) return 'LinkedIn';
    if (lower.includes('github')) return 'GitHub';
    if (lower.includes('twitter') || lower.includes('x.com')) return 'Twitter';
    if (lower.includes('instagram')) return 'Instagram';
    if (lower.includes('facebook')) return 'Facebook';
    if (lower.includes('youtube')) return 'YouTube';
    
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      const name = domain.replace('www.', '').split('.')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
      return 'Website';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef] dark:bg-[#0d1117]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f2ef] dark:bg-[#0d1117] text-center p-6 font-sans">
      <div className="bg-white dark:bg-[#1b1f23] p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <h1 className="text-4xl font-black mb-4 text-gray-900 dark:text-white tracking-tight">Profile Not Found</h1>
        <p className="text-gray-500 font-medium mb-8">The user "{username}" does not exist or has changed their handle.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105">
          <ArrowLeft size={18} /> Back to Home
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f2ef] dark:bg-[#0d1117] font-sans pb-20 selection:bg-blue-100 dark:selection:bg-blue-900">
      
      {/* Navigation Bar */}
      <nav className="bg-white/80 dark:bg-[#1b1f23]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 sticky top-0 z-50 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-full">
          <Link to="/" className="text-blue-600 font-black text-xl tracking-tighter flex items-center gap-1">
            <LayoutDashboard size={20} className="mb-0.5"/> JOB<span className="text-gray-900 dark:text-white">TRACKER</span>
          </Link>
          <Link to="/" className="text-xs font-bold text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
             Create Your Own Profile &rarr;
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto mt-6 px-4 space-y-4">
        
        {/* === HEADER CARD === */}
        <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm relative">
          
          <div className="h-40 sm:h-52 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700">
            {profile.cover_url && <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />}
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              
              <div className="-mt-16 sm:-mt-20 relative z-10">
                <img 
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}`} 
                  alt={profile.full_name}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[4px] border-white dark:border-[#1b1f23] bg-white dark:bg-gray-800 object-cover shadow-md"
                />
              </div>

              <div className="flex-1 mt-2 sm:mt-4 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {profile.full_name}
                </h1>
                
                {(profile.header_text) && (
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
                    {profile.header_text}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
                   {profile.location && (
                     <span className="flex items-center gap-1">
                       <MapPin size={14} /> {profile.location}
                     </span>
                   )}
                </div>
              </div>
            </div>

            {profile.social_links && profile.social_links.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {profile.social_links.map((link: any, i: number) => (
                  <a 
                    key={i} 
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {getSocialIcon(link.url)}
                    <span className="max-w-[150px] truncate">{getPlatformName(link.url)}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* === ABOUT SECTION === */}
        {profile.about && (
          <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About</h3>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {profile.about}
            </p>
          </div>
        )}

        {/* === EXPERIENCE SECTION === */}
        {profile.experience && profile.experience.length > 0 && (
          <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Experience</h3>
            <div className="space-y-8">
              {profile.experience.map((exp: any, i: number) => (
                <div key={i} className="flex gap-4 group">
                  <div className="mt-1">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                      <Building2 size={24} />
                    </div>
                  </div>
                  <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-8 last:border-0 last:pb-0">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{exp.title}</h4>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{exp.company}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar size={12}/>
                      {formatDate(exp.start_date)} - {exp.current ? <span className="text-green-600 font-bold">Present</span> : formatDate(exp.end_date)}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === EDUCATION SECTION === */}
        {profile.education && profile.education.length > 0 && (
          <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Education</h3>
            <div className="space-y-8">
              {profile.education.map((edu: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">
                     <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                      <GraduationCap size={24} />
                    </div>
                  </div>
                  <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-8 last:border-0 last:pb-0">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{edu.school}</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{edu.degree} {edu.field ? `• ${edu.field}` : ''}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(edu.start_date)} - {edu.current ? 'Present' : formatDate(edu.end_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === CERTIFICATIONS SECTION === */}
        {profile.certifications && profile.certifications.length > 0 && (
          <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Licenses & Certifications</h3>
            <div className="space-y-6">
              {profile.certifications.map((cert: any, i: number) => (
                <div key={i} className="flex gap-4 items-start">
                   <div className="mt-1">
                     <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-500">
                      <Award size={20} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{cert.name}</h4>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{cert.org}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Issued {formatDate(cert.issue_date)}</p>
                    {cert.url && (
                      <a href={cert.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mt-2 border border-blue-200 dark:border-blue-900/30 px-3 py-1.5 rounded-full">
                        Show Credential <LinkIcon size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === SKILLS & INTERESTS === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.skills && profile.skills.length > 0 && (
            <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold border border-gray-100 dark:border-gray-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium border border-gray-100 dark:border-gray-700">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </main>
      
      <footer className="max-w-4xl mx-auto mt-12 text-center pb-8">
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest opacity-60">
          <Globe size={12} />
          <span>JobTracker Pro Profile</span>
        </div>
      </footer>
    </div>
  );
}