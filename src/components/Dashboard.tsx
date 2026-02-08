import { useState, useEffect } from 'react';
import { 
  Plus, LayoutDashboard, LogOut, Search, 
  Briefcase, X, Calendar, Moon, Sun, LayoutGrid, 
  Upload, MapPin, User, TrendingUp, CheckCircle2, 
  AlertCircle, Clock, ArrowLeft, SortDesc, List as ListIcon, 
  Edit, Trash, Paperclip, ChevronDown, MonitorPlay, Bookmark, Code2, 
  Monitor, History, Filter
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import type{ JobApplication, Status, TimelineEvent, RoundType } from '../types';
import { JobCard } from './JobCard';
import { Auth } from './Auth';
import { Profile } from './Profile';
import { LandingPage } from './LandingPage';
import type { Session } from '@supabase/supabase-js';

// --- TYPES ---
type Theme = 'light' | 'dark' | 'system';
type ViewMode = 'grid' | 'list';
type ToastType = 'success' | 'error' | 'info';
type SortOption = 'date_applied' | 'interview_date' | 'salary';

// Matches 'status' in types.ts
type ProfessionalStatus = 'Saved' | 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const DEMO_JOBS: JobApplication[] = [
  { 
    id: '1', user_id: 'demo', company: 'Google', position: 'Frontend Engineer', status: 'Assessment', 
    date_applied: '2023-10-15', salary: '120k', location: 'Remote', interview_date: new Date().toISOString(), 
    notes: '[OA] HackerRank Link sent',
    timeline: [
      { id: 't1', type: 'Applied', date: '2023-10-15', completed: true },
      { id: 't2', type: 'OA', date: new Date().toISOString(), completed: false }
    ]
  },
  { 
    id: '2', user_id: 'demo', company: 'Netflix', position: 'UI Designer', status: 'Applied', 
    date_applied: '2023-10-20', salary: '140k', location: 'Los Gatos, CA',
    timeline: [{ id: 't3', type: 'Applied', date: '2023-10-20', completed: true }]
  },
];

interface DashboardProps {
  session?: Session | null;
}

export function Dashboard({ session: propSession }: DashboardProps) {
  const [session, setSession] = useState<Session | null>(propSession || null);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // --- UI STATES ---
  const [theme, setTheme] = useState<Theme>('system');
  const [isDemo, setIsDemo] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showProfile, setShowProfile] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // --- FORM STATE ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]); 
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Timeline History for Modal
  const [currentTimeline, setCurrentTimeline] = useState<TimelineEvent[]>([]);

  // --- STAGE MODAL STATE ---
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [targetJobId, setTargetJobId] = useState<string | null>(null);
  const [nextRoundType, setNextRoundType] = useState<RoundType>('Technical');
  const [nextRoundDate, setNextRoundDate] = useState('');
  const [customStageName, setCustomStageName] = useState('');
  const [manualStatusOverride, setManualStatusOverride] = useState<ProfessionalStatus | null>(null);

  // --- FILTERS & SORTING ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('date_applied');

  // --- TOAST HELPER ---
  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

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

  // --- DATA LOADING ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      setAuthError(`Login Failed. Please try again.`);
      setLoading(false);
      return; 
    }

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
          await fetchJobs();
          await fetchUserProfile(session.user.id);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSession(session);
        setIsDemo(false);
        fetchJobs();
        fetchUserProfile(session.user.id);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setJobs([]);
        setUserAvatar(null);
        setShowAuth(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchJobs = async () => {
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (data) setJobs(data as JobApplication[]);
  };

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
    if (data && data.avatar_url) {
      setUserAvatar(data.avatar_url);
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.avatar_url) {
        setUserAvatar(session.user.user_metadata.avatar_url);
      }
    }
  };

  // --- ACTIONS ---
  const handleExitDemo = () => {
    setIsDemo(false);
    setJobs([]);
    setSession(null);
    setShowAuth(false);
  };

  const handleDemoStart = () => {
    setIsDemo(true);
    setJobs(DEMO_JOBS);
    setShowAuth(false);
    showToast("Welcome to Demo Mode!", "info");
  };

  // --- STAGE LOGIC ---
  const initiateStageChange = (jobId: string, intendedStatus: Status) => {
    setTargetJobId(jobId);
    
    // Intelligent Defaults
    if (intendedStatus === 'Assessment') setNextRoundType('OA');
    else if (intendedStatus === 'Interview') setNextRoundType('Technical');
    else if (intendedStatus === 'Offer') setNextRoundType('Offer');
    else if (intendedStatus === 'Rejected') setNextRoundType('Rejected');
    else setNextRoundType('Custom'); 

    setManualStatusOverride(intendedStatus); 
    setNextRoundDate(''); 
    setIsStageModalOpen(true);
  };

  const confirmStageChange = async () => {
    if (!targetJobId) return;
    const job = jobs.find(j => j.id === targetJobId);
    if (!job) return;

    // 1. Create Event
    const newEvent: TimelineEvent = {
      id: Date.now().toString(),
      type: nextRoundType,
      customName: nextRoundType === 'Custom' ? customStageName : undefined,
      date: nextRoundDate || null,
      completed: false, 
      notes: ''
    };

    // 2. Archive previous
    const oldTimeline = (job.timeline || []).map(e => ({ ...e, completed: true }));
    const newTimeline = [newEvent, ...oldTimeline];

    // 3. Set Status
    let finalStatus: Status = manualStatusOverride || job.status;
    if (!manualStatusOverride) {
      if (['OA', 'Aptitude'].includes(nextRoundType)) finalStatus = 'Assessment';
      else if (['Technical', 'System Design', 'HR', 'Managerial', 'Phone Screen'].includes(nextRoundType)) finalStatus = 'Interview';
      else if (nextRoundType === 'Offer') finalStatus = 'Offer';
      else if (nextRoundType === 'Rejected') finalStatus = 'Rejected';
    }

    // 4. Tag Notes
    let newNotes = job.notes || '';
    newNotes = newNotes.replace(/\[.*?\]\s*/g, '');
    if (nextRoundType !== 'None' && nextRoundType !== 'Custom') {
      newNotes = `[${nextRoundType}] ` + newNotes;
    }

    // 5. Update
    const updatedJob = {
      ...job,
      status: finalStatus,
      timeline: newTimeline,
      interview_date: newEvent.date,
      notes: newNotes
    };

    setJobs(jobs.map(j => j.id === targetJobId ? updatedJob : j));
    setIsStageModalOpen(false);

    // 6. DB Update (Skip if Demo)
    if (!isDemo) {
      const { error } = await supabase.from('jobs').update({
        status: finalStatus,
        timeline: newTimeline,
        interview_date: newEvent.date,
        notes: newNotes
      }).eq('id', targetJobId);

      if (error) {
        showToast("Update failed", "error");
        fetchJobs(); 
      } else {
        showToast("Status updated!", "success");
      }
    } else {
      showToast("Status updated (Demo)", "success");
    }
  };

  // --- CRUD ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position) return;

    const payload: any = { 
      company, position, salary, location, notes, 
      date_applied: dateApplied || new Date().toISOString()
    };

    if (!editingId) {
      payload.status = 'Applied';
      payload.timeline = [{ id: 'init', type: 'Applied', date: dateApplied, completed: true }];
    }

    if (isDemo) {
      setJobs([{ ...payload, id: Math.random().toString() } as JobApplication, ...jobs]);
      resetForm(); setIsFormOpen(false); 
      showToast("Job saved (Demo)", "success");
      return;
    }

    try {
      if (file) {
        setUploading(true);
        const path = `${session!.user.id}/${Math.random()}.pdf`;
        await supabase.storage.from('resumes').upload(path, file);
        const { data } = supabase.storage.from('resumes').getPublicUrl(path);
        payload.resume_url = data.publicUrl;
        payload.resume_name = file.name;
        setUploading(false);
      }

      if (editingId) {
        await supabase.from('jobs').update(payload).eq('id', editingId);
        showToast("Job updated", "success");
      } else {
        payload.user_id = session!.user.id;
        await supabase.from('jobs').insert([payload]);
        showToast("Application created", "success");
      }
      await fetchJobs();
      resetForm();
      setIsFormOpen(false);
    } catch (e) { showToast("Error saving", "error"); }
  };

  const deleteJob = async (id: string) => {
    if (!window.confirm("Permanently delete?")) return;
    
    if (isDemo) { 
      setJobs(jobs.filter(j => j.id !== id)); 
      showToast("Deleted (Demo)", "info");
      return; 
    }
    
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (!error) {
      setJobs(jobs.filter(j => j.id !== id));
      showToast("Deleted", "info");
    }
  };

  const resetForm = () => {
    setCompany(''); setPosition(''); setDateApplied(new Date().toISOString().split('T')[0]);
    setSalary(''); setLocation(''); setNotes(''); setFile(null); setEditingId(null);
    setCurrentTimeline([]);
  };

  const startEditing = (job: JobApplication) => {
    setEditingId(job.id); 
    setCompany(job.company); 
    setPosition(job.position); 
    setDateApplied(job.date_applied.split('T')[0]);
    setSalary(job.salary || ''); 
    setLocation(job.location || ''); 
    const cleanNotes = (job.notes || '').replace(/\[.*?\]\s*/g, '');
    setNotes(cleanNotes);
    setCurrentTimeline(job.timeline || []); 
    setIsFormOpen(true);
  };

  // --- STATS & UPCOMING LOGIC ---
  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status !== 'Rejected' && j.status !== 'Saved').length,
    offers: jobs.filter(j => j.status === 'Offer').length,
    responseRate: jobs.length > 0 ? Math.round(((jobs.filter(j => j.status === 'Interview' || j.status === 'Assessment' || j.status === 'Offer').length) / jobs.length) * 100) : 0
  };

  const upcomingEvents = jobs
    .filter(job => {
      if (!job.interview_date) return false;
      const d = new Date(job.interview_date);
      const today = new Date(); today.setHours(0,0,0,0);
      const nextWeek = new Date(); nextWeek.setDate(today.getDate() + 7);
      return d >= today && d <= nextWeek; // Next 7 days
    })
    .sort((a, b) => new Date(a.interview_date!).getTime() - new Date(b.interview_date!).getTime());

  // --- FILTER & SORT LOGIC ---
  const filteredJobs = jobs.filter(j => {
    const match = j.company.toLowerCase().includes(searchQuery.toLowerCase()) || j.position.toLowerCase().includes(searchQuery.toLowerCase());
    return filterStatus === 'All' ? match : match && j.status === filterStatus;
  }).sort((a, b) => {
    if (sortBy === 'date_applied') return new Date(b.date_applied).getTime() - new Date(a.date_applied).getTime();
    if (sortBy === 'interview_date') {
        const dateA = a.interview_date ? new Date(a.interview_date).getTime() : 0;
        const dateB = b.interview_date ? new Date(b.interview_date).getTime() : 0;
        return dateB - dateA; // Most recent interviews first
    }
    return (parseInt(b.salary || '0') || 0) - (parseInt(a.salary || '0') || 0);
  });

  const getStatusColor = (s: string) => {
    if (s === 'Offer') return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300';
    if (s === 'Rejected') return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300';
    if (s === 'Interview') return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300';
    if (s === 'Assessment') return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300';
    if (s === 'Saved') return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300';
    return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
  };

  const getRoundIcon = (notes: string) => {
    if (notes.includes('OA') || notes.includes('Coding')) return <Code2 size={14} className="text-amber-500" />;
    if (notes.includes('Technical') || notes.includes('System')) return <MonitorPlay size={14} className="text-purple-500" />;
    return <Clock size={14} className="text-gray-400" />;
  };

  // --- RENDER ---
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  if (!session && !isDemo) {
    if (showAuth) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900"><button onClick={() => setShowAuth(false)} className="mb-4 flex items-center gap-2 text-gray-500"><ArrowLeft size={16}/> Back</button><Auth /></div>;
    return <LandingPage onGetStarted={() => setShowAuth(true)} onViewDemo={handleDemoStart} theme={theme} onCycleTheme={cycleTheme} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 font-sans flex flex-col">
      
      {/* TOASTS */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border animate-in slide-in-from-right-10 fade-in ${t.type === 'success' ? 'bg-green-600 text-white border-green-700' : t.type === 'error' ? 'bg-red-600 text-white border-red-700' : 'bg-gray-800 text-white'}`}>
            {t.type === 'success' ? <CheckCircle2 size={16}/> : t.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>} <span className="text-sm font-bold">{t.message}</span>
          </div>
        ))}
      </div>

      {isDemo && <div className="bg-blue-600 text-white text-center py-2 text-sm font-bold sticky top-0 z-50">Demo Mode. Data not saved. <button onClick={handleExitDemo} className="underline ml-2">Exit</button></div>}

      {/* STAGE MODAL */}
      {isStageModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Update Status</h3>
            <p className="text-sm text-gray-500 mb-6">Log the next stage for this application.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Round / Stage</label>
                <div className="relative">
                  <select 
                    value={nextRoundType} 
                    onChange={(e) => {
                      setNextRoundType(e.target.value as RoundType);
                      if (['OA', 'Aptitude'].includes(e.target.value)) setManualStatusOverride('Assessment');
                      else if (['Technical', 'System Design', 'HR', 'Managerial', 'Phone Screen'].includes(e.target.value)) setManualStatusOverride('Interview');
                      else if (e.target.value === 'Offer') setManualStatusOverride('Offer');
                      else if (e.target.value === 'Rejected') setManualStatusOverride('Rejected');
                    }} 
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 dark:text-white appearance-none"
                  >
                    <option value="OA">Online Assessment (OA)</option>
                    <option value="Aptitude">Aptitude Test</option>
                    <option value="Phone Screen">Phone Screen</option>
                    <option value="Technical">Technical Interview</option>
                    <option value="System Design">System Design</option>
                    <option value="HR">HR / Managerial</option>
                    <option value="Offer">🎉 Offer Received</option>
                    <option value="Rejected">❌ Rejected</option>
                    <option value="Custom">Custom Stage...</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16}/>
                </div>
              </div>

              {nextRoundType === 'Custom' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Stage Name</label>
                  <input value={customStageName} onChange={(e) => setCustomStageName(e.target.value)} placeholder="e.g. Bar Raiser" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white" />
                </div>
              )}

              {nextRoundType !== 'Offer' && nextRoundType !== 'Rejected' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Date</label>
                  <input type="date" value={nextRoundDate} onChange={(e) => setNextRoundDate(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white dark:[color-scheme:dark]" />
                  <p className="text-[10px] text-gray-400 mt-1">Leave blank if TBD.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsStageModalOpen(false)} className="flex-1 py-2.5 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">Cancel</button>
              <button onClick={confirmStageChange} className="flex-1 py-2.5 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 h-16 flex justify-between items-center sticky top-0 z-40 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><LayoutDashboard size={20} /></div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">JobTracker <span className="text-blue-600">Pro</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
           <button onClick={cycleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="Toggle Theme">
             {theme === 'light' ? <Sun size={20}/> : theme === 'dark' ? <Moon size={20}/> : <Monitor size={20}/>}
           </button>

           {/* Profile: Hidden in Demo */}
           {!isDemo && (
             <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 transition-transform active:scale-95" title="View Profile">
               {userAvatar ? (
                 <img src={userAvatar} className="w-9 h-9 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover" alt="Profile" />
               ) : (
                 <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                   <User size={18}/>
                 </div>
               )}
             </button>
           )}

           {/* Logout: Acts as Exit Demo if in Demo Mode */}
           <button 
             onClick={isDemo ? handleExitDemo : () => supabase.auth.signOut()} 
             className="text-gray-400 hover:text-red-500 transition-colors p-1"
             title={isDemo ? "Exit Demo" : "Sign Out"}
           >
             <LogOut size={20}/>
           </button>
        </div>
      </nav>

      {showProfile && !isDemo && session && <Profile session={session} onClose={() => {setShowProfile(false); fetchUserProfile(session.user.id);}} />}

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6">
        
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* STATS */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Active', value: stats.active, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { label: 'Offers', value: stats.offers, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                { label: 'Total', value: stats.total, icon: Calendar, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
                { label: 'Response', value: `${stats.responseRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                  <div className={`p-2.5 w-fit rounded-lg ${stat.bg} ${stat.color} mb-3`}><stat.icon size={18} /></div>
                  <div><p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stat.value}</p><p className="text-xs text-gray-500 font-bold uppercase mt-1">{stat.label}</p></div>
                </div>
              ))}
          </div>

          {/* AGENDA */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Clock size={14}/> This Week</h3>
             <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-40">
               {upcomingEvents.length > 0 ? (
                 upcomingEvents.map(job => (
                   <div key={job.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                      <div className="mt-0.5"><AlertCircle size={14} className="text-blue-600 dark:text-blue-400"/></div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-tight">{job.company}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                           {job.notes?.match(/\[(.*?)\]/)?.[1] || 'Round'} • {new Date(job.interview_date!).toLocaleDateString(undefined, {weekday:'short', day:'numeric'})}
                        </p>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                   <Calendar size={24} className="mb-2 opacity-20" />
                   <p className="text-xs">No upcoming rounds this week.</p>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-6">
          
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search companies..." className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
               {['All', 'Saved', 'Applied', 'Assessment', 'Interview', 'Offer'].map(s => (
                 <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all ${filterStatus === s ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}>{s}</button>
               ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full xl:w-auto">
             <div className="relative">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)} 
                  className="appearance-none pl-9 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date_applied">Date Applied</option>
                  <option value="interview_date">Interview Date</option>
                  <option value="salary">Salary</option>
                </select>
                <SortDesc size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
             </div>

             <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600' : 'text-gray-400'}`}><ListIcon size={18}/></button>
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600' : 'text-gray-400'}`}><LayoutGrid size={18}/></button>
             </div>
             
             <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95">
               <Plus size={18}/> <span className="hidden sm:inline">Add</span>
             </button>
          </div>
        </div>

        {/* EDIT / ADD MODAL */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between shrink-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Application' : 'New Application'}</h3>
                <button onClick={() => setIsFormOpen(false)}><X size={20} className="text-gray-400"/></button>
              </div>
              
              <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                <form id="jobForm" onSubmit={handleSubmit} className="grid gap-4">
                   <input required value={company} onChange={(e) => setCompany(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white font-bold" placeholder="Company Name" />
                   <input required value={position} onChange={(e) => setPosition(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white" placeholder="Role / Title" />
                   <div className="grid grid-cols-2 gap-4">
                      <input value={salary} onChange={(e) => setSalary(e.target.value)} className="p-3 bg-gray-50 dark:bg-gray-900 border rounded-xl outline-none dark:border-gray-700 dark:text-white" placeholder="Salary" />
                      <input value={location} onChange={(e) => setLocation(e.target.value)} className="p-3 bg-gray-50 dark:bg-gray-900 border rounded-xl outline-none dark:border-gray-700 dark:text-white" placeholder="Location" />
                   </div>
                   
                   {/* HISTORY SECTION */}
                   {editingId && currentTimeline.length > 0 && (
                     <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mt-2">
                       <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><History size={12}/> History</h4>
                       <div className="space-y-3 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-gray-200 dark:before:bg-gray-700">
                         {currentTimeline.map((ev, i) => (
                           <div key={i} className="relative pl-5 text-sm">
                             <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 ${ev.completed ? 'bg-gray-400' : 'bg-blue-500'}`}></div>
                             <p className="font-bold text-gray-800 dark:text-gray-200">{ev.type === 'Custom' ? ev.customName : ev.type}</p>
                             <p className="text-xs text-gray-500">{ev.date ? new Date(ev.date).toLocaleDateString() : 'Date TBD'}</p>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="p-3 h-24 bg-gray-50 dark:bg-gray-900 border rounded-xl outline-none dark:border-gray-700 dark:text-white resize-none mt-2" placeholder="Notes..." />
                   
                   <div className="flex justify-between items-center pt-2">
                      <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                        <Paperclip size={16}/> {file ? file.name : "Resume"}
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      </label>
                   </div>
                </form>
              </div>
              <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
                 <button onClick={() => setIsFormOpen(false)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-gray-200">Cancel</button>
                 <button form="jobForm" disabled={uploading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 text-sm">
                    {uploading ? 'Saving...' : 'Save Changes'}
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Role & Company</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Next Round</th>
                    <th className="px-6 py-4">Applied</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredJobs.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white text-base">{job.position}</div>
                        <div className="text-gray-500 text-xs font-medium">{job.company} • {job.location || 'Remote'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block group/select">
                           <select 
                             value={job.status} 
                             onChange={(e) => initiateStageChange(job.id, e.target.value as Status)} 
                             className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border cursor-pointer outline-none transition-all ${getStatusColor(job.status)}`}
                           >
                             {['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                           <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none"/>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {job.interview_date ? (
                          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            {getRoundIcon(job.notes || '') || <Calendar size={14} className="text-blue-500"/>}
                            <span className="font-medium">{new Date(job.interview_date).toLocaleDateString()}</span>
                          </div>
                        ) : <span className="text-gray-400 text-xs italic">Pending</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(job.date_applied).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {job.resume_url && <a href={job.resume_url} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 bg-gray-100 dark:bg-gray-700 rounded-lg"><Paperclip size={16}/></a>}
                          <button onClick={() => startEditing(job)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-100 dark:bg-gray-700 rounded-lg"><Edit size={16}/></button>
                          <button onClick={() => deleteJob(job.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-100 dark:bg-gray-700 rounded-lg"><Trash size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredJobs.length === 0 && <div className="p-12 text-center text-gray-400">No jobs found in this category.</div>}
            </div>
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} onDelete={deleteJob} onStatusChange={(id, s) => initiateStageChange(id, s)} onEdit={startEditing} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}