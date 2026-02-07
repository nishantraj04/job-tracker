import { Briefcase, MapPin, Calendar, DollarSign, FileText, Trash2, Edit, ExternalLink, MoreVertical } from 'lucide-react';
import type{ JobApplication, Status } from '../types';
import { useState } from 'react';

interface JobCardProps {
  job: JobApplication;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: Status) => void;
  onEdit: (job: JobApplication) => void;
}

const statusColors = {
  Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Interview: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Offer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
};

export function JobCard({ job, onDelete, onStatusChange, onEdit }: JobCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleStatusClick = () => {
    const statuses: Status[] = ['Applied', 'Interview', 'Offer', 'Rejected'];
    const currentIndex = statuses.indexOf(job.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onStatusChange(job.id, nextStatus);
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all relative">
      
      {/* Top Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-lg">
            {job.company.substring(0, 1)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{job.position}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{job.company}</p>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
            <MoreVertical size={18} />
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
              <div className="absolute right-0 top-8 z-20 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden py-1">
                <button onClick={() => { onEdit(job); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <Edit size={14} /> Edit
                </button>
                <button onClick={() => onDelete(job.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <button 
        onClick={handleStatusClick} 
        className={`text-xs font-semibold px-2.5 py-1 rounded-full border mb-4 inline-flex items-center gap-1.5 transition-colors ${statusColors[job.status]}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'Offer' ? 'bg-green-500' : job.status === 'Rejected' ? 'bg-red-500' : 'bg-current'}`}></span>
        {job.status}
      </button>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        {job.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-gray-400" /> {job.location}
          </div>
        )}
        {job.salary && (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-gray-400" /> {job.salary}
          </div>
        )}
        <div className="flex items-center gap-1.5 col-span-2">
          <Calendar size={14} className="text-gray-400" /> Applied: {new Date(job.date_applied).toLocaleDateString()}
        </div>
        {/* @ts-ignore */}
        {job.interview_date && (
          <div className="flex items-center gap-1.5 col-span-2 text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-md mt-1">
            <Calendar size={14} /> Interview: {new Date(job.interview_date).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
         {job.resume_url ? (
           <a href={job.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
             <FileText size={14} /> View Resume
           </a>
         ) : (
           <span className="text-xs text-gray-400 italic">No resume</span>
         )}
         
         {/* Edit Button (Quick Action) */}
         <button onClick={() => onEdit(job)} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Edit size={16} />
         </button>
      </div>
    </div>
  );
}