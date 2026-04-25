import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCheck, Crown, FolderKanban, RotateCcw, ShieldAlert, Sparkles, XCircle } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { useStore } from '../store';

export default function AdminDashboardPage() {
  const { currentUser, projects, reviewTask, deleteProject } = useStore();
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-main)]">
        <div className="panel-card rounded-[30px] p-10 text-center">
          <ShieldAlert className="mx-auto text-red-400" size={42} />
          <h1 className="mt-4 text-3xl font-black text-[var(--text-primary)]">Access Denied</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            This panel is reserved for the admin account because it controls final project review.
          </p>
        </div>
      </div>
    );
  }

  const reviewQueue = useMemo(
    () =>
      projects.flatMap((project) =>
        project.tasks
          .filter((task) => task.status === 'In Review')
          .map((task) => ({ ...task, projectId: project.id, projectName: project.name })),
      ),
    [projects],
  );

  const activeProjects = projects.length;
  const totalTasks = projects.reduce((count, project) => count + project.tasks.length, 0);
  const doneTasks = projects.reduce(
    (count, project) => count + project.tasks.filter((task) => task.status === 'Done').length,
    0,
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="app-scroll flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="panel-card relative overflow-hidden rounded-[32px] p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_26%)]" />
              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-4">
                  <span className="accent-badge">
                    <Sparkles size={14} />
                    Admin Review Console
                  </span>
                  <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)]">Approve, reject, and monitor delivery across every active project.</h1>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
                      Tasks are created inside each project board by admin. Members accept and submit work there. Final
                      approval happens here and feeds the Done or In Progress stages back into the boards.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Active Projects', value: activeProjects, icon: FolderKanban, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                    { label: 'Pending Reviews', value: reviewQueue.length, icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Done Tasks', value: doneTasks, icon: CheckCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="group relative min-w-[180px] overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md transition-all hover:border-white/10">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-80 group-hover:opacity-100 transition-opacity">
                            {item.label}
                          </p>
                          <div className={`flex h-8 w-8 items-center justify-center rounded-[12px] ${item.bg} ${item.color} shadow-inner`}>
                            <Icon size={14} />
                          </div>
                        </div>
                        <p className="mt-4 text-2xl font-black tracking-tight text-[var(--text-primary)]">
                          {item.value}
                        </p>
                        <div className="absolute -right-2 -bottom-2 h-12 w-12 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="panel-card rounded-[30px] p-6">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Review Queue</p>
                    <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">Tasks waiting for decision</h2>
                  </div>
                  <span className="rounded-full bg-[var(--bg-main)] px-4 py-2 text-sm font-bold text-[var(--text-primary)]">
                    {reviewQueue.length}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {reviewQueue.length ? (
                    reviewQueue.map((task) => (
                      <div key={task.id} className="rounded-[26px] border border-[var(--border-color)] bg-[var(--bg-main)] p-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-blue)]">
                              {task.projectName}
                            </p>
                            <h3 className="text-xl font-black text-[var(--text-primary)]">{task.title}</h3>
                            <p className="text-sm leading-6 text-[var(--text-secondary)]">{task.description}</p>
                            <p className="text-xs text-[var(--text-muted)]">
                              Submitted by {task.assigneeName}
                              {task.submittedAt ? ` on ${new Date(task.submittedAt).toLocaleDateString('en-IN')}` : ''}
                            </p>
                          </div>

                          <div className="w-full max-w-[260px] space-y-3">
                            <textarea
                              rows={3}
                              value={feedback[task.id] ?? ''}
                              onChange={(event) =>
                                setFeedback((current) => ({ ...current, [task.id]: event.target.value }))
                              }
                              placeholder="Optional feedback for the assignee"
                              className="w-full resize-none rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => reviewTask(task.projectId, task.id, 'approved', feedback[task.id])}
                                className="btn-primary-theme rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => reviewTask(task.projectId, task.id, 'changes_requested', feedback[task.id])}
                                className="btn-warm-theme rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-14 text-center text-sm leading-6 text-[var(--text-muted)]">
                      No tasks are waiting for review right now.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="panel-card rounded-[30px] p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Flow Summary</p>
                  <div className="mt-4 space-y-4">
                    {[
                      {
                        icon: FolderKanban,
                        title: 'Project board creates the work',
                        text: 'Admin goes to Projects, opens a project, and creates tasks inside that board only.',
                      },
                      {
                        icon: RotateCcw,
                        title: 'Member owns execution',
                        text: 'Assigned worker accepts the task, moves it into active delivery, and submits when finished.',
                      },
                      {
                        icon: XCircle,
                        title: 'Admin owns the final decision',
                        text: 'Approve moves the task to Done. Reject moves it back to In Progress with comments.',
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-main)] p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bg-card)] text-[var(--accent-blue)]">
                              <Icon size={18} />
                            </div>
                            <div>
                              <h3 className="text-base font-black text-[var(--text-primary)]">{item.title}</h3>
                              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.text}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="panel-card rounded-[30px] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Project Boards</p>
                      <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">Jump back into a project</h2>
                    </div>
                    <span className="rounded-full bg-[var(--bg-main)] px-4 py-2 text-sm font-bold text-[var(--text-primary)]">
                      {totalTasks} tasks
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {projects.map((project) => (
                      <div key={project.id} className="group relative">
                        <Link
                          to={`/project/${project.id}`}
                          className="flex items-center justify-between rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-4 transition hover:border-[var(--accent-blue)]"
                        >
                          <div>
                            <p className="text-base font-black text-[var(--text-primary)]">{project.name}</p>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                              {project.tasks.length} tasks, {project.tasks.filter((task) => task.status === 'In Review').length} in review
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Crown size={18} className="text-[var(--accent-warm)]" />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete project "${project.name}"?`)) {
                                  deleteProject(project.id);
                                }
                              }}
                              className="rounded-lg p-2 text-rose-500 opacity-0 transition-opacity hover:bg-rose-500/10 group-hover:opacity-100"
                              title="Delete Project"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </Link>
                      </div>
                    ))}
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
