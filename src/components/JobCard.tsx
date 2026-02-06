import type { JobApplication, Status } from '../types';
import { Trash2, Briefcase, Calendar, Pencil } from 'lucide-react';

interface JobCardProps {
  job: JobApplication;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: Status) => void;
  onEdit: (job: JobApplication) => void; // New prop
}

const statusColors = {
  Applied: 'bg-blue-100 text-blue-800',
  Interview: 'bg-purple-100 text-purple-800',
  Offer: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export const JobCard = ({ job, onDelete, onStatusChange, onEdit }: JobCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{job.company}</h3>
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
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

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <select
          value={job.status}
          onChange={(e) => onStatusChange(job.id, e.target.value as Status)}
          className="text-sm border border-gray-200 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        <div className="flex gap-2">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(job)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Job"
          >
            <Pencil size={18} />
          </button>
          
          {/* Delete Button */}
          <button
            onClick={() => onDelete(job.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Job"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};