import { CalendarDays, CheckCheck, Clock3, Loader, ShieldCheck } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { formatDeadlineDate, getDeadlineTone, sortByDueDate } from '../lib/deadlines';
import { useStore } from '../store';

const statusMeta = {
  'To Do': {
    title: 'Awaiting Acceptance',
    description: 'New admin assignments waiting for you to accept.',
    icon: Clock3,
  },
  'In Progress': {
    title: 'In Progress',
    description: 'Tasks you have accepted and are currently working on.',
    icon: Loader,
  },
  'In Review': {
    title: 'Submitted For Review',
    description: 'Work you submitted and that is pending admin approval.',
    icon: ShieldCheck,
  },
  Done: {
    title: 'Done',
    description: 'Admin-approved work closed for this cycle.',
    icon: CheckCheck,
  },
} as const;

export default function MyTasksPage() {
  const { projects, currentUser, memberDeadlines, acceptTask, submitTaskForReview } = useStore();

  const myTasks = projects.flatMap((project) =>
    project.tasks
      .filter((task) => task.assigneeEmail.toLowerCase() === currentUser?.email.toLowerCase())
      .map((task) => ({ ...task, projectId: project.id, projectName: project.name })),
  );

  const myDeadlines = sortByDueDate(
    memberDeadlines.filter((deadline) => deadline.memberEmail.toLowerCase() === currentUser?.email.toLowerCase()),
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="app-scroll flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <section className="panel-card rounded-[32px] p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">My Delivery Queue</p>
              <h1 className="mt-3 text-4xl font-black text-[var(--text-primary)]">Assigned work that moves with the admin review flow.</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
                Accept tasks from To Do, complete the implementation in In Progress, then submit for review. Admin will
                either approve to Done or reject back to In Progress. Your calendar deadlines stay visible here as well.
              </p>
            </section>

            <section className="panel-card rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Calendar Deadlines</p>
                  <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">Project deadlines assigned to you</h2>
                </div>
                <CalendarDays size={18} className="text-[var(--accent-blue)]" />
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {myDeadlines.length ? (
                  myDeadlines.slice(0, 4).map((deadline) => {
                    const tone = getDeadlineTone(deadline.dueDate);

                    return (
                      <div key={deadline.id} className="rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-main)] p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{deadline.projectName}</p>
                        <h3 className="mt-2 text-lg font-black text-[var(--text-primary)]">{deadline.title}</h3>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">{deadline.note || 'No extra notes from admin.'}</p>
                        <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-secondary)]">
                          <span>{formatDeadlineDate(deadline.dueDate)}</span>
                          <span className="font-bold text-[var(--text-primary)]">
                            {tone === 'today' ? 'Due Today' : tone === 'overdue' ? 'Overdue' : 'Upcoming'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-10 text-center text-sm leading-6 text-[var(--text-muted)] lg:col-span-2">
                    No calendar deadlines are assigned to your email yet.
                  </div>
                )}
              </div>
            </section>

            {myTasks.length === 0 ? (
              <div className="panel-card rounded-[30px] px-6 py-14 text-center">
                <h2 className="text-2xl font-black text-[var(--text-primary)]">No tasks assigned yet</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  Once the admin assigns work to your email, it will appear here with the exact lifecycle actions.
                </p>
              </div>
            ) : (
              (Object.keys(statusMeta) as Array<keyof typeof statusMeta>).map((statusKey) => {
                const tasks = myTasks.filter((task) => task.status === statusKey);
                const meta = statusMeta[statusKey];
                const Icon = meta.icon;

                return (
                  <section key={statusKey} className="panel-card rounded-[30px] p-6">
                    <div className="flex flex-col gap-3 border-b border-[var(--border-color)] pb-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-main)] text-[var(--accent-blue)]">
                          <Icon size={20} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-[var(--text-primary)]">{meta.title}</h2>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">{meta.description}</p>
                        </div>
                      </div>
                      <span className="w-fit rounded-full bg-[var(--bg-main)] px-4 py-2 text-sm font-bold text-[var(--text-primary)]">
                        {tasks.length}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4">
                      {tasks.length ? (
                        tasks.map((task) => (
                          <div key={task.id} className="rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-main)] p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-blue)]">{task.projectName}</p>
                                <h3 className="text-xl font-black text-[var(--text-primary)]">{task.title}</h3>
                                <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{task.description}</p>
                                {task.reviewComment ? (
                                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    Admin feedback: {task.reviewComment}
                                  </div>
                                ) : null}
                              </div>

                              <div className="min-w-[220px] space-y-3">
                                <div className="rounded-[22px] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                                  <div className="flex items-center justify-between">
                                    <span>Priority</span>
                                    <span className="font-bold text-[var(--text-primary)]">{task.priority}</span>
                                  </div>
                                  <div className="mt-2 flex items-center justify-between">
                                    <span>Due</span>
                                    <span className="font-bold text-[var(--text-primary)]">{task.dueDate || 'TBD'}</span>
                                  </div>
                                </div>

                                {task.status === 'To Do' ? (
                                  <button
                                    onClick={() => acceptTask(task.projectId, task.id)}
                                    className="btn-primary-theme w-full rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition"
                                  >
                                    Accept Task
                                  </button>
                                ) : null}

                                {task.status === 'In Progress' ? (
                                  <button
                                    onClick={() => submitTaskForReview(task.projectId, task.id)}
                                    className="btn-warm-theme w-full rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition"
                                  >
                                    Submit For Review
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[24px] border border-dashed border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-8 text-center text-sm leading-6 text-[var(--text-muted)]">
                          No tasks in this stage.
                        </div>
                      )}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
