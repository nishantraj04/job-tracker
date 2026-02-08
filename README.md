# 🚀 JobTracker Pro

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Vite PWA](https://img.shields.io/badge/Vite_PWA-FFC0CB?style=for-the-badge&logo=vite&logoColor=white)

**JobTracker Pro** is an intelligent **Applicant Tracking System (ATS)** designed for serious job seekers. Unlike simple spreadsheets, it manages the entire lifecycle of your job search—tracking specific interview rounds, maintaining a history timeline of every status change, and organizing your upcoming schedule.

It also features a beautiful **Public Portfolio** system, allowing developers to showcase their projects and resume via a personalized URL.

🔗 **[View Live Demo](https://job-tracker-six-iota.vercel.app/)**

---

## 🌟 Features

### 🧠 Intelligent Pipeline
* **Smart Status Logic:** Automatically moves applications through stages based on activity (e.g., scheduling an "OA" moves the job to "Assessment").
* **Granular Tracking:** Track specific rounds: Online Assessment, Technical, System Design, HR, and Managerial.
* **Timeline History:** Keeps a permanent `JSON` log of every update. You can see exactly when you applied, when you finished the OA, and when the offer came in.

### 📊 Command Center Dashboard
* **Agenda Widget:** A "This Week" view that highlights upcoming interviews and deadlines.
* **Real-time Analytics:** metrics on your Active Pipeline, Response Rate, and Total Applications.
* **Dual View Modes:** Switch between a high-density List View and a visual Grid View with smart badges.

### 🌎 Public Portfolio
* **Personalized URL:** Share your profile via `jobtracker.pro/p/yourname`.
* **Rich Profile:** Showcase your Bio, Experience, Education, and Tech Stack.
* **Project Showcase:** Add featured projects with descriptions and links.
* **Social Hub:** Centralize your social profiles (GitHub, LinkedIn, Twitter, etc.).

### 🛡️ Security & Tech
* **Authentication:** Secure login via Google, GitHub, or Magic Link (Email).
* **Guest/Demo Mode:** Fully functional "Try before you sign up" mode.
* **Row Level Security (RLS):** Strict PostgreSQL policies ensure users own their data.
* **Dark Mode:** Fully responsive UI with System aware theme switching.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS, Lucide React
* **Backend & Auth:** Supabase (PostgreSQL, Auth, Storage)
* **State Management:** React Hooks
* **Deployment:** Vercel

---

## 🚀 Getting Started Locally

Follow these steps to run a copy of this project on your local machine.

### Prerequisites
* Node.js (v16 or higher)
* npm
* A free [Supabase](https://supabase.com/) account

### 1. Clone the Repository
```bash
git clone [https://github.com/nishantraj04/job-tracker.git](https://github.com/nishantraj04/job-tracker.git)
cd job-tracker
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your Supabase keys. (You can find these in your Supabase Dashboard under Settings > API)
```Code Snippet
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```
### 4. Run the App
```Bash
npm run dev
```
Open `http://localhost:5173` to view it in the browser.

---

## ⚡ Supabase Database Setup (SQL)

To make the app work, you need to run these commands in your **Supabase SQL Editor**. This enables the Timeline History and Smart Tracking features.

**A. Create Jobs Table (With History Support)**
```SQL
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  company text not null,
  position text not null,
  
  -- Updated Status Enum including 'Saved' and 'Assessment'
  status text check (status in ('Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected')) default 'Applied',
  
  date_applied timestamptz default now(),
  salary text,
  location text,
  notes text,
  
  -- CRITICAL: These fields power the Pro features
  interview_date timestamptz, -- Tracks the NEXT active round
  timeline jsonb default '[]'::jsonb, -- Stores the history of all rounds
  
  resume_url text,
  resume_name text,
  created_at timestamptz default now()
);
```
**B. Create Profiles Table (For Portfolio)**
```SQL
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  username text unique,
  headline text,
  about text,
  location text,
  website text,
  skills text[], -- Array of strings for skills
  cover_url text,
  social_links jsonb default '[]'::jsonb,
  projects jsonb default '[]'::jsonb,
  updated_at timestamptz
);
```
**C. Enable Security (RLS)**
```SQL
-- Jobs: Private (Only owner can see)
alter table jobs enable row level security;
create policy "Users can CRUD their own jobs" on jobs
  for all using (auth.uid() = user_id);

-- Profiles: Public Read, Private Update
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);
```
**D. Storage Buckets**

Go to the **Storage** section in Supabase and create a public bucket named `resumes` and one named `avatars`.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  **Fork** the Project
2.  **Create** your Feature Branch (`git checkout -b feature/NewLogic`)
3.  **Commit** your Changes (`git commit -m 'Add Smart Logic'`)
4.  **Push** to the Branch (`git push origin feature/NewLogic`)
5.  **Open** a Pull Request

---

## 📝 License

This project is open source. You are free to use this code for educational purposes or as a base for your own projects.

<p align="center"> © 2026 <b>Nishant Raj</b>. Powered by <b>Caffeine</b>. </p>
