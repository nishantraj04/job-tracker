// Define the stages of a specific interview round or event
export type RoundType = 
  | 'Applied'       // <--- ADDED THIS to fix the error
  | 'None' 
  | 'OA' 
  | 'Aptitude' 
  | 'Phone Screen' 
  | 'Technical' 
  | 'System Design' 
  | 'Managerial' 
  | 'HR' 
  | 'Offer' 
  | 'Rejected' 
  | 'Custom';

export interface TimelineEvent {
  id: string;
  type: RoundType;
  customName?: string; // Used if type is 'Custom'
  date?: string | null; // null means "Date TBD"
  notes?: string;
  completed: boolean;
}

export interface JobApplication {
  id: string;
  user_id: string;
  company: string;
  position: string;
  // The high-level status of the application
  status: 'Saved' | 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected';
  date_applied: string;
  salary?: string;
  location?: string;
  notes?: string;
  interview_date?: string | null; // Date of the NEXT or ACTIVE round
  resume_url?: string;
  resume_name?: string;
  created_at?: string;
  timeline?: TimelineEvent[]; // History of rounds
}

export type Status = JobApplication['status'];

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  cover_url?: string;
  headline?: string;
  header_text?: string;
  about?: string;
  location?: string;
  status?: string;
  experience?: any[];
  education?: any[];
  certifications?: any[];
  skills?: string[];
  interests?: string[];
  social_links?: any[];
}