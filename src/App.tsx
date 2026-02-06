import { useState, useEffect } from 'react';
import { PlusCircle, LayoutDashboard, Loader2, LogOut, Search, Filter, Save, X, Calendar, Moon, Sun, Kanban, LayoutGrid } from 'lucide-react';
import { supabase } from './supabaseClient';
import type{ JobApplication, Status } from './types';
import { JobCard } from './components/JobCard';
import { JobChart } from './components/JobChart';
import { Auth } from './components/Auth';
import type { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // View Mode: 'grid' or 'board'
  const [viewMode, setViewMode] = useState<'grid' | 'board'>('grid');
  
  // Form State
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]); 
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchJobs();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchJobs();
      else setJobs([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position || !session) return;
    try {
      if (editingId) {
        const { error } = await supabase.from('jobs').update({ company, position, date_applied: dateApplied }).eq('id', editingId);
        if (error) throw error;
        setJobs(jobs.map(job => job.id === editingId ? { ...job, company, position, date_applied: dateApplied } : job));
        setEditingId(null);
      } else {
        const newJob = { company, position, status: 'Applied', date_applied: dateApplied, user_id: session.user.id };
        const { data, error } = await supabase.from('jobs').insert([newJob]).select();
        if (error) throw error;
        if (data) setJobs([data[0], ...jobs]);
      }
      setCompany(''); setPosition(''); setDateApplied(new Date().toISOString().split('T')[0]);
    } catch (error) { console.error('Error saving job:', error); }
  };

  const startEditing = (job: JobApplication) => {
    setEditingId(job.id); setCompany(job.company); setPosition(job.position); setDateApplied(job.date_applied);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null); setCompany(''); setPosition(''); setDateApplied(new Date().toISOString().split('T')[0]);
  };

  const deleteJob = async (id: string) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (!error) setJobs(jobs.filter(job => job.id !== id));
  };

  const updateStatus = async (id: string, newStatus: Status) => {
    const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', id);
    if (!error) setJobs(jobs.map(job => (job.id === id ? { ...job, status: newStatus } : job)));
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.company.toLowerCase().includes(searchQuery.toLowerCase()) || job.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Kanban Columns Helper
  const getJobsByStatus = (status: Status) => filteredJobs.filter(job => job.status === status);

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 pb-20">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white"><LayoutDashboard size={20} /></div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">JobTracker Pro</h1>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
             {darkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>
           <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">{session.user.email}</span>
           <button onClick={() => supabase.auth.signOut()} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 flex items-center gap-2">
             <LogOut size={16} /> Sign Out
           </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{jobs.length}</p>
           </div>
           <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Interviews</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{jobs.filter(j => j.status === 'Interview').length}</p>
           </div>
           <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Offers</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{jobs.filter(j => j.status === 'Offer').length}</p>
           </div>
        </div>

        {/* Form & Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className={`lg:col-span-2 p-6 rounded-xl shadow-sm border transition-all ${editingId ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${editingId ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-white'}`}>
                {editingId ? <><Save size={20}/> Edit Application</> : <><PlusCircle size={20}/> Track New Job</>}
              </h2>
              {editingId && (
                <button onClick={cancelEdit} className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 flex items-center gap-1 bg-white dark:bg-gray-700 px-3 py-1 rounded-md border dark:border-gray-600 shadow-sm">
                  <X size={14} /> Cancel
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input type="text" placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
                <input type="text" placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                 <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input type="date" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-600 dark:text-gray-200 dark:bg-gray-700" />
                 </div>
                 <button type="submit" disabled={loading} className={`flex-1 text-white px-6 py-3 rounded-lg font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700'}`}>
                   {loading ? <Loader2 size={20} className="animate-spin" /> : editingId ? 'Update' : 'Add'}
                 </button>
              </div>
            </form>
          </div>
          <div className="lg:col-span-1 h-full">
            <JobChart jobs={jobs} />
          </div>
        </div>

        {/* Control Bar: Search + View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input type="text" placeholder="Search companies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm dark:bg-gray-800 dark:text-white" />
          </div>
          
          {/* View Toggles */}
          <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-2 rounded-md transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
             >
               <LayoutGrid size={20} />
               <span className="text-sm font-medium hidden sm:block">Grid</span>
             </button>
             <button 
               onClick={() => setViewMode('board')}
               className={`p-2 rounded-md transition-all flex items-center gap-2 ${viewMode === 'board' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
             >
               <Kanban size={20} />
               <span className="text-sm font-medium hidden sm:block">Board</span>
             </button>
          </div>
        </div>

        {/* VIEW RENDERER */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} onDelete={deleteJob} onStatusChange={updateStatus} onEdit={startEditing} />
            ))}
            {filteredJobs.length === 0 && (
              <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">No jobs found.</p>
            )}
          </div>
        ) : (
          /* Board View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
            {(['Applied', 'Interview', 'Offer', 'Rejected'] as Status[]).map((status) => (
              <div key={status} className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 min-h-[500px]">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-gray-700 dark:text-gray-200">{status}</h3>
                   <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                     {getJobsByStatus(status).length}
                   </span>
                </div>
                <div className="flex flex-col gap-3">
                  {getJobsByStatus(status).map(job => (
                    <JobCard key={job.id} job={job} onDelete={deleteJob} onStatusChange={updateStatus} onEdit={startEditing} />
                  ))}
                  {getJobsByStatus(status).length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-gray-400 text-sm">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;