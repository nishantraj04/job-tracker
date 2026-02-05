import type { JobApplication } from '../types';
import { Trash2, Briefcase, Calendar } from 'lucide-react';

interface Props {
  job: JobApplication;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: JobApplication['status']) => void;
}

const statusColors = {
  Applied: 'bg-blue-100 text-blue-800',
  Interview: 'bg-purple-100 text-purple-800',
  Offer: 'bg-green-100 text-green-800',
  Rejected: 'bg-gray-100 text-gray-800',
};

export const JobCard = ({ job, onDelete, onStatusChange }: Props) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{job.company}</h3>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Briefcase size={16} />
            <span>{job.position}</span>
          </div>
        </div>
        <button 
          onClick={() => onDelete(job.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <Calendar size={14} />
          <span>{job.date_applied}</span>
        </div>
        
        <select 
          value={job.status}
          onChange={(e) => onStatusChange(job.id, e.target.value as any)}
          className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[job.status]}`}
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    </div>
  );
};