import type { JobApplication, Status } from '../types';
import { Trash2, Briefcase, Calendar, Pencil } from 'lucide-react';

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
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{job.company}</h3>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mt-1">
            <Briefcase size={14} />
            <span>{job.position}</span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
          {job.status}
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
        <Calendar size={14} />
        <span>Applied: {job.date_applied}</span>
      </div>

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
          <button
            onClick={() => onEdit(job)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Pencil size={18} />
          </button>
          
          <button
            onClick={() => onDelete(job.id)}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};