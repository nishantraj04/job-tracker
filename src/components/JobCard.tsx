import { 
  Calendar, MapPin, DollarSign, Trash2, Edit, 
  Clock, Code2, MonitorPlay, Users, Bookmark, 
  ChevronDown
} from 'lucide-react';
import type { JobApplication, Status } from '../types';

interface JobCardProps {
  job: JobApplication;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
  onEdit: (job: JobApplication) => void;
}

export function JobCard({ job, onDelete, onStatusChange, onEdit }: JobCardProps) {
  
  // --- HELPER: DETECT ROUND TYPE FROM NOTES ---
  const getRoundBadge = () => {
    const n = job.notes || '';
    if (n.includes('[OA]') || n.includes('[Coding]')) 
      return <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200"><Code2 size={10}/> Coding</span>;
    if (n.includes('[System Design]')) 
      return <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200"><MonitorPlay size={10}/> System</span>;
    if (n.includes('[Technical]')) 
      return <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200"><MonitorPlay size={10}/> Tech</span>;
    if (n.includes('[HR]') || n.includes('[Managerial]')) 
      return <span className="flex items-center gap-1 text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200"><Users size={10}/> HR</span>;
    if (n.includes('[Aptitude]')) 
      return <span className="flex items-center gap-1 text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded border border-orange-200"><Clock size={10}/> Aptitude</span>;
    return null;
  };

  // --- HELPER: DATE URGENCY ---
  const getDateStatus = () => {
    if (!job.interview_date) return null;
    const interview = new Date(job.interview_date);
    const today = new Date();
    const diff = Math.ceil((interview.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return 'text-gray-400'; // Past
    if (diff <= 1) return 'text-red-600 font-bold animate-pulse'; // Urgent
    if (diff <= 7) return 'text-amber-600 font-bold'; // Upcoming
    return 'text-blue-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Offer': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'Interview': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'Assessment': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      case 'Saved': return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
      default: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    }
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col h-full">
      
      {/* Top Row: Company & Menu */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
             <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight truncate pr-2">{job.company}</h3>
             {job.status === 'Saved' && <Bookmark size={16} className="text-gray-400 fill-gray-100 dark:fill-gray-800 shrink-0" />}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate">{job.position}</p>
        </div>
        
        {/* Hover Actions */}
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 pl-2">
          <button onClick={() => onEdit(job)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 dark:bg-gray-700 rounded-md transition-colors"><Edit size={14}/></button>
          <button onClick={() => onDelete(job.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-gray-700 rounded-md transition-colors"><Trash2 size={14}/></button>
        </div>
      </div>

      {/* Tags Row */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${getStatusColor(job.status)}`}>
          {job.status}
        </span>
        {getRoundBadge()}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
        {job.salary && (
          <div className="flex items-center gap-1.5">
            <DollarSign size={13} className="text-gray-400" />
            <span className="font-mono truncate">{job.salary}</span>
          </div>
        )}
        {job.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-gray-400" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 col-span-2">
          <Clock size={13} className="text-gray-400" />
          <span>Applied: {new Date(job.date_applied).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Footer: Date or Status Changer */}
      {job.interview_date ? (
        <div className={`mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 ${getDateStatus()}`}>
          <Calendar size={14} />
          <span className="text-xs font-bold">
            {job.status === 'Assessment' ? 'Test Due:' : 'Interview:'} {new Date(job.interview_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ) : (
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 relative">
           <select 
             value={job.status}
             onChange={(e) => onStatusChange(job.id, e.target.value as Status)}
             className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md py-1.5 pl-2 pr-8 outline-none cursor-pointer hover:border-blue-400 transition-colors appearance-none font-medium text-gray-600 dark:text-gray-300"
           >
             <option value="Saved">Saved</option>
             <option value="Applied">Applied</option>
             <option value="Assessment">Assessment</option>
             <option value="Interview">Interview</option>
             <option value="Offer">Offer</option>
             <option value="Rejected">Rejected</option>
           </select>
           <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-[20%] text-gray-400 pointer-events-none" />
        </div>
      )}
    </div>
  );
}