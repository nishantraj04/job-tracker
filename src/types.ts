export type Status = 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface JobApplication {
  id: string;
  user_id: string;
  company: string;
  position: string;
  date_applied: string;
  status: Status;
  salary?: string;
  location?: string;
  notes?: string;
  resume_url?: string;
  resume_name?: string;
  interview_date?: string;
  created_at?: string;
}

export interface SocialLink {
  platform: 'github' | 'linkedin' | 'twitter' | 'website' | 'email' | 'other';
  url: string;
}

export interface Project {
  title: string;
  description: string;
  url?: string;
  tech_stack?: string;
}

// --- UPDATED USER PROFILE DEFINITION ---
export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  cover_url?: string;          // <--- New field
  headline?: string;
  about?: string;
  location?: string;
  website?: string;
  skills?: string;
  university?: string;
  graduation_year?: string;
  linkedin_url?: string;       // Legacy support
  github_url?: string;         // Legacy support
  social_links?: SocialLink[]; // <--- New field
  projects?: Project[];        // <--- New field
  experience?: any[];
}