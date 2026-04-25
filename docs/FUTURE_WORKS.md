# Product Roadmap & Future Enhancements

The current version of KPIT Task Workflow represents a solid foundation for agile management. Below are the planned iterations for scaling the platform.

## 🗓 Phase 1: Real-time Collaboration (Short Term)
- **Live Subscriptions**: Integrate Supabase Realtime to push task updates to all connected clients instantly.
- **Presence Indicators**: Show which team members are currently online and which project boards they are viewing.
- **Instant Messaging**: A task-specific chat sidebar to discuss deliverables without leaving the workspace.

## 📊 Phase 2: Analytics & Gamification (Medium Term)
- **Velocity Tracking**: Calculate how many points a team completes per week.
- **Leaderboards**: Monthly rankings of top contributors based on approved task points.
- **Skill Badges**: Automatically award badges to members based on the types of tasks they complete (e.g., 'React Master', 'SQL Ninja').

## 📱 Phase 3: Platform Expansion (Long Term)
- **Mobile Native App**: Port the React frontend to React Native for on-the-go task management.
- **Email Notifications**: Integration with SendGrid or Resend to alert users of new assignments and review decisions.
- **External Integrations**: GitHub/GitLab webhooks to automatically link commits to tasks.

## 🏗 Technical Debt & Refactoring
- **Unit Testing**: Implement Vitest/React Testing Library for critical store actions.
- **Edge Functions**: Offload heavy PDF report generation to Supabase Edge Functions.
- **Strict Role Validation**: Further refine RLS to handle multi-tenant workspaces where users can be in multiple organizations.
