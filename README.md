# KPIT Task Workflow Management System

A premium, state-of-the-art task management application built for high-performance teams. This system enables admins to manage projects and members, while empowering contributors to track and submit their work through a rigorous review cycle.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase Project

### 2. Local Setup

1.  **Clone the repository**:
    ```bash
    git clone [repository-url]
    cd KPIT/frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the `frontend` directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the app**:
    ```bash
    npm run dev
    ```

### 3. Database Setup (Crucial)

To make the workflow operational, you must execute the following SQL scripts in your Supabase SQL Editor in order:

1.  `supabase_schema.sql` (Tables and Types)
2.  `supabase_profiles.sql` (Profile logic)
3.  `supabase_projects.sql` (Project logic)
4.  `supabase_tasks.sql` (Task logic and triggers)
5.  `supabase_policies.sql` (Basic RLS)
6.  **`supabase_migration_task_fix.sql`** (Final fixes for workflow, points, and recursion)

## 🏗 Documentation Index

- [Architecture & Design Decisions](ARCHITECTURE.md)
- [Database Schema](SCHEMA.md)
- [API Documentation](API.md)
- [Security Considerations](SECURITY.md)
- [AI Usage Note](AI_USAGE.md)
- [Future Roadmap](FUTURE_WORKS.md)

## 📋 Features

- **Admin Dashboard**: Create projects, define user stories, and assign tasks.
- **Member Workflow**: Accept tasks, move to in-progress, and submit for review.
- **Review System**: Admin can approve or reject tasks with feedback.
- **Premium UI**: Dark-mode focused design with smooth transitions and high-end aesthetics.
- **Secure by Design**: Row Level Security (RLS) ensures data privacy at the database level.

## 👥 Admin Credentials
- **Email**: `raunak789805@gmail.com`
- **Password**: `Raunak@7898`
