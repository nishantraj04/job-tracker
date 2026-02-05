export type Status = 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface JobApplication {
  id: string;
  created_at?: string;
  company: string;
  position: string;
  status: Status;
  date_applied: string;
}