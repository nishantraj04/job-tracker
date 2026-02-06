import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { JobApplication } from '../types';

export const JobChart = ({ jobs }: { jobs: JobApplication[] }) => {
  const data = [
    { name: 'Applied', count: jobs.filter(j => j.status === 'Applied').length, color: '#3b82f6' },
    { name: 'Interview', count: jobs.filter(j => j.status === 'Interview').length, color: '#a855f7' },
    { name: 'Offer', count: jobs.filter(j => j.status === 'Offer').length, color: '#22c55e' },
    { name: 'Rejected', count: jobs.filter(j => j.status === 'Rejected').length, color: '#ef4444' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 transition-colors">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Application Progress</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1f2937', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};