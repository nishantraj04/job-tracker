import { useState, useEffect } from 'react';
import { PlusCircle, LayoutDashboard, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';
import type { JobApplication, Status } from './types';
import { JobCard } from './components/JobCard';

function App() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

  // Fetch jobs on load
  useEffect(() => {
    fetchJobs();
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
    if (!company || !position) return;

    const newJob = {
      company,
      position,
      status: 'Applied',
      date_applied: new Date().toISOString().split('T')[0],
    };

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([newJob])
        .select();

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
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setJobs(jobs.filter(job => job.id !== id));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const updateStatus = async (id: string, newStatus: Status) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setJobs(jobs.map(job => 
        job.id === id ? { ...job, status: newStatus } : job
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-6">
      {/* Header */}
      <header className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-blue-600 rounded-lg text-white">
          <LayoutDashboard size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Job Application Tracker</h1>
      </header>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Application</h2>
        <form onSubmit={addJob} className="flex gap-4 flex-col sm:flex-row">
          <input
            type="text"
            placeholder="Company Name (e.g. Google)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Position (e.g. Frontend Dev)"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />}
            Add
          </button>
        </form>
      </div>

      {/* Job List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {loading ? (
          <div className="col-span-2 flex justify-center py-10">
            <Loader2 size={40} className="animate-spin text-blue-600" />
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-center col-span-2 text-gray-400 py-10">No applications found in Supabase.</p>
        ) : (
          jobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              onDelete={deleteJob} 
              onStatusChange={updateStatus} 
            />
          ))
        )}
      </div>
    </div>
  );
}

export default App;