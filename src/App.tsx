import { useState, useEffect } from 'react';
import { PlusCircle, LayoutDashboard, Loader2, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';
import type { JobApplication, Status } from './types';
import { JobCard } from './components/JobCard';
import { Auth } from './components/Auth';
import type { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

  useEffect(() => {
    // 1. Check for active session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchJobs();
      else setLoading(false);
    });

    // 2. Listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchJobs();
      else setJobs([]); // Clear jobs on logout
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

  const addJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position || !session) return;

    const newJob = {
      company,
      position,
      status: 'Applied',
      date_applied: new Date().toISOString().split('T')[0],
      user_id: session.user.id // This is critical: Link job to USER
    };

    try {
      const { data, error } = await supabase.from('jobs').insert([newJob]).select();
      if (error) throw error;
      if (data) {
        setJobs([data[0], ...jobs]);
        setCompany('');
        setPosition('');
      }
    } catch (error) {
      console.error('Error adding job:', error);
    }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // If no user is logged in, show the Login/Signup screen
  if (!session) {
    return <Auth />;
  }

  // If logged in, show the Dashboard
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
           <button 
             onClick={handleLogout}
             className="text-sm font-medium text-gray-600 hover:text-red-600 flex items-center gap-2"
           >
             <LogOut size={16} />
             Sign Out
           </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold mb-4">Track New Application</h2>
          <form onSubmit={addJob} className="flex gap-4 flex-col sm:flex-row">
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
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />}
              Add
            </button>
          </form>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              onDelete={deleteJob} 
              onStatusChange={updateStatus} 
            />
          ))}
        </div>
        
        {jobs.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
             <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusCircle className="text-gray-400" size={32} />
             </div>
             <p className="text-gray-500">No applications yet. Start tracking your journey!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;