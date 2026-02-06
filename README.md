# 🚀 JobTracker Pro

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

> **A secure, full-stack SaaS application for tracking job applications with real-time updates and enterprise-grade data privacy.**

🔗 **[View Live Demo](https://job-tracker-six-iota.vercel.app/)**

---

## 📖 About The Project

**JobTracker Pro** solves the chaos of job hunting. Instead of managing messy spreadsheets, users get a dedicated, private dashboard to track every stage of their application process—from "Applied" to "Offer."

Built with a focus on security and scalability, this application uses **Row Level Security (RLS)** in PostgreSQL to ensure that every user's data is completely isolated. Even though it is a single-page application, it functions as a multi-tenant SaaS platform where thousands of users can manage their private data securely.

### 🌟 Key Features

* **🔐 Private User Accounts:** Full authentication system (Sign Up/Login) powered by Supabase Auth.
* **🛡️ Enterprise Security:** Data isolation implemented at the database level using PostgreSQL Row Level Security (RLS) policies.
* **📊 Interactive Kanban-Style Tracking:** Instantly update application status (Applied, Interview, Rejected, Offer).
* **⚡ Real-Time Performance:** Instant data fetching and state updates using React Hooks.
* **📱 Responsive UI:** A modern, mobile-friendly interface built with Tailwind CSS and Lucide Icons.

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Fast, component-based UI library |
| **Language** | TypeScript | Type-safe JavaScript for robust code |
| **Styling** | Tailwind CSS | Utility-first CSS framework for rapid design |
| **Backend** | Supabase | Open-source Firebase alternative (PostgreSQL) |
| **Auth** | Supabase Auth | Secure email/password authentication |
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
-- a. Create the Jobs table
create table jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company text not null,
  position text not null,
  status text not null,
  date_applied date not null default CURRENT_DATE,
  user_id uuid references auth.users not null default auth.uid()
);

-- b. Enable Row Level Security (Security Wall)
alter table jobs enable row level security;

-- c. Create Access Policy (The "Private Key")
create policy "User can only access their own jobs"
  on jobs for all
  using (auth.uid() = user_id);
```
### 5. Run the App
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