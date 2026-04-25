import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Priority, Project, ProjectDeadline, ReviewDecision, Status, Task, TeamMember, User, UserStory } from './types';
import { supabase } from './lib/supabaseClient';

// ── Status / priority mapping between UI strings and DB enums ──────────────
// toDbStatus is intentionally kept for future use when updateTask needs it
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _toDbStatus = (s: Status): string =>
  ({ 'To Do': 'todo', 'In Progress': 'in_progress', 'In Review': 'in_review', 'Done': 'done' }[s] ?? 'todo');

const fromDbStatus = (s: string): Status =>
  ({ todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }[s] as Status) ?? 'To Do';

const toDbPriority = (p: Priority): string =>
  ({ Low: 'low', Medium: 'medium', High: 'high' }[p] ?? 'medium');

const fromDbPriority = (p: string): Priority =>
  ({ low: 'Low', medium: 'Medium', high: 'High' }[p] as Priority) ?? 'Medium';

export const ADMIN_EMAIL = 'raunak789805@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'Raunak@2004';

export interface Notification {
  id: string;
  message: string;
  type: 'task' | 'member' | 'project' | 'story' | 'review' | 'deadline';
  read: boolean;
  timestamp: string;
  link?: string;
}

interface CreateProjectInput {
  name: string;
  description: string;
  dueDate?: string;
}

interface CreateTaskInput {
  title: string;
  description: string;
  priority: Priority;
  assigneeId: string;
  storyId?: string;
  dueDate?: string;
  points?: number;
}

interface InviteMemberInput {
  name: string;
  email: string;
  title?: string;
}

interface CreateMemberDeadlineInput {
  projectId: string;
  memberId: string;
  title: string;
  dueDate: string;
  note?: string;
}

interface AppState {
  currentUser: User | null;
  projects: Project[];
  memberDeadlines: ProjectDeadline[];
  notifications: Notification[];
  theme: 'light' | 'dark';
  adminPassword: string;
  allMembers: TeamMember[];
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateMemberAvatar: (avatarDataUrl: string) => void;
  changeAdminPassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string };
  resetAdminPassword: (email: string, newPassword: string) => { success: boolean; message: string };
  addProject: (input: CreateProjectInput) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
  addStory: (projectId: string, story: Omit<UserStory, 'id'>) => void;
  updateStory: (projectId: string, storyId: string, updates: Partial<UserStory>) => void;
  deleteStory: (projectId: string, storyId: string) => void;
  addTask: (projectId: string, task: CreateTaskInput) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  addMember: (projectId: string, member: InviteMemberInput) => void;
  addMemberDeadline: (input: CreateMemberDeadlineInput) => { success: boolean; message: string };
  deleteMemberDeadline: (deadlineId: string) => void;
  acceptTask: (projectId: string, taskId: string) => Promise<void>;
  submitTaskForReview: (projectId: string, taskId: string) => Promise<void>;
  reviewTask: (projectId: string, taskId: string, decision: Exclude<ReviewDecision, null>, comment?: string) => Promise<void>;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  toggleTheme: () => void;
  signup: (input: { name: string; email: string; password?: string }) => Promise<{ success: boolean; message: string }>;
  initializeAuth: () => Promise<void>;
}

const createId = () => Math.random().toString(36).slice(2, 11);
const now = () => new Date().toISOString();
const humanNow = () =>
  new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const makeMember = (name: string, email: string, role: TeamMember['role'], title?: string, password?: string): TeamMember => ({
  id: createId(),
  name,
  email,
  role,
  title,
  password,
});

const adminMember = makeMember('Raunak', ADMIN_EMAIL, 'admin', 'Workspace Admin');
const aisha = { ...makeMember('Aisha Khan', 'aisha.khan@kpitup.dev', 'member', 'Frontend Engineer'), isOnline: true };
const vikram = { ...makeMember('Vikram Patel', 'vikram.patel@kpitup.dev', 'member', 'Backend Engineer'), isOnline: true };
const neha = makeMember('Neha Sharma', 'neha.sharma@kpitup.dev', 'member', 'QA Analyst');
const arjun = makeMember('Arjun Mehta', 'arjun.mehta@kpitup.dev', 'member', 'Product Designer');

const workspaceMembers = [adminMember, aisha, vikram, neha, arjun];

const buildTask = (input: {
  title: string;
  description: string;
  assignee: TeamMember;
  createdBy: TeamMember;
  priority: Priority;
  status: Status;
  storyId?: string;
  dueDate?: string;
  acceptedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewDecision?: ReviewDecision;
  reviewComment?: string;
  points?: number;
}): Task => ({
  id: createId(),
  title: input.title,
  description: input.description,
  assigneeId: input.assignee.id,
  assigneeName: input.assignee.name,
  assigneeEmail: input.assignee.email,
  assigneeAvatar: input.assignee.avatar,
  createdById: input.createdBy.id,
  createdByName: input.createdBy.name,
  priority: input.priority,
  points: input.points || (input.priority === 'High' ? 10 : input.priority === 'Medium' ? 5 : 2),
  status: input.status,
  storyId: input.storyId,
  dueDate: input.dueDate,
  createdAt: now(),
  acceptedAt: input.acceptedAt,
  submittedAt: input.submittedAt,
  reviewedAt: input.reviewedAt,
  reviewDecision: input.reviewDecision ?? null,
  reviewComment: input.reviewComment,
});

const buildDeadline = (input: {
  projectId: string;
  projectName: string;
  member: TeamMember;
  createdBy: Pick<TeamMember, 'id' | 'name'>;
  title: string;
  dueDate: string;
  note?: string;
}): ProjectDeadline => ({
  id: createId(),
  projectId: input.projectId,
  projectName: input.projectName,
  memberId: input.member.id,
  memberName: input.member.name,
  memberEmail: input.member.email,
  title: input.title,
  dueDate: input.dueDate,
  note: input.note,
  createdById: input.createdBy.id,
  createdByName: input.createdBy.name,
  createdAt: now(),
});

const defaultProjects: Project[] = [
  {
    id: 'neon-commerce',
    name: 'Neon Commerce Revamp',
    description: 'Premium storefront rebuild with a cleaner task review loop between admin and delivery team.',
    ownerId: adminMember.id,
    ownerEmail: ADMIN_EMAIL,
    dueDate: '2026-05-15',
    theme: 'from-white/12 via-white/4 to-transparent',
    members: [adminMember, aisha, vikram, neha],
    stories: [
      {
        id: 'story-1',
        title: 'As a shopper, I want a faster product page so that I can compare options quickly.',
        description: 'Focus on layout speed, merchandising, and mobile clarity.',
        status: 'In Progress',
        points: 8,
      },
      {
        id: 'story-2',
        title: 'As an admin, I want a cleaner fulfillment dashboard so that I can monitor orders.',
        description: 'Bring review metrics and critical alerts into one panel.',
        status: 'Backlog',
        points: 5,
      },
    ],
    tasks: [
      buildTask({
        title: 'Build hero merchandising grid',
        description: 'Create the new product hero grid for the first fold and responsive CTA blocks.',
        assignee: aisha,
        createdBy: adminMember,
        priority: 'High',
        status: 'To Do',
        storyId: 'story-1',
        dueDate: '2026-04-28',
      }),
      buildTask({
        title: 'Integrate catalog metrics endpoint',
        description: 'Wire the backend summary cards for the admin fulfillment overview.',
        assignee: vikram,
        createdBy: adminMember,
        priority: 'High',
        status: 'In Progress',
        storyId: 'story-2',
        dueDate: '2026-04-27',
        acceptedAt: now(),
      }),
      buildTask({
        title: 'Regression test checkout rules',
        description: 'Validate shipping, discount, and tax scenarios before release review.',
        assignee: neha,
        createdBy: adminMember,
        priority: 'Medium',
        status: 'In Review',
        dueDate: '2026-04-26',
        acceptedAt: now(),
        submittedAt: now(),
      }),
    ],
    createdAt: now(),
  },
  {
    id: 'field-ops',
    name: 'Field Ops Control Center',
    description: 'Operational tooling for distributed teams with acceptance, execution, and review gates.',
    ownerId: adminMember.id,
    ownerEmail: ADMIN_EMAIL,
    dueDate: '2026-06-02',
    theme: 'from-white/10 via-white/3 to-transparent',
    members: [adminMember, arjun, vikram, neha],
    stories: [
      {
        id: 'story-3',
        title: 'As a dispatcher, I want a calmer triage board so that I can prioritize incidents.',
        description: 'Emphasize status clarity and operator response time.',
        status: 'Review',
        points: 3,
      },
    ],
    tasks: [
      buildTask({
        title: 'Design incident review rail',
        description: 'Premium admin review surface for field issue escalations.',
        assignee: arjun,
        createdBy: adminMember,
        priority: 'Medium',
        status: 'Done',
        dueDate: '2026-04-23',
        acceptedAt: now(),
        submittedAt: now(),
        reviewedAt: now(),
        reviewDecision: 'approved',
        reviewComment: 'Approved for implementation.',
      }),
    ],
    createdAt: now(),
  },
];

const defaultMemberDeadlines: ProjectDeadline[] = [
  buildDeadline({
    projectId: 'neon-commerce',
    projectName: 'Neon Commerce Revamp',
    member: aisha,
    createdBy: adminMember,
    title: 'Responsive hero build ready for admin check-in',
    dueDate: '2026-04-29',
    note: 'Share the first polished pass before QA starts the validation cycle.',
  }),
  buildDeadline({
    projectId: 'neon-commerce',
    projectName: 'Neon Commerce Revamp',
    member: vikram,
    createdBy: adminMember,
    title: 'Catalog metrics delivery checkpoint',
    dueDate: '2026-04-30',
    note: 'Backend summary cards should be connected and ready for walkthrough.',
  }),
  buildDeadline({
    projectId: 'field-ops',
    projectName: 'Field Ops Control Center',
    member: neha,
    createdBy: adminMember,
    title: 'QA sign-off window',
    dueDate: '2026-05-02',
    note: 'Collect the rejection notes and final admin review comments in one pass.',
  }),
];

const defaultNotifications: Notification[] = [
  {
    id: createId(),
    message: 'Responsive hero build ready for admin check-in was scheduled for Aisha Khan.',
    type: 'deadline',
    read: false,
    timestamp: humanNow(),
  },
  {
    id: createId(),
    message: 'Regression test checkout rules is waiting for admin review.',
    type: 'review',
    read: false,
    timestamp: humanNow(),
  },
  {
    id: createId(),
    message: 'Vikram Patel accepted the catalog metrics task.',
    type: 'task',
    read: false,
    timestamp: humanNow(),
  },
  {
    id: createId(),
    message: 'Neon Commerce Revamp is active with 4 delivery members.',
    type: 'project',
    read: true,
    timestamp: humanNow(),
  },
];

const uniqueMembers = (projects: Project[], fallbackUser?: User | null) => {
  const map = new Map<string, TeamMember>();

  // Start with default members to ensure they are always present
  workspaceMembers.forEach(m => map.set(m.email.toLowerCase(), m));

  projects.forEach((project) => {
    project.members.forEach((member) => map.set(member.email.toLowerCase(), member));
  });

  if (fallbackUser && !map.has(fallbackUser.email.toLowerCase())) {
    map.set(fallbackUser.email.toLowerCase(), {
      id: fallbackUser.id,
      name: fallbackUser.name,
      email: fallbackUser.email,
      role: fallbackUser.role,
      avatar: fallbackUser.avatar,
    });
  }

  return Array.from(map.values());
};

const pushNotification = (state: AppState, message: string, type: Notification['type'], link?: string): Notification[] => [
  {
    id: createId(),
    message,
    type,
    read: false,
    timestamp: humanNow(),
    link,
  },
  ...state.notifications,
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      projects: [],
      memberDeadlines: [],
      notifications: [],
      theme: 'dark',
      adminPassword: DEFAULT_ADMIN_PASSWORD,
      allMembers: workspaceMembers,

      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      initializeAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Fetch all profiles from Supabase to sync the member list
        const { data: profiles } = await supabase.from('profiles').select('*');
        if (profiles) {
          const syncedMembers = profiles.map(p => ({
            id: p.id,
            name: p.full_name || p.email.split('@')[0],
            email: p.email,
            role: p.role as TeamMember['role'],
            title: p.title,
            avatar: p.avatar_url,
            isOnline: p.is_online,
            totalPoints: p.total_points,
          }));
          set({ allMembers: syncedMembers });
        }

        if (session?.user) {
          const email = session.user.email?.toLowerCase() || '';
          const isAdmin = email === ADMIN_EMAIL;
          set({
            currentUser: {
              id: session.user.id,
              name: session.user.user_metadata.full_name || session.user.user_metadata.name || email.split('@')[0],
              email,
              role: isAdmin ? 'admin' : 'member',
              isOnline: true,
            }
          });
          // Load all projects + tasks from DB
          await useStore.getState().fetchProjects();
        }

        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const email = session.user.email?.toLowerCase() || '';
            const isAdmin = email === ADMIN_EMAIL;
            set({
              currentUser: {
                id: session.user.id,
                name: session.user.user_metadata.full_name || session.user.user_metadata.name || email.split('@')[0],
                email,
                role: isAdmin ? 'admin' : 'member',
                isOnline: true,
              }
            });

            // Re-fetch profiles and all projects + tasks from DB
            const { data: latestProfiles } = await supabase.from('profiles').select('*');
            if (latestProfiles) {
              const updatedMembers = latestProfiles.map(p => ({
                id: p.id,
                name: p.full_name || p.email.split('@')[0],
                email: p.email,
                role: p.role as TeamMember['role'],
                title: p.title,
                avatar: p.avatar_url,
                isOnline: p.is_online,
                totalPoints: p.total_points,
              }));
              set({ allMembers: updatedMembers });
            }

            await useStore.getState().fetchProjects();
          } else {
            set({ currentUser: null });
          }
        });
      },

      fetchProjects: async () => {
        // Try the full query first (with tasks). If the tasks table schema isn't
        // ready yet (e.g. migration not run), fall back to projects + members only.
        let dbProjects: any[] | null = null;
        let usedFallback = false;

        try {
          const { data, error } = await supabase
            .from('projects')
            .select(`
              *,
              project_members(*, profiles(*)),
              tasks(*)
            `)
            .order('created_at', { ascending: false });

          if (error) {
            console.warn('Full project query failed, trying fallback:', error.message);
            usedFallback = true;
          } else {
            dbProjects = data;
          }
        } catch (e) {
          usedFallback = true;
        }

        // Fallback: load just projects + members (no tasks)
        if (usedFallback) {
          const { data, error } = await supabase
            .from('projects')
            .select('*, project_members(*, profiles(*))')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching projects (fallback):', error);
            return;
          }
          dbProjects = data;
        }

        if (!dbProjects) return;

        const mappedProjects: Project[] = dbProjects.map(p => {
          const members = (p.project_members || []).map((m: any) => ({
            id: m.profiles.id,
            name: m.profiles.full_name || m.profiles.email.split('@')[0],
            email: m.profiles.email,
            role: m.profiles.role as TeamMember['role'],
            avatar: m.profiles.avatar_url,
            isOnline: m.profiles.is_online,
            title: m.profiles.title,
          }));

          const tasks: Task[] = (p.tasks || []).map((t: any) => {
            const assignee = members.find((m: TeamMember) => m.id === t.assignee_id);
            return {
              id: t.id,
              title: t.title,
              description: t.description,
              assigneeId: t.assignee_id,
              assigneeName: assignee?.name || 'Unknown',
              assigneeEmail: assignee?.email || '',
              assigneeAvatar: assignee?.avatar,
              createdById: t.created_by,
              createdByName: 'Admin',
              priority: fromDbPriority(t.priority),
              points: t.points || (t.priority === 'high' ? 10 : t.priority === 'medium' ? 5 : 2),
              status: fromDbStatus(t.status),
              storyId: t.story_id,
              dueDate: t.due_date,
              createdAt: t.created_at,
              acceptedAt: t.accepted_at,
              submittedAt: t.submitted_at,
              reviewedAt: t.reviewed_at,
              reviewDecision: null,
              reviewComment: undefined,
            };
          });

          return {
            id: p.id,
            name: p.name,
            description: p.description,
            ownerId: p.owner_id,
            ownerEmail: p.owner_email,
            dueDate: p.due_date,
            theme: 'from-white/10 via-white/4 to-transparent',
            members,
            tasks,
            stories: [],
            createdAt: p.created_at,
          };
        });

        set({ projects: mappedProjects });
      },

      login: (user) =>
        set((state) => {
          const userWithStatus = { ...user, isOnline: true };
          const email = user.email.toLowerCase();
          return {
            currentUser: userWithStatus,
            projects: state.projects.map((project) => ({
              ...project,
              members: project.members.map((member) =>
                member.email.toLowerCase() === email ? { ...member, isOnline: true } : member
              ),
            })),
          };
        }),
      logout: async () => {
        await supabase.auth.signOut();
        set((state) => {
          if (!state.currentUser) return { currentUser: null };
          const email = state.currentUser.email.toLowerCase();
          return {
            currentUser: null,
            projects: state.projects.map((project) => ({
              ...project,
              members: project.members.map((member) =>
                member.email.toLowerCase() === email ? { ...member, isOnline: false } : member
              ),
            })),
          };
        });
      },
      updateUser: (updates) =>
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
        })),

      updateMemberAvatar: (avatarDataUrl) =>
        set((state) => {
          if (!state.currentUser) return state;
          const email = state.currentUser.email.toLowerCase();
          return {
            currentUser: { ...state.currentUser, avatar: avatarDataUrl },
            projects: state.projects.map((project) => ({
              ...project,
              members: project.members.map((member) =>
                member.email.toLowerCase() === email
                  ? { ...member, avatar: avatarDataUrl }
                  : member,
              ),
              tasks: project.tasks.map((task) =>
                task.assigneeEmail.toLowerCase() === email
                  ? { ...task, assigneeAvatar: avatarDataUrl }
                  : task,
              ),
            })),
          };
        }),
      changeAdminPassword: (currentPassword, newPassword) => {
        let result = { success: false, message: 'Unable to update admin password.' };

        set((state) => {
          if (state.currentUser?.role !== 'admin') {
            result = { success: false, message: 'Only admin can change the admin password.' };
            return state;
          }

          if (state.adminPassword !== currentPassword) {
            result = { success: false, message: 'Current password is incorrect.' };
            return state;
          }

          result = { success: true, message: 'Admin password updated successfully.' };
          return {
            adminPassword: newPassword,
            notifications: pushNotification(state, 'Admin password was updated from settings.', 'review'),
          };
        });

        return result;
      },
      resetAdminPassword: (email, newPassword) => {
        let result = { success: false, message: 'Unable to reset admin password.' };

        set((state) => {
          if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
            result = { success: false, message: 'Reset is only available for the admin email.' };
            return state;
          }

          result = { success: true, message: 'Admin password reset successfully. You can log in now.' };
          return {
            adminPassword: newPassword,
            notifications: pushNotification(state, 'Admin password was reset from the login screen.', 'review'),
          };
        });

        return result;
      },

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
        })),

      dismissNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((notification) => notification.id !== id),
        })),

      addProject: async (input) => {
        const state = useStore.getState();
        if (state.currentUser?.role !== 'admin') {
          return;
        }

        // Step 1: Create the project in Supabase
        const { data: project, error } = await supabase
          .from('projects')
          .insert({
            name: input.name,
            description: input.description,
            due_date: input.dueDate,
            owner_id: state.currentUser.id,
            owner_email: state.currentUser.email,
          })
          .select()
          .single();

        if (error || !project) {
          console.error('Error creating project:', error?.message);
          return;
        }

        // Step 2: Optimistically add the project to local state immediately
        //         so the admin sees it appear without waiting for the full refresh
        const optimisticProject: Project = {
          id: project.id,
          name: project.name,
          description: project.description,
          ownerId: project.owner_id,
          ownerEmail: project.owner_email,
          dueDate: project.due_date,
          theme: 'from-white/10 via-white/4 to-transparent',
          members: [{
            id: state.currentUser.id,
            name: state.currentUser.name,
            email: state.currentUser.email,
            role: 'admin',
            avatar: state.currentUser.avatar,
          }],
          tasks: [],
          stories: [],
          createdAt: project.created_at,
        };
        set((s) => ({ projects: [optimisticProject, ...s.projects] }));

        // Step 3: Fetch ALL valid profile IDs from Supabase to guard against stale
        //         local IDs (e.g. seed members whose IDs don't exist in DB)
        const { data: validProfiles } = await supabase
          .from('profiles')
          .select('id, role');

        const validProfileIds = new Set((validProfiles || []).map((p: any) => p.id));

        // Step 4: Only link members whose profile_id actually exists in DB.
        //         Use upsert per-row so one bad ID never silently fails the batch.
        const membersToLink = state.allMembers.filter(m => validProfileIds.has(m.id));

        for (const m of membersToLink) {
          const { error: linkErr } = await supabase
            .from('project_members')
            .upsert(
              { project_id: project.id, profile_id: m.id, project_role: m.role },
              { onConflict: 'project_id,profile_id' }
            );
          if (linkErr) {
            console.warn(`Could not link member ${m.email} to project:`, linkErr.message);
          }
        }

        // Step 5: Full refresh from DB to get final accurate state
        await useStore.getState().fetchProjects();

        set((s) => ({
          notifications: pushNotification(
            s,
            `Project "${input.name}" was created. ${membersToLink.length} member(s) linked.`,
            'project',
            `/project/${project.id}`
          ),
        }));
      },
      updateProject: (projectId, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId ? { ...project, ...updates } : project
          ),
        })),

      deleteProject: async (projectId) => {
        const state = useStore.getState();
        if (state.currentUser?.role !== 'admin') {
          return;
        }

        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;

        const { error } = await supabase
          .from('projects')
          .delete()
          .match({ id: projectId });

        if (error) {
          console.error('Error deleting project:', error);
          return;
        }

        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          notifications: pushNotification(state, `Project "${project.name}" was deleted from the database.`, 'project', '/projects'),
        }));
      },

      addStory: (projectId, story) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  stories: [...project.stories, { ...story, id: createId() }],
                }
              : project,
          ),
          notifications: pushNotification(state, `New user story added: "${story.title}".`, 'story', `/project/${projectId}`),
        })),

      updateStory: (projectId, storyId, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  stories: project.stories.map((story) => (story.id === storyId ? { ...story, ...updates } : story)),
                }
              : project,
          ),
        })),
      deleteStory: (projectId, storyId) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  stories: project.stories.filter((story) => story.id !== storyId),
                }
              : project
          ),
        })),

      addTask: async (projectId, taskInput) => {
        const state = useStore.getState();
        if (state.currentUser?.role !== 'admin') return;

        const project = state.projects.find((item) => item.id === projectId);
        if (!project || !state.currentUser) return;

        // Search project members first, then global list
        let assignee = project.members.find((m) => m.id === taskInput.assigneeId);
        if (!assignee) assignee = state.allMembers.find((m) => m.id === taskInput.assigneeId);
        if (!assignee) return;

        // Insert into Supabase
        const { data: dbTask, error } = await supabase
          .from('tasks')
          .insert({
            project_id: projectId,
            story_id: taskInput.storyId || null,
            title: taskInput.title,
            description: taskInput.description,
            priority: toDbPriority(taskInput.priority),
            status: 'todo',
            assignee_id: assignee.id,
            created_by: state.currentUser.id,
            due_date: taskInput.dueDate || null,
            points: taskInput.points ?? (taskInput.priority === 'High' ? 10 : taskInput.priority === 'Medium' ? 5 : 2),
          })
          .select()
          .single();

        if (error || !dbTask) {
          console.error('Error creating task:', error);
          return;
        }

        // Build the local task object from the DB response
        const task: Task = {
          id: dbTask.id,
          title: dbTask.title,
          description: dbTask.description,
          assigneeId: assignee.id,
          assigneeName: assignee.name,
          assigneeEmail: assignee.email,
          assigneeAvatar: assignee.avatar,
          createdById: state.currentUser.id,
          createdByName: state.currentUser.name,
          priority: taskInput.priority,
          points: dbTask.points,
          status: 'To Do',
          storyId: taskInput.storyId,
          dueDate: taskInput.dueDate,
          createdAt: dbTask.created_at,
          reviewDecision: null,
        };

        set((s) => ({
          projects: s.projects.map((item) => {
            if (item.id !== projectId) return item;
            const isNewToProject = !item.members.some((m) => m.id === assignee!.id);
            return {
              ...item,
              members: isNewToProject ? [...item.members, assignee!] : item.members,
              tasks: [task, ...item.tasks],
            };
          }),
          notifications: pushNotification(
            s,
            `Task "${task.title}" assigned to ${task.assigneeName} in ${project.name}.`,
            'task',
            `/project/${projectId}`
          ),
        }));
      },

      updateTask: (projectId, taskId, updates) =>
        set((state) => {
          if (state.currentUser?.role !== 'admin') {
            return state;
          }

          return {
            projects: state.projects.map((project) => {
              if (project.id !== projectId) {
                return project;
              }

              return {
                ...project,
                tasks: project.tasks.map((task) => {
                  if (task.id !== taskId) {
                    return task;
                  }

                  if (updates.assigneeId) {
                    const nextAssignee = project.members.find((member) => member.id === updates.assigneeId);
                    if (nextAssignee) {
                      return {
                        ...task,
                        ...updates,
                        assigneeId: nextAssignee.id,
                        assigneeName: nextAssignee.name,
                        assigneeEmail: nextAssignee.email,
                        assigneeAvatar: nextAssignee.avatar,
                      };
                    }
                  }

                  return { ...task, ...updates };
                }),
              };
            }),
          };
        }),

      deleteTask: (projectId, taskId) =>
        set((state) => {
          if (state.currentUser?.role !== 'admin') {
            return state;
          }

          return {
            projects: state.projects.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    tasks: project.tasks.filter((task) => task.id !== taskId),
                  }
                : project,
            ),
          };
        }),

      addMember: (projectId, memberInput) =>
        set((state) => {
          if (state.currentUser?.role !== 'admin') {
            return state;
          }

          const existing = state.projects
            .flatMap((p) => p.members)
            .find((m) => m.email.toLowerCase() === memberInput.email.toLowerCase());

          const member: TeamMember = {
            id: existing?.id || createId(),
            name: memberInput.name,
            email: memberInput.email,
            role: 'member',
            title: memberInput.title || 'Contributor',
            avatar: existing?.avatar,
          };

          return {
            projects: state.projects.map((project) => {
              if (project.id !== projectId) {
                return project;
              }

              const exists = project.members.some(
                (existingMember) => existingMember.email.toLowerCase() === member.email.toLowerCase(),
              );

              if (exists) {
                return project;
              }

              return {
                ...project,
                members: [...project.members, member],
              };
            }),
            notifications: pushNotification(
              state,
              `${member.name} was added to the delivery team.`,
              'member',
              '/members'
            ),
          };
        }),

      addMemberDeadline: (input) => {
        let result = { success: false, message: 'Unable to assign this deadline.' };

        set((state) => {
          if (state.currentUser?.role !== 'admin') {
            result = { success: false, message: 'Only admin can assign calendar deadlines.' };
            return state;
          }

          const project = state.projects.find((entry) => entry.id === input.projectId);
          const member = project?.members.find(
            (entry) => entry.id === input.memberId && entry.role === 'member',
          );

          if (!project || !member || !state.currentUser) {
            result = { success: false, message: 'Choose a valid project and member first.' };
            return state;
          }

          if (!input.title.trim() || !input.dueDate) {
            result = { success: false, message: 'Title and due date are both required.' };
            return state;
          }

          const deadline = buildDeadline({
            projectId: project.id,
            projectName: project.name,
            member,
            createdBy: {
              id: state.currentUser.id,
              name: state.currentUser.name,
            },
            title: input.title.trim(),
            dueDate: input.dueDate,
            note: input.note?.trim(),
          });

          result = { success: true, message: 'Deadline assigned successfully.' };
          return {
            memberDeadlines: [deadline, ...state.memberDeadlines],
            notifications: pushNotification(
              state,
              `${member.name} received deadline "${deadline.title}" in ${project.name}.`,
              'deadline',
              '/calendar'
            ),
          };
        });

        return result;
      },

      deleteMemberDeadline: (deadlineId) =>
        set((state) => {
          if (state.currentUser?.role !== 'admin') {
            return state;
          }

          const deadline = state.memberDeadlines.find((entry) => entry.id === deadlineId);

          if (!deadline) {
            return state;
          }

          return {
            memberDeadlines: state.memberDeadlines.filter((entry) => entry.id !== deadlineId),
            notifications: pushNotification(
              state,
              `Deadline "${deadline.title}" was removed from the calendar.`,
              'deadline',
            ),
          };
        }),

      acceptTask: async (projectId, taskId) => {
        const state = useStore.getState();
        if (!state.currentUser) return;

        const project = state.projects.find((item) => item.id === projectId);
        const task = project?.tasks.find((item) => item.id === taskId);

        if (!task || task.assigneeEmail.toLowerCase() !== state.currentUser.email.toLowerCase() || task.status !== 'To Do') return;

        const acceptedAt = now();

        // Write to Supabase
        const { error } = await supabase
          .from('tasks')
          .update({ status: 'in_progress', accepted_at: acceptedAt })
          .eq('id', taskId);

        if (error) {
          console.error('Error accepting task:', error);
          return;
        }

        set((s) => ({
          projects: s.projects.map((item) =>
            item.id === projectId
              ? {
                  ...item,
                  tasks: item.tasks.map((entry) =>
                    entry.id === taskId
                      ? { ...entry, status: 'In Progress', acceptedAt, reviewDecision: null, reviewComment: undefined }
                      : entry,
                  ),
                }
              : item,
          ),
          notifications: pushNotification(
            s,
            `${state.currentUser!.name} accepted "${task.title}" and moved it to In Progress.`,
            'task',
          ),
        }));
      },

      submitTaskForReview: async (projectId, taskId) => {
        const state = useStore.getState();
        if (!state.currentUser) return;

        const project = state.projects.find((item) => item.id === projectId);
        const task = project?.tasks.find((item) => item.id === taskId);

        if (!task || task.assigneeEmail.toLowerCase() !== state.currentUser.email.toLowerCase() || task.status !== 'In Progress') return;

        const submittedAt = now();

        // Write to Supabase
        const { error } = await supabase
          .from('tasks')
          .update({ status: 'in_review', submitted_at: submittedAt })
          .eq('id', taskId);

        if (error) {
          console.error('Error submitting task for review:', error);
          return;
        }

        set((s) => ({
          projects: s.projects.map((item) =>
            item.id === projectId
              ? {
                  ...item,
                  tasks: item.tasks.map((entry) =>
                    entry.id === taskId
                      ? { ...entry, status: 'In Review', submittedAt }
                      : entry,
                  ),
                }
              : item,
          ),
          notifications: pushNotification(
            s,
            `${state.currentUser!.name} submitted "${task.title}" for admin review in ${project!.name}.`,
            'review',
            `/project/${projectId}`
          ),
        }));
      },

      reviewTask: async (projectId, taskId, decision, comment) => {
        const state = useStore.getState();
        if (state.currentUser?.role !== 'admin') return;

        const project = state.projects.find((item) => item.id === projectId);
        const task = project?.tasks.find((item) => item.id === taskId);

        if (!task || task.status !== 'In Review') return;

        const nextStatus = decision === 'approved' ? 'Done' : 'In Progress';
        const nextDbStatus = decision === 'approved' ? 'done' : 'in_progress';
        const reviewedAt = now();
        const nextMessage =
          decision === 'approved'
            ? `Admin approved "${task.title}". Task is now Done.`
            : `Admin requested changes on "${task.title}". Task moved back to In Progress.`;

        // Write status change to Supabase tasks table
        const { error: taskError } = await supabase
          .from('tasks')
          .update({ status: nextDbStatus, reviewed_at: reviewedAt })
          .eq('id', taskId);

        if (taskError) {
          console.error('Error reviewing task:', taskError);
          return;
        }

        // Insert the review decision into task_reviews table
        await supabase.from('task_reviews').upsert({
          task_id: taskId,
          reviewer_id: state.currentUser.id,
          decision,
          comment: comment || null,
          reviewed_at: reviewedAt,
        }, { onConflict: 'task_id' });

        set((s) => ({
          projects: s.projects.map((item) =>
            item.id === projectId
              ? {
                  ...item,
                  tasks: item.tasks.map((entry) =>
                    entry.id === taskId
                      ? { ...entry, status: nextStatus, reviewedAt, reviewDecision: decision, reviewComment: comment }
                      : entry,
                  ),
                }
              : item,
          ),
          notifications: pushNotification(s, nextMessage, 'review', `/project/${projectId}`),
        }));
      },
      signup: async (input) => {
        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password || '',
          options: {
            data: {
              name: input.name,
              full_name: input.name,
            },
          },
        });

        if (error) {
          return { success: false, message: error.message };
        }

        // Add to our local projects tracking so they exist in the workspace directory
        if (data.user) {
          const email = input.email.trim().toLowerCase();
          const newMember = makeMember(input.name.trim(), email, 'member', 'New Contributor');
          newMember.id = data.user.id; // Sync with Supabase ID

          set((state) => {
            const updatedProjects = state.projects.map(p => ({
              ...p,
              members: [...p.members, newMember]
            }));
            
            // Also update the global workspace list for the Task Modal
            const updatedAllMembers = [...state.allMembers];
            if (!updatedAllMembers.some(m => m.email.toLowerCase() === email)) {
              updatedAllMembers.push(newMember);
            }

            return { 
              projects: updatedProjects,
              allMembers: updatedAllMembers
            };
          });
        }

        return { success: true, message: 'Welcome! Please check your email for verification.' };
      },
    }),
    { name: 'kpit-workspace-v4' }
  )
);

// Sync state across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'kpit-workspace-v4') {
      useStore.persist.rehydrate();
    }
  });
}

export const findWorkspaceMemberByEmail = (projects: Project[], email: string) => {
  const normalizedEmail = email.toLowerCase();

  for (const project of projects) {
    const member = project.members.find((entry) => entry.email.toLowerCase() === normalizedEmail);
    if (member) {
      return member;
    }
  }

  return workspaceMembers.find((entry) => entry.email.toLowerCase() === normalizedEmail) ?? null;
};
