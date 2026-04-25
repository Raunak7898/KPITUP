# KPIT Task Workflow Management System

![Project Banner](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20Zustand-blue?style=for-the-badge)

A premium, state-of-the-art task management application designed for agile teams requiring high transparency and a rigorous review cycle. This platform bridges the gap between project planning and execution through a robust database-first architecture.

## 🌟 Key Features

- **Admin Control Center**: Centralized dashboard to create projects, define user stories, and manage team members.
- **Dynamic Kanban Workflow**: Seamless task transitions from `To Do` → `In Progress` → `In Review` → `Done`.
- **Atomic Review Cycle**: Admins can approve or reject tasks with specific feedback, ensuring high-quality deliverables.
- **Premium Aesthetics**: A dark-mode first design utilizing glassmorphism, fluid animations, and a cohesive custom design system.
- **Enterprise-Grade Security**: Row Level Security (RLS) policies implemented at the database layer to ensure strict data isolation.

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: npm v9+ or Yarn
- **Supabase Account**: A project with PostgreSQL and Auth enabled

### 2. Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Raunak7898/KPITUP.git
   cd KPITUP/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the `frontend` root:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Launch Development Server**
   ```bash
   npm run dev
   ```

### 3. Database Migration (Required)
The application logic depends on custom PostgreSQL types and triggers. Run these scripts in the Supabase SQL Editor in the following order:

1. `supabase_schema.sql` (Core tables & types)
2. `supabase_profiles.sql` (User management & triggers)
3. `supabase_projects.sql` (Project structures)
4. `supabase_tasks.sql` (Workflow logic & safety triggers)
5. `supabase_policies.sql` (Baseline RLS)
6. **`supabase_migration_task_fix.sql`** (Critical fixes for recursion and point systems)

## 📁 Documentation Structure

| Document | Description |
| :--- | :--- |
| [Architecture](ARCHITECTURE.md) | Technical design decisions, state flow, and tech stack rationale. |
| [Database Schema](SCHEMA.md) | Entity-Relationship details, data types, and triggers. |
| [API Documentation](API.md) | Supabase client interaction patterns and data fetching logic. |
| [Security Model](SECURITY.md) | In-depth breakdown of RLS policies and authentication security. |
| [AI Usage](AI_USAGE.md) | Documentation of the AI-assisted development process. |
| [Future Roadmap](FUTURE_WORKS.md) | Planned features, optimizations, and scaling strategies. |

## 👥 Access Credentials
- **Admin Email**: `raunak789805@gmail.com`
- **Default Password**: `Raunak@7898`
