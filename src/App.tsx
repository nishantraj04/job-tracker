import { useState, useEffect } from 'react';
import { PlusCircle, LayoutDashboard, Loader2, LogOut, Search, Filter, Save, X, Calendar, Moon, Sun, Kanban, LayoutGrid, Upload, MapPin, DollarSign, FileText } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'board'>('grid');
  
  // Form State
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]); 
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') { setDarkMode(true); document.documentElement.classList.add('dark'); }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchJobs(); else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchJobs(); else setJobs([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } 
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  };

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (!error) setJobs(data || []);
    setLoading(false);
  };

  const uploadResume = async (userId: string): Promise<{ url: string, name: string } | null> => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);
    const { error: uploadError } = await supabase.storage.from('resumes').upload(filePath, file);
    setUploading(false);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
    return { url: data.publicUrl, name: file.name };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position || !session) return;

    try {
      let resumeData = null;
      if (file) {
        resumeData = await uploadResume(session.user.id);
      }

      const jobData: any = { company, position, date_applied: dateApplied, salary, location, notes };
      if (resumeData) {
        jobData.resume_url = resumeData.url;
        jobData.resume_name = resumeData.name;
      }

      if (editingId) {
        const { error } = await supabase.from('jobs').update(jobData).eq('id', editingId);
        if (error) throw error;
        setJobs(jobs.map(job => job.id === editingId ? { ...job, ...jobData } : job));
        setEditingId(null);
      } else {
        jobData.status = 'Applied';
        jobData.user_id = session.user.id;
        const { data, error } = await supabase.from('jobs').insert([jobData]).select();
        if (error) throw error;
        if (data) setJobs([data[0], ...jobs]);
      }
      resetForm();
    } catch (error) { console.error('Error saving job:', error); }
  };

  const resetForm = () => {
    setCompany(''); setPosition(''); setDateApplied(new Date().toISOString().split('T')[0]);
    setSalary(''); setLocation(''); setNotes(''); setFile(null); setEditingId(null);
  };

  const startEditing = (job: JobApplication) => {
    setEditingId(job.id); setCompany(job.company); setPosition(job.position); setDateApplied(job.date_applied);
    setSalary(job.salary || ''); setLocation(job.location || ''); setNotes(job.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const getJobsByStatus = (status: Status) => filteredJobs.filter(job => job.status === status);

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 pb-20">
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
        {/* Form Section */}
        <div className={`p-6 rounded-xl shadow-sm border mb-8 transition-all ${editingId ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
           <div className="flex justify-between items-center mb-4">
             <h2 className={`text-lg font-bold flex items-center gap-2 ${editingId ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-white'}`}>
               {editingId ? <><Save size={20}/> Edit Application</> : <><PlusCircle size={20}/> Track New Job</>}
             </h2>
             {editingId && <button onClick={resetForm} className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 flex items-center gap-1"><X size={14} /> Cancel</button>}
           </div>
           
           <form onSubmit={handleSubmit} className="flex flex-col gap-4">
             <div className="flex flex-col sm:flex-row gap-4">
               <input type="text" placeholder="Company *" required value={company} onChange={(e) => setCompany(e.target.value)} className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
               <input type="text" placeholder="Position *" required value={position} onChange={(e) => setPosition(e.target.value)} className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
             </div>
             
             <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex-1 relative">
                 <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                 <input type="text" placeholder="Salary (e.g. $80k)" value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
               </div>
               <div className="flex-1 relative">
                 <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                 <input type="text" placeholder="Location (e.g. Remote)" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
               </div>
               <div className="flex-1 relative">
                  <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input type="date" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-600 dark:text-gray-200 dark:bg-gray-700" />
               </div>
             </div>

             <div className="relative">
                <textarea placeholder="Notes, interview questions, or thoughts..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 h-24 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white resize-none" />
             </div>

             <div className="flex flex-col sm:flex-row gap-4 items-center">
               <div className="flex-1 w-full relative">
                 <label className="flex items-center gap-2 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                   <Upload size={20} className="text-gray-400" />
                   <span className="text-gray-500 dark:text-gray-400 text-sm truncate">{file ? file.name : "Attach Resume / Cover Letter (PDF)"}</span>
                   <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="hidden" />
                 </label>
               </div>
               <button type="submit" disabled={loading || uploading} className={`flex-1 w-full text-white px-6 py-3 rounded-lg font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700'}`}>
                 {loading || uploading ? <Loader2 size={20} className="animate-spin" /> : editingId ? 'Update' : 'Add Application'}
               </button>
             </div>
           </form>
        </div>
        
        {/* Controls & List (Same as before) */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm dark:bg-gray-800 dark:text-white" />
          </div>
          <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
             <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md flex items-center gap-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}><LayoutGrid size={20} /><span className="text-sm font-medium hidden sm:block">Grid</span></button>
             <button onClick={() => setViewMode('board')} className={`p-2 rounded-md flex items-center gap-2 ${viewMode === 'board' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}><Kanban size={20} /><span className="text-sm font-medium hidden sm:block">Board</span></button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map(job => <JobCard key={job.id} job={job} onDelete={deleteJob} onStatusChange={updateStatus} onEdit={startEditing} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
            {(['Applied', 'Interview', 'Offer', 'Rejected'] as Status[]).map((status) => (
              <div key={status} className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 min-h-[500px]">
                <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-gray-700 dark:text-gray-200">{status}</h3><span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">{getJobsByStatus(status).length}</span></div>
                <div className="flex flex-col gap-3">{getJobsByStatus(status).map(job => <JobCard key={job.id} job={job} onDelete={deleteJob} onStatusChange={updateStatus} onEdit={startEditing} />)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;