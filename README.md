# 🚀 JobTracker Pro

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Vite PWA](https://img.shields.io/badge/Vite_PWA-FFC0CB?style=for-the-badge&logo=vite&logoColor=white)

**JobTracker Pro** is a full-stack career management platform designed to help developers and professionals organize their job search and showcase their portfolio. It combines a powerful **Application Tracking System (ATS)** with a beautiful, public-facing **Portfolio Page**.

🔗 **[View Live Demo](https://job-tracker-six-iota.vercel.app/)**

---

## 🌟 Features

### 💼 Career Dashboard
* **Job Tracking:** Log applications with details like Company, Position, Salary, and Status.
* **Kanban Board:** Drag-and-drop board to visualize your application pipeline (Applied → Interview → Offer).
* **Analytics:** Real-time metrics on your response rate, total applications, and interview schedule.
* **Resume Management:** Attach specific resumes to specific job applications.
* **Calendar Integration:** "This Week" widget to track upcoming interviews.

### 🌎 Public Portfolio
* **Personalized URL:** Share your profile via `jobtracker.pro/p/yourname`.
* **Rich Profile:** Showcase your Bio, Experience, Education, and Skills.
* **Project Showcase:** Add featured projects with tech stacks and links.
* **Social Hub:** Link up to 5 social profiles (GitHub, LinkedIn, Twitter, etc.).
* **Customization:** Upload custom Cover Images and Avatars.

### 🛡️ Security & Tech
* **Authentication:** Secure login via Google, GitHub, or Magic Link (Email).
* **Smart Sync:** Automatically syncs avatar and name from Google/GitHub.
* **Row Level Security (RLS):** Users can only see and edit their own private data.
* **Dark Mode:** Fully responsive UI with System/Dark/Light theme switching.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS, Lucide React (Icons)
* **Backend & Auth:** Supabase (PostgreSQL)
* **Storage:** Supabase Storage (for Resumes & Images)
* **Routing:** React Router DOM

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
Create a .env file in the root directory and add your Supabase keys. (You can find these in your Supabase Dashboard under Settings > API)
```Code Snippet
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```
### 4. Run the App
```Bash
npm run dev
```
Open http://localhost:5173 to view it in the browser.

---

## ⚡ Supabase Database Setup (SQL)

To make the app work, you need to run these commands in your **Supabase SQL Editor**. This sets up the tables, security policies, and automatic profile creation.

**A. Create Tables**
```SQL
-- 1. Create Jobs Table
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  company text not null,
  position text not null,
  status text check (status in ('Applied', 'Interview', 'Offer', 'Rejected')) default 'Applied',
  date_applied date default current_date,
  interview_date timestamp with time zone,
  salary text,
  location text,
  notes text,
  resume_url text,
  resume_name text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Profiles Table (Rich Portfolio)
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
  university text,
  graduation_year text,
  skills text,
  cover_url text,
  social_links jsonb default '[]'::jsonb,
  projects jsonb default '[]'::jsonb,
  updated_at timestamp with time zone
);
```
**B. Enable Row Level Security (RLS)**
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
**C. Auto-Create Profile on Signup (Trigger)**
```SQL
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```
**D. Storage Buckets**

Run this to allow image/resume uploads:
```SQL
-- Create buckets
insert into storage.buckets (id, name, public) values 
('avatars', 'avatars', true),
('covers', 'covers', true),
('resumes', 'resumes', true);

-- Policies (Public Read, Owner Write)
create policy "Public Access" on storage.objects for select using ( bucket_id in ('avatars', 'covers') );
create policy "User Upload" on storage.objects for insert with check ( auth.uid() = owner );
```
---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  **Fork** the Project
2.  **Create** your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  **Push** to the Branch (`git push origin feature/AmazingFeature`)
5.  **Open** a Pull Request

---

## 📝 License

This project is open source. You are free to use this code for educational purposes or as a base for your own projects.

<p align="center"> © 2026 <b>Nishant Raj</b>. Powered by <b>Caffeine</b>. </p>
