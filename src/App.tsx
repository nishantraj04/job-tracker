import { useState, useEffect } from 'react';
import { PlusCircle, LayoutDashboard, Loader2, LogOut, Search, Filter, Save, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import type { JobApplication, Status } from './types';
import { JobCard } from './components/JobCard';
import { Auth } from './components/Auth';
import type { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null); // Tracks which job we are editing

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
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

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handles both ADD and UPDATE logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position || !session) return;

    try {
      if (editingId) {
        // UPDATE Existing Job
        const { error } = await supabase
          .from('jobs')
          .update({ company, position })
          .eq('id', editingId);

        if (error) throw error;

        // Update local state instantly
        setJobs(jobs.map(job => 
          job.id === editingId ? { ...job, company, position } : job
        ));
        
        // Reset form
        setEditingId(null);
      } else {
        // CREATE New Job
        const newJob = {
          company,
          position,
          status: 'Applied',
          date_applied: new Date().toISOString().split('T')[0],
          user_id: session.user.id
        };

        const { data, error } = await supabase.from('jobs').insert([newJob]).select();
        if (error) throw error;
        if (data) setJobs([data[0], ...jobs]);
      }

      // Clear inputs
      setCompany('');
      setPosition('');
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const startEditing = (job: JobApplication) => {
    setEditingId(job.id);
    setCompany(job.company);
    setPosition(job.position);
    // Scroll to top so user sees the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCompany('');
    setPosition('');
  };

  const deleteJob = async (id: string) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (!error) setJobs(jobs.filter(job => job.id !== id));
  };

  const updateStatus = async (id: string, newStatus: Status) => {
    const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setJobs(jobs.map(job => (job.id === id ? { ...job, status: newStatus } : job)));
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
      job.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 hidden sm:block">JobTracker Pro</h1>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-gray-500 hidden sm:block">{session.user.email}</span>
           <button onClick={() => supabase.auth.signOut()} className="text-sm font-medium text-gray-600 hover:text-red-600 flex items-center gap-2">
             <LogOut size={16} /> Sign Out
           </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-sm">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-sm">Active Interviews</p>
              <p className="text-2xl font-bold text-purple-600">{jobs.filter(j => j.status === 'Interview').length}</p>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-sm">Offers</p>
              <p className="text-2xl font-bold text-green-600">{jobs.filter(j => j.status === 'Offer').length}</p>
           </div>
        </div>

        {/* Dynamic Form (Add or Edit) */}
        <div className={`p-6 rounded-xl shadow-sm border mb-8 transition-colors ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold ${editingId ? 'text-blue-700' : 'text-gray-800'}`}>
              {editingId ? 'Edit Application' : 'Track New Application'}
            </h2>
            {editingId && (
              <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
                <X size={16} /> Cancel
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-4 flex-col sm:flex-row">
            <input
              type="text"
              placeholder="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              disabled={loading}
              className={`text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-black'
              }`}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : editingId ? <Save size={20} /> : <PlusCircle size={20} />}
              {editingId ? 'Update' : 'Add'}
            </button>
          </form>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              onDelete={deleteJob} 
              onStatusChange={updateStatus} 
              onEdit={startEditing} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;