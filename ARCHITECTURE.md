# KPIT Task Workflow - Architecture & Design Decisions

This document outlines the architectural patterns, design decisions, and tradeoffs made during the development of the KPIT Task Management System.

## Technology Stack

- **Frontend**: React (with TypeScript)
- **Bundler**: Vite
- **State Management**: Zustand (with Persist Middleware)
- **Styling**: Vanilla CSS (Premium Custom Design System)
- **Icons**: Lucide React
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Storage**: Supabase Storage (for avatars/attachments)

## Architecture Overview

The application follows a **DB-First Architecture**. While the frontend maintains a local state via Zustand for responsiveness, the "Source of Truth" is always the Supabase PostgreSQL database.

### Key Architectural Layers:

1.  **State Layer (Zustand)**:
    - Centralizes all application state (projects, tasks, members, notifications).
    - Uses the `persist` middleware to ensure state survives page refreshes.
    - Handles asynchronous interactions with Supabase, providing a bridge between the UI and the Database.

2.  **Database Layer (Supabase/PostgreSQL)**:
    - Uses relational schema to enforce data integrity.
    - Implements **Row Level Security (RLS)** to handle authorization at the database level.
    - Uses **PostgreSQL Triggers** for automated workflows (e.g., creating profiles on signup, updating timestamps, auto-linking project owners).

3.  **UI Component Layer**:
    - Built using a custom design system focused on high-end aesthetics (glassmorphism, vibrant gradients, micro-animations).
    - Components are decoupled from business logic, interacting with the system through Zustand hooks.

## Design Decisions & Tradeoffs

### 1. Zustand vs. Redux
- **Decision**: Used Zustand.
- **Rationale**: Zustand provides a much simpler boilerplate while still being highly performant. Given the rapid development requirement, the reduced complexity of Zustand allowed for faster iteration on the task workflow logic.

### 2. DB-First vs. Local-First (Offline Sync)
- **Decision**: DB-First.
- **Rationale**: For a collaborative task management tool, consistency is critical. By waiting for Supabase confirmation before final state updates (or using optimistic updates with a DB refresh), we avoid complex conflict resolution logic required for offline-first apps.

### 3. RLS-Driven Security
- **Decision**: Implementing all authorization logic inside Supabase RLS.
- **Rationale**: This ensures that even if the frontend is compromised, the data remains secure. The backend enforces that a member can only see projects they are assigned to, and only admins can approve tasks.

### 4. Vanilla CSS over Tailwind
- **Decision**: Vanilla CSS.
- **Rationale**: To achieve a "Wowed" premium aesthetic with complex gradients and unique animations, Vanilla CSS offers more fine-grained control over the design tokens without the constraints of utility classes.

## Tradeoffs

- **Manual Refreshes**: Currently, the app relies on manual `fetchProjects` calls after mutations. While Supabase supports Real-time channels, we prioritized atomic consistency for the initial version to ensure the workflow transitions (ToDo -> Review -> Done) were 100% reliable before adding real-time overhead.
- **Client-Side Data Mapping**: The app maps DB enums (lowercase) to UI strings (Title Case) on the client. This keeps the DB clean while providing a user-friendly interface, though it requires maintenance in the `store.ts` mapping helpers.
