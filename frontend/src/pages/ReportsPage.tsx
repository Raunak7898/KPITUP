import { BarChart3, CheckCheck, Clock3, FolderKanban, ShieldCheck, Users } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { useStore } from '../store';

export default function ReportsPage() {
  const { projects } = useStore();
  const allTasks = projects.flatMap((project) => project.tasks);
  const totalMembers = new Set(projects.flatMap((project) => project.members.map((member) => member.email))).size;
  const doneTasks = allTasks.filter((task) => task.status === 'Done').length;
  const reviewTasks = allTasks.filter((task) => task.status === 'In Review').length;
  const activeTasks = allTasks.filter((task) => task.status === 'In Progress').length;
  const todoTasks = allTasks.filter((task) => task.status === 'To Do').length;
  const completionRate = allTasks.length ? Math.round((doneTasks / allTasks.length) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="app-scroll flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="panel-card rounded-[32px] p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Workspace Reports</p>
              <h1 className="mt-3 text-4xl font-black text-[var(--text-primary)]">A simple snapshot of execution health across the full workflow.</h1>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                { label: 'Total Tasks', value: allTasks.length, icon: FolderKanban },
                { label: 'Done', value: doneTasks, icon: CheckCheck },
                { label: 'In Review', value: reviewTasks, icon: ShieldCheck },
                { label: 'In Progress', value: activeTasks, icon: Clock3 },
                { label: 'Members', value: totalMembers, icon: Users },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="metric-card rounded-[28px] p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">{card.label}</p>
                      <Icon size={18} className="text-[var(--accent-blue)]" />
                    </div>
                    <p className="mt-4 text-3xl font-black text-[var(--text-primary)]">{card.value}</p>
                  </div>
                );
              })}
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="panel-card rounded-[30px] p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-[var(--accent-blue)]" size={20} />
                  <h2 className="text-2xl font-black text-[var(--text-primary)]">Completion Rate</h2>
                </div>
                <div className="mt-6 rounded-full bg-[var(--bg-main)] p-3">
                  <div className="rounded-full bg-[var(--accent-blue)] px-5 py-6 text-center text-4xl font-black text-[var(--accent-foreground)]">
                    {completionRate}%
                  </div>
                </div>
                <div className="mt-6 space-y-3 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center justify-between">
                    <span>To Do</span>
                    <span className="font-bold text-[var(--text-primary)]">{todoTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>In Progress</span>
                    <span className="font-bold text-[var(--text-primary)]">{activeTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>In Review</span>
                    <span className="font-bold text-[var(--text-primary)]">{reviewTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Done</span>
                    <span className="font-bold text-[var(--text-primary)]">{doneTasks}</span>
                  </div>
                </div>
              </div>

              <div className="panel-card rounded-[30px] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Project Health</p>
                <div className="mt-5 space-y-4">
                  {projects.map((project) => {
                    const total = project.tasks.length || 1;
                    const done = project.tasks.filter((task) => task.status === 'Done').length;
                    const rate = Math.round((done / total) * 100);

                    return (
                      <div key={project.id} className="rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-main)] p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-black text-[var(--text-primary)]">{project.name}</h3>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                              {project.tasks.length} tasks, {project.members.length} members
                            </p>
                          </div>
                          <span className="rounded-full bg-[var(--bg-card)] px-3 py-1 text-xs font-bold text-[var(--text-primary)]">
                            {rate}%
                          </span>
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border-color)]">
                          <div className="h-full rounded-full bg-[var(--accent-blue)]" style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
