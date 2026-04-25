import { useMemo } from 'react';
import { CalendarDays, CheckCheck, Clock3, FolderKanban, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { ProjectCard } from '../components/ProjectCard';
import { formatDeadlineDate, getDeadlineTone, sortByDueDate } from '../lib/deadlines';
import { useStore } from '../store';

export default function DashboardPage() {
  const { projects, currentUser, memberDeadlines } = useStore();

  const stats = useMemo(() => {
    const allTasks = projects.flatMap((project) => project.tasks);
    return {
      todo: allTasks.filter((task) => task.status === 'To Do').length,
      active: allTasks.filter((task) => task.status === 'In Progress').length,
      review: allTasks.filter((task) => task.status === 'In Review').length,
      done: allTasks.filter((task) => task.status === 'Done').length,
      members: new Set(projects.flatMap((project) => project.members.map((member) => member.email))).size,
    };
  }, [projects]);

  const myTasks = useMemo(
    () =>
      projects.flatMap((project) =>
        project.tasks.filter((task) => task.assigneeEmail.toLowerCase() === currentUser?.email.toLowerCase()),
      ),
    [currentUser?.email, projects],
  );

  const visibleDeadlines = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    const scopedDeadlines =
      currentUser.role === 'admin'
        ? memberDeadlines
        : memberDeadlines.filter((deadline) => deadline.memberEmail.toLowerCase() === currentUser.email.toLowerCase());

    return sortByDueDate(scopedDeadlines).slice(0, 4);
  }, [currentUser, memberDeadlines]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="app-scroll flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="panel-card rounded-[32px] p-8">
              <span className="accent-badge">
                <Sparkles size={14} />
                Delivery Overview
              </span>
              <h1 className="mt-4 text-4xl font-black text-[var(--text-primary)]">
                {currentUser?.role === 'admin'
                  ? 'Admin can govern the full task lifecycle from creation to review.'
                  : 'Your assigned work is synced with the admin review workflow.'}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
                Projects are created by admin, tasks are assigned inside each board, members accept and submit work, and
                final approval decides whether a task lands in Done or returns to In Progress. Calendar deadlines now stay
                visible to both admin and assigned members.
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: 'To Do', value: stats.todo, icon: Clock3 },
                { label: 'In Progress', value: stats.active, icon: FolderKanban },
                { label: 'In Review', value: stats.review, icon: ShieldCheck },
                { label: 'Done', value: stats.done, icon: CheckCheck },
                { label: 'Members', value: stats.members, icon: Users },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="metric-card rounded-[28px] p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">{item.label}</p>
                      <Icon size={18} className="text-[var(--accent-blue)]" />
                    </div>
                    <p className="mt-4 text-3xl font-black text-[var(--text-primary)]">{item.value}</p>
                  </div>
                );
              })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Projects</p>
                    <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">Active boards</h2>
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="panel-card rounded-[30px] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Calendar</p>
                      <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">
                        {currentUser?.role === 'admin' ? 'Upcoming member deadlines' : 'Deadlines assigned to you'}
                      </h2>
                    </div>
                    <CalendarDays size={18} className="text-[var(--accent-blue)]" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {visibleDeadlines.length ? (
                      visibleDeadlines.map((deadline) => {
                        const tone = getDeadlineTone(deadline.dueDate);

                        return (
                          <div key={deadline.id} className="rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-main)] p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-base font-black text-[var(--text-primary)]">{deadline.title}</p>
                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                  {deadline.projectName}
                                  {currentUser?.role === 'admin' ? ` | ${deadline.memberName}` : ''}
                                </p>
                              </div>
                              <span className="rounded-full bg-[var(--bg-card)] px-3 py-1 text-xs font-bold text-[var(--text-primary)]">
                                {tone === 'today' ? 'Today' : tone === 'overdue' ? 'Overdue' : formatDeadlineDate(deadline.dueDate)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-10 text-center text-sm leading-6 text-[var(--text-muted)]">
                        No calendar deadlines scheduled yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="panel-card rounded-[30px] p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">My Queue</p>
                  <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">
                    {currentUser?.role === 'admin' ? 'Admin visibility' : 'Tasks assigned to you'}
                  </h2>
                  <div className="mt-5 space-y-3">
                    {myTasks.length ? (
                      myTasks.slice(0, 6).map((task) => (
                        <div key={task.id} className="rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-main)] p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-base font-black text-[var(--text-primary)]">{task.title}</p>
                              <p className="mt-1 text-sm text-[var(--text-secondary)]">{task.status}</p>
                            </div>
                            <span className="rounded-full bg-[var(--bg-card)] px-3 py-1 text-xs font-bold text-[var(--text-primary)]">
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-10 text-center text-sm leading-6 text-[var(--text-muted)]">
                        No tasks assigned to your account right now.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
