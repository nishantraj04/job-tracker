import { useState } from 'react';
import type{ JobApplication, Status } from '../types';
import { Trash2, Briefcase, Calendar, Pencil, MapPin, DollarSign, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';

interface JobCardProps {
  job: JobApplication;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: Status) => void;
  onEdit: (job: JobApplication) => void;
}

const statusColors = {
  Applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Offer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const JobCard = ({ job, onDelete, onStatusChange, onEdit }: JobCardProps) => {
  const [showNotes, setShowNotes] = useState(false);

  // Smart Reminder Logic: If interview is coming up within 3 days
  const isInterviewSoon = job.status === 'Interview' && new Date(job.date_applied) > new Date() && 
    (new Date(job.date_applied).getTime() - new Date().getTime()) < (3 * 24 * 60 * 60 * 1000);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-5 hover:shadow-md transition-all relative ${isInterviewSoon ? 'border-purple-400 ring-1 ring-purple-400' : 'border-gray-200 dark:border-gray-700'}`}>
      
      {isInterviewSoon && (
        <div className="absolute -top-3 right-4 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-sm">
          Upcoming Interview!
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{job.company}</h3>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <Briefcase size={14} />
              <span>{job.position}</span>
            </div>
            {job.location && (
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs">
                <MapPin size={12} />
                <span>{job.location}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
          {job.status}
        </div>
      </div>

      <div className="flex items-center gap-4 text-gray-400 text-xs mb-4">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{job.date_applied}</span>
        </div>
        {job.salary && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
            <DollarSign size={14} />
            <span>{job.salary}</span>
          </div>
        )}
      </div>

      {/* Resume & Notes Toggles */}
      <div className="flex gap-3 mb-4">
        {job.resume_url && (
          <a 
            href={job.resume_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md"
          >
            <Download size={12} />
            {job.resume_name || 'Resume'}
          </a>
        )}
        {job.notes && (
          <button 
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <FileText size={12} />
            {showNotes ? 'Hide Notes' : 'Show Notes'}
            {showNotes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {/* Expandable Notes Section */}
      {showNotes && job.notes && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap border border-gray-100 dark:border-gray-700">
          {job.notes}
        </div>
      )}

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <select
          value={job.status}
          onChange={(e) => onStatusChange(job.id, e.target.value as Status)}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        <div className="flex gap-2">
          <button onClick={() => onEdit(job)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg">
            <Pencil size={18} />
          </button>
          <button onClick={() => onDelete(job.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};