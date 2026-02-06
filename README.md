# 🚀 JobTracker Pro

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Vite PWA](https://img.shields.io/badge/Vite_PWA-FFC0CB?style=for-the-badge&logo=vite&logoColor=white)

> **A secure, full-stack SaaS application for tracking job applications with real-time analytics, file storage, and PWA capabilities.**

🔗 **[View Live Demo](https://job-tracker-six-iota.vercel.app/)**

---

## 📖 About The Project

**JobTracker Pro** transforms the chaotic job hunt into a streamlined, professional workflow. Unlike simple spreadsheets, this is a full **Progressive Web App (PWA)** that offers enterprise-grade data privacy, file management for resumes, and visual analytics to track your progress.

Built with a "Privacy First" architecture, it uses **Row Level Security (RLS)** in PostgreSQL to ensure that every user's data—and their uploaded documents—are mathematically isolated and secure.

### 🌟 Key Features

* **📱 Progressive Web App (PWA):** Fully installable on mobile and desktop devices with native-like performance.
* **📂 File Storage System:** Integrated with Supabase Storage to securely upload and retrieve PDF resumes and cover letters.
* **📋 Kanban Board & Grid Views:** Switch instantly between a visual Drag-and-Drop style board and a data-rich grid view.
* **🌓 Dark Mode:** Fully responsive light/dark theme toggle that persists user preference.
* **📈 Analytics Dashboard:** Visual bar charts (powered by Recharts) to track application progress and success rates.
* **📝 Rich Job Details:** Track salaries, locations, and detailed interview notes with expandable UI.
* **🔐 Private User Accounts:** Full authentication system (Sign Up/Login) powered by Supabase Auth.
* **🛡️ Enterprise Security:** Data isolation implemented at the database level using PostgreSQL Row Level Security (RLS).

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Fast, component-based UI library |
| **Language** | TypeScript | Type-safe JavaScript for robust code |
| **Styling** | Tailwind CSS | Utility-first CSS framework for rapid design |
| **Backend** | Supabase | Open-source Firebase alternative (PostgreSQL) |
| **Storage** | Supabase Storage | Blob storage for Resumes/PDFs |
| **Charts** | Recharts | Composable charting library for React |
| **Deployment** | Vercel | CI/CD automated deployment |

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
### 4. Database Setup (SQL)
Go to your Supabase SQL Editor and run this script to create the table and security policies:
```SQL
-- 1. Create the Jobs table with all Pro features
create table jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company text not null,
  position text not null,
  status text not null,
  date_applied date not null default CURRENT_DATE,
  salary text,
  location text,
  notes text,
  resume_url text,
  resume_name text,
  user_id uuid references auth.users not null default auth.uid()
);

-- 2. Enable Row Level Security (Security Wall)
alter table jobs enable row level security;

-- 3. Create Access Policy (The "Private Key")
create policy "User can only access their own jobs"
  on jobs for all
  using (auth.uid() = user_id);
```
### 5. Storage Setup (For Resumes)
```Bash
1. Go to Storage in your Supabase Dashboard.

2.Create a new bucket named resumes.

3.Keep it Private.

4.Add a Policy to the bucket:
  * Name: Allow authenticated uploads
  * Allowed Operations: SELECT, INSERT, UPDATE, DELETE
  * Target Roles: authenticated
```

### 6. Run the App
```Bash
npm run dev
```

Open http://localhost:5173 to view it in the browser.

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
