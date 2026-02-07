import { useState, useEffect } from 'react';
import { 
  Plus, LayoutDashboard, LogOut, Search, 
  Briefcase, X, Calendar, Moon, Sun, Kanban, LayoutGrid, 
  Upload, MapPin, DollarSign, User, TrendingUp, CheckCircle2, Monitor, AlertCircle, Clock, ArrowLeft
} from 'lucide-react';
// Note: These use '../' because Dashboard.tsx is inside /components
import { supabase } from '../supabaseClient';
import type{ JobApplication, Status } from '../types';
import { JobCard } from './JobCard';
import { Auth } from './Auth';
import { Profile } from './Profile';
import { LandingPage } from './LandingPage';
import type { Session } from '@supabase/supabase-js';

// --- THEME TYPE ---
type Theme = 'light' | 'dark' | 'system';

// --- FAKE DEMO DATA ---
const DEMO_JOBS: JobApplication[] = [
  { id: '1', user_id: 'demo', company: 'Google', position: 'Frontend Engineer', status: 'Interview', date_applied: '2023-10-15', salary: '$120k', location: 'Remote', interview_date: new Date().toISOString() },
  { id: '2', user_id: 'demo', company: 'Netflix', position: 'UI Designer', status: 'Applied', date_applied: '2023-10-20', salary: '$140k', location: 'Los Gatos, CA' },
  { id: '3', user_id: 'demo', company: 'Spotify', position: 'Product Manager', status: 'Offer', date_applied: '2023-09-01', salary: '$135k', location: 'New York', notes: 'Great culture!' },
  { id: '4', user_id: 'demo', company: 'Amazon', position: 'Backend Dev', status: 'Rejected', date_applied: '2023-08-15', salary: '$110k', location: 'Seattle' },
];

export function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATES ---
  const [theme, setTheme] = useState<Theme>('system');
  const [isDemo, setIsDemo] = useState(false);
  
  const [viewMode, setViewMode] = useState<'grid' | 'board'>('grid');
  const [showProfile, setShowProfile] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Form State
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]); 
  const [interviewDate, setInterviewDate] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // --- THEME LOGIC ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  };

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => { if (theme === 'system') applyTheme('system'); };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // --- AUTH & DATA FETCHING ---
  useEffect(() => {
    // 1. Check Session on Load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // SECURITY CHECK: Kick out unverified email users
        const isEmailUser = session.user.app_metadata.provider === 'email';
        const isUnverified = !session.user.email_confirmed_at;

        if (isEmailUser && isUnverified) {
          alert("Please verify your email address before logging in!");
          supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(session);
          fetchJobs();
        }
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const isEmailUser = session.user.app_metadata.provider === 'email';
        const isUnverified = !session.user.email_confirmed_at;

        if (isEmailUser && isUnverified) {
          alert("Please verify your email address before logging in!");
          supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(session);
          setIsDemo(false);
          fetchJobs();
        }
      } else if (!isDemo) {
        setJobs([]);
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  const fetchJobs = async () => {
    if (isDemo) {
      setJobs(DEMO_JOBS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (data) setJobs(data);
    setLoading(false);
  };

  // --- ACTIONS ---
  const handleDemoStart = () => {
    setIsDemo(true);
    setJobs(DEMO_JOBS);
    setShowAuth(false);
  };

  const handleExitDemo = () => {
    setIsDemo(false);
    setJobs([]);
    setShowAuth(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position) return;

    if (isDemo) {
      const newJob: any = {
        id: Math.random().toString(), user_id: 'demo', company, position, date_applied: dateApplied,
        status: 'Applied', salary, location, notes, interview_date: interviewDate || undefined
      };
      setJobs([newJob, ...jobs]);
      resetForm();
      setIsFormOpen(false);
      alert("Job added (Demo Mode - Data won't be saved)");
      return;
    }

    if (!session) return;
    try {
      let resumeData = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${session.user.id}/${Math.random()}.${fileExt}`;
        setUploading(true);
        const { error } = await supabase.storage.from('resumes').upload(filePath, file);
        setUploading(false);
        if (!error) {
           const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
           resumeData = { url: data.publicUrl, name: file.name };
        }
      }
      
      const jobData: any = { 
        company, position, date_applied: dateApplied, salary, location, notes, interview_date: interviewDate || null 
      };
      
      if (resumeData) { jobData.resume_url = resumeData.url; jobData.resume_name = resumeData.name; }

      if (editingId) {
        await supabase.from('jobs').update(jobData).eq('id', editingId);
        setJobs(jobs.map(job => job.id === editingId ? { ...job, ...jobData } : job));
        setEditingId(null);
      } else {
        jobData.status = 'Applied';
        jobData.user_id = session.user.id;
        const { data } = await supabase.from('jobs').insert([jobData]).select();
        if (data) setJobs([data[0], ...jobs]);
      }
      resetForm();
      setIsFormOpen(false);
    } catch (error) { console.error(error); }
  };

  const deleteJob = async (id: string) => {
    if (isDemo) {
      setJobs(jobs.filter(job => job.id !== id));
      return;
    }
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (!error) setJobs(jobs.filter(job => job.id !== id));
  };

  const updateStatus = async (id: string, newStatus: Status) => {
    if (isDemo) {
      setJobs(jobs.map(job => (job.id === id ? { ...job, status: newStatus } : job)));
      return;
    }
    const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', id);
    if (!error) setJobs(jobs.map(job => (job.id === id ? { ...job, status: newStatus } : job)));
  };

  const resetForm = () => {
    setCompany(''); setPosition(''); setDateApplied(new Date().toISOString().split('T')[0]);
    setInterviewDate(''); setSalary(''); setLocation(''); setNotes(''); setFile(null); setEditingId(null);
  };

  const startEditing = (job: JobApplication) => {
    setEditingId(job.id); setCompany(job.company); setPosition(job.position); setDateApplied(job.date_applied);
    // @ts-ignore
    setInterviewDate(job.interview_date || ''); 
    setSalary(job.salary || ''); setLocation(job.location || ''); setNotes(job.notes || '');
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- STATS LOGIC ---
  const stats = {
    total: jobs.length,
    interviews: jobs.filter(j => j.status === 'Interview').length,
    offers: jobs.filter(j => j.status === 'Offer').length,
    responseRate: jobs.length > 0 
      ? Math.round(((jobs.filter(j => j.status === 'Interview' || j.status === 'Offer').length) / jobs.length) * 100) 
      : 0
  };

  const upcomingEvents = jobs.filter(job => {
    // @ts-ignore
    if (!job.interview_date) return false;
    // @ts-ignore
    const d = new Date(job.interview_date);
    const today = new Date(); today.setHours(0,0,0,0);
    const nextWeek = new Date(); nextWeek.setDate(today.getDate() + 7);
    return d >= today && d <= nextWeek;
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.company.toLowerCase().includes(searchQuery.toLowerCase()) || job.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getJobsByStatus = (status: Status) => filteredJobs.filter(job => job.status === status);

  // --- RENDER LOGIC ---

  if (!session && !isDemo && showAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mb-4">
          <button onClick={() => setShowAuth(false)} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} className="mr-1" /> Back to Home
          </button>
        </div>
        <Auth />
      </div>
    );
  }

  if (!session && !isDemo) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} onViewDemo={handleDemoStart} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      
      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-blue-600 text-white text-center py-2 text-sm font-bold flex justify-center items-center gap-2 sticky top-0 z-50">
          <span>👀 You are viewing Demo Mode. Data will not be saved.</span>
          <button onClick={handleExitDemo} className="underline hover:text-blue-200">Exit Demo</button>
        </div>
      )}

      {/* Navbar */}
      <nav className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 h-16 flex justify-between items-center ${isDemo ? '' : 'sticky top-0 z-40'} shadow-sm`}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/30">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">JobTracker <span className="text-blue-600">Pro</span></h1>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={cycleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
             {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}
           </button>
           <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
           
           {isDemo ? (
             <button onClick={handleExitDemo} className="text-sm font-medium text-red-500 hover:text-red-700">Exit Demo</button>
           ) : (
             <>
               <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                 <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300"><User size={16} /></div>
               </button>
               <button onClick={() => supabase.auth.signOut()} className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
             </>
           )}
        </div>
      </nav>

      {/* FIXED: Strict session check before rendering Profile */}
      {showProfile && !isDemo && session && (
        <Profile session={session} onClose={() => setShowProfile(false)} />
      )}

      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        
        {/* --- DASHBOARD SUMMARY --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
               {[
                 { label: 'Total Apps', value: stats.total, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                 { label: 'Interviews', value: stats.interviews, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                 { label: 'Offers', value: stats.offers, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                 { label: 'Response Rate', value: `${stats.responseRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
               ].map((stat, i) => (
                 <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                   <div className={`p-2 w-fit rounded-lg ${stat.bg} ${stat.color} mb-3`}><stat.icon size={18} /></div>
                   <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p><p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p></div>
                 </div>
               ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 overflow-hidden flex flex-col">
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Clock size={16} /> This Week
               </h3>
               <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 {upcomingEvents.length > 0 ? (
                   upcomingEvents.map(job => (
                     <div key={job.id} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                        <div className="mt-1"><AlertCircle size={16} className="text-blue-600 dark:text-blue-400"/></div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{job.company}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                             {/* @ts-ignore */}
                             Interview: {new Date(job.interview_date).toLocaleDateString()}
                          </p>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                     <Calendar size={32} className="mb-2 opacity-20" />
                     <p className="text-sm">No interviews scheduled this week.</p>
                   </div>
                 )}
               </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
             <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500'}`}><LayoutGrid size={18} /></button>
                <button onClick={() => setViewMode('board')} className={`p-2 rounded-md ${viewMode === 'board' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500'}`}><Kanban size={18} /></button>
             </div>
             <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
               {isFormOpen ? <X size={18} /> : <Plus size={18} />} <span className="hidden sm:inline">{isFormOpen ? 'Close' : 'Add New Job'}</span>
             </button>
          </div>
        </div>

        {/* Form Section */}
        {isFormOpen && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl">
               <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                 {editingId ? 'Edit Application' : 'New Application'}
               </h2>
               <form onSubmit={handleSubmit} className="grid gap-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <input required placeholder="Company *" value={company} onChange={(e) => setCompany(e.target.value)} className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:text-white" />
                   <input required placeholder="Position *" value={position} onChange={(e) => setPosition(e.target.value)} className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:text-white" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <div className="relative"><DollarSign className="absolute left-3 top-3.5 text-gray-400" size={16} /><input placeholder="Salary" value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full pl-9 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:text-white" /></div>
                   <div className="relative"><MapPin className="absolute left-3 top-3.5 text-gray-400" size={16} /><input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full pl-9 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:text-white" /></div>
                   <div>
                     <span className="text-xs text-gray-500 ml-1">Applied Date</span>
                     <div className="relative"><Calendar className="absolute left-3 top-3.5 text-gray-400" size={16} /><input type="date" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} className="w-full pl-9 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:text-white text-gray-600" /></div>
                   </div>
                   <div>
                     <span className="text-xs text-gray-500 ml-1">Interview Date (Optional)</span>
                     <div className="relative"><Calendar className="absolute left-3 top-3.5 text-blue-500" size={16} /><input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="w-full pl-9 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg outline-none focus:border-blue-500 dark:text-white text-gray-600" /></div>
                   </div>
                 </div>
                 <textarea placeholder="Notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="p-3 h-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:text-white resize-none" />
                 
                 <div className="flex gap-4 items-center mt-2">
                   {!isDemo && (
                     <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 text-sm">
                       <Upload size={16} /> {file ? file.name.substring(0, 15) + '...' : "Attach Resume (PDF)"}
                       <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="hidden" />
                     </label>
                   )}
                   <button disabled={uploading} className="bg-gray-900 dark:bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity ml-auto">
                     {uploading ? 'Saving...' : 'Save Application'}
                   </button>
                 </div>
               </form>
            </div>
          </div>
        )}

        {/* --- VIEW MODES --- */}
        {viewMode === 'grid' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-20">
            {filteredJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                onDelete={deleteJob} 
                onStatusChange={updateStatus} 
                onEdit={startEditing} 
              />
            ))}
            {filteredJobs.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-400">
                <p>No jobs found. Start by adding one!</p>
              </div>
            )}
          </div>
        ) : (
          /* --- KANBAN BOARD LAYOUT --- */
          <div className="flex gap-6 overflow-x-auto pb-12 snap-x w-full">
            {(['Applied', 'Interview', 'Offer', 'Rejected'] as Status[]).map((status) => (
              <div key={status} className="min-w-[320px] flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col max-h-[calc(100vh-250px)]">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                   <div className="flex items-center gap-2">
                     <span className={`w-3 h-3 rounded-full ${status === 'Offer' ? 'bg-green-500' : status === 'Interview' ? 'bg-amber-500' : status === 'Rejected' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                     <h3 className="font-bold text-gray-700 dark:text-gray-200">{status}</h3>
                   </div>
                   <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2.5 py-0.5 rounded-full border border-gray-100 dark:border-gray-600 font-mono">
                     {getJobsByStatus(status).length}
                   </span>
                </div>
                
                {/* Column Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {getJobsByStatus(status).map(job => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onDelete={deleteJob} 
                      onStatusChange={updateStatus} 
                      onEdit={startEditing} 
                    />
                  ))}
                  {getJobsByStatus(status).length === 0 && (
                    <div className="h-32 border-2 border-dashed border-gray-200 dark:border-gray-700/50 rounded-lg flex items-center justify-center text-gray-400 text-sm italic">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}