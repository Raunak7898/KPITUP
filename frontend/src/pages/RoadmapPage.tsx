import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, FolderKanban, Plus, Trash2, User2 } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { formatDeadlineDate, getDeadlineTone, getDaysUntilDeadline, getLocalDateKey, sortByDueDate } from '../lib/deadlines';
import { useStore } from '../store';

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const monthLabelFormatter = new Intl.DateTimeFormat('en-IN', {
  month: 'long',
  year: 'numeric',
});

const buildCalendarCells = (cursor: Date) => {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const relativeDay = index - startOffset + 1;

    if (relativeDay <= 0) {
      return {
        key: `prev-${index}`,
        dateKey: getLocalDateKey(new Date(year, month - 1, previousMonthDays + relativeDay)),
        dayNumber: previousMonthDays + relativeDay,
        isCurrentMonth: false,
      };
    }

    if (relativeDay > daysInMonth) {
      return {
        key: `next-${index}`,
        dateKey: getLocalDateKey(new Date(year, month + 1, relativeDay - daysInMonth)),
        dayNumber: relativeDay - daysInMonth,
        isCurrentMonth: false,
      };
    }

    return {
      key: `current-${relativeDay}`,
      dateKey: getLocalDateKey(new Date(year, month, relativeDay)),
      dayNumber: relativeDay,
      isCurrentMonth: true,
    };
  });
};

const toneCopy = {
  upcoming: {
    badge: 'Upcoming',
    panelClass: 'border-[var(--border-color)] bg-[var(--bg-main)]',
  },
  today: {
    badge: 'Due Today',
    panelClass: 'border-[var(--text-primary)]/25 bg-[rgba(255,255,255,0.08)]',
  },
  overdue: {
    badge: 'Overdue',
    panelClass: 'border-[var(--text-primary)]/30 bg-[rgba(255,255,255,0.1)]',
  },
} as const;

export default function CalendarPage() {
  const { currentUser, projects, memberDeadlines, addMemberDeadline, deleteMemberDeadline } = useStore();
  const todayKey = getLocalDateKey();
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const visibleDeadlines = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    const scopedDeadlines =
      currentUser.role === 'admin'
        ? memberDeadlines
        : memberDeadlines.filter((deadline) => deadline.memberEmail.toLowerCase() === currentUser.email.toLowerCase());

    return sortByDueDate(scopedDeadlines);
  }, [currentUser, memberDeadlines]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const selectableMembers = useMemo(
    () => selectedProject?.members.filter((member) => member.role === 'member') ?? [],
    [selectedProject],
  );

  useEffect(() => {
    if (!projects.length) {
      return;
    }

    if (!selectedProjectId || !projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectableMembers.length) {
      setSelectedMemberId('');
      return;
    }

    if (!selectedMemberId || !selectableMembers.some((member) => member.id === selectedMemberId)) {
      setSelectedMemberId(selectableMembers[0].id);
    }
  }, [selectedMemberId, selectableMembers]);

  useEffect(() => {
    if (!dueDate) {
      setDueDate(selectedProject?.dueDate || todayKey);
    }
  }, [dueDate, selectedProject?.dueDate, todayKey]);

  const deadlinesByDate = useMemo(() => {
    const grouped = new Map<string, typeof visibleDeadlines>();

    visibleDeadlines.forEach((deadline) => {
      const entries = grouped.get(deadline.dueDate) ?? [];
      grouped.set(deadline.dueDate, [...entries, deadline]);
    });

    return grouped;
  }, [visibleDeadlines]);

  const calendarCells = useMemo(() => buildCalendarCells(monthCursor), [monthCursor]);

  const stats = useMemo(() => {
    const overdue = visibleDeadlines.filter((deadline) => getDeadlineTone(deadline.dueDate, todayKey) === 'overdue').length;
    const today = visibleDeadlines.filter((deadline) => deadline.dueDate === todayKey).length;
    const projectsCovered = new Set(visibleDeadlines.map((deadline) => deadline.projectId)).size;

    return {
      total: visibleDeadlines.length,
      overdue,
      today,
      projectsCovered,
    };
  }, [todayKey, visibleDeadlines]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = addMemberDeadline({
      projectId: selectedProjectId,
      memberId: selectedMemberId,
      title,
      dueDate,
      note,
    });

    setFeedback({
      tone: result.success ? 'success' : 'error',
      message: result.message,
    });

    if (result.success) {
      setTitle('');
      setNote('');
      setDueDate(selectedProject?.dueDate || todayKey);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="app-scroll flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="panel-card rounded-[32px] p-8">
              <span className="accent-badge">
                <CalendarDays size={14} />
                Calendar
              </span>
              <div className="mt-5 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <h1 className="text-4xl font-black text-[var(--text-primary)]">
                    {currentUser?.role === 'admin'
                      ? 'Assign member deadlines project-wise and keep delivery dates visible to the whole team.'
                      : 'Your member dashboard deadlines now live in one calendar view.'}
                  </h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
                    {currentUser?.role === 'admin'
                      ? 'Choose a project, assign a member-specific deadline, and the same schedule instantly appears in the member dashboard and task view.'
                      : 'All project deadlines assigned to your email appear here as well as on your dashboard, so you always know what needs attention next.'}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Scheduled', value: stats.total },
                    { label: 'Due Today', value: stats.today },
                    { label: 'Overdue', value: stats.overdue },
                    { label: 'Projects', value: stats.projectsCovered },
                  ].map((item) => (
                    <div key={item.label} className="metric-card rounded-[26px] p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">{item.label}</p>
                      <p className="mt-3 text-3xl font-black text-[var(--text-primary)]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <div className="space-y-6">
                <section className="panel-card rounded-[30px] p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-main)] text-[var(--accent-blue)]">
                      {currentUser?.role === 'admin' ? <Plus size={20} /> : <User2 size={20} />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[var(--text-primary)]">
                        {currentUser?.role === 'admin' ? 'Assign Deadline' : 'Deadline Access'}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {currentUser?.role === 'admin'
                          ? 'Create member-level deadlines directly from the calendar tab.'
                          : 'Members can view deadlines here while admin manages assignments.'}
                      </p>
                    </div>
                  </div>

                  {currentUser?.role === 'admin' ? (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Project</span>
                          <select
                            value={selectedProjectId}
                            onChange={(event) => setSelectedProjectId(event.target.value)}
                            className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                          >
                            {projects.map((project) => (
                              <option key={project.id} value={project.id}>
                                {project.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Member</span>
                          <select
                            value={selectedMemberId}
                            onChange={(event) => setSelectedMemberId(event.target.value)}
                            disabled={!selectableMembers.length}
                            className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-[var(--accent-blue)]"
                          >
                            {selectableMembers.length ? (
                              selectableMembers.map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.name}
                                </option>
                              ))
                            ) : (
                              <option value="">No members in this project</option>
                            )}
                          </select>
                        </label>
                      </div>

                      <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Deadline Title</span>
                        <input
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          placeholder="Example: QA handoff ready for admin review"
                          className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Due Date</span>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(event) => setDueDate(event.target.value)}
                          className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Notes</span>
                        <textarea
                          value={note}
                          onChange={(event) => setNote(event.target.value)}
                          rows={4}
                          placeholder="Optional admin context for the member."
                          className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                        />
                      </label>

                      {feedback ? (
                        <div
                          className={`rounded-2xl border px-4 py-3 text-sm ${
                            feedback.tone === 'success'
                              ? 'border-[var(--text-primary)]/20 bg-[rgba(255,255,255,0.08)] text-[var(--text-primary)]'
                              : 'border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {feedback.message}
                        </div>
                      ) : null}

                      <button
                        type="submit"
                        disabled={!selectableMembers.length}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent-blue)] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-[var(--bg-main)] transition hover:bg-[var(--accent-blue-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={14} />
                        Save Deadline
                      </button>
                    </form>
                  ) : (
                    <div className="mt-6 rounded-[26px] border border-[var(--border-color)] bg-[var(--bg-main)] p-5 text-sm leading-7 text-[var(--text-secondary)]">
                      Admin creates project deadlines from this tab, and every deadline assigned to your email stays visible in
                      your dashboard and task workflow pages without any extra steps.
                    </div>
                  )}
                </section>

                <section className="panel-card rounded-[30px] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Upcoming Window</p>
                      <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">
                        {currentUser?.role === 'admin' ? 'Team deadlines at a glance' : 'Your next delivery dates'}
                      </h2>
                    </div>
                    <Clock3 size={18} className="text-[var(--accent-blue)]" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {visibleDeadlines.length ? (
                      visibleDeadlines.slice(0, 5).map((deadline) => {
                        const tone = getDeadlineTone(deadline.dueDate, todayKey);
                        const daysUntil = getDaysUntilDeadline(deadline.dueDate, todayKey);
                        const toneMeta = toneCopy[tone];

                        return (
                          <div key={deadline.id} className={`rounded-[24px] border p-4 ${toneMeta.panelClass}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                  {deadline.projectName}
                                </p>
                                <h3 className="mt-2 text-lg font-black text-[var(--text-primary)]">{deadline.title}</h3>
                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                  {currentUser?.role === 'admin' ? deadline.memberName : 'Assigned to you'}
                                </p>
                              </div>
                              <span className="rounded-full border border-[var(--border-color)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-primary)]">
                                {toneMeta.badge}
                              </span>
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
                              <span>{formatDeadlineDate(deadline.dueDate)}</span>
                              <span className="font-semibold text-[var(--text-primary)]">
                                {tone === 'today'
                                  ? 'Needs attention today'
                                  : tone === 'overdue'
                                    ? `${Math.abs(daysUntil)} day overdue`
                                    : `${daysUntil} day${daysUntil === 1 ? '' : 's'} left`}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-10 text-center text-sm leading-6 text-[var(--text-muted)]">
                        No member deadlines scheduled yet.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="panel-card rounded-[30px] p-5">
                  <div className="flex flex-col gap-4 border-b border-[var(--border-color)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Month View</p>
                      <h2 className="mt-1 text-xl font-black text-[var(--text-primary)]">
                        {monthLabelFormatter.format(monthCursor)}
                      </h2>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">Hover a date to focus the day and scan deadlines faster.</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] p-1">
                      <button
                        onClick={() => setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                        className="rounded-xl p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-darker)] hover:text-[var(--text-primary)]"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() => setMonthCursor(new Date())}
                        className="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-primary)] transition hover:bg-[var(--bg-darker)]"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                        className="rounded-xl p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-darker)] hover:text-[var(--text-primary)]"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-2">
                    {weekdayLabels.map((label) => (
                      <div key={label} className="px-1 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        {label}
                      </div>
                    ))}

                    {calendarCells.map((cell) => {
                      const dayDeadlines = deadlinesByDate.get(cell.dateKey) ?? [];
                      const isToday = cell.dateKey === todayKey;
                      const hasDeadlines = dayDeadlines.length > 0;

                      return (
                        <div
                          key={cell.key}
                          className={`group min-h-[104px] rounded-[20px] border px-2.5 py-2 transition duration-200 ${
                            cell.isCurrentMonth
                              ? 'border-[var(--border-color)] bg-[var(--bg-main)]'
                              : 'border-[var(--border-color)]/60 bg-[var(--bg-darker)]/60'
                          } ${
                            isToday ? 'border-[var(--text-primary)]/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]' : ''
                          } ${
                            hasDeadlines
                              ? 'cursor-pointer border-amber-400/35 bg-amber-400/8 hover:-translate-y-1 hover:border-amber-300/70 hover:bg-amber-300/12 hover:shadow-[0_14px_28px_rgba(245,158,11,0.14)]'
                              : 'cursor-pointer hover:-translate-y-1 hover:border-[var(--text-primary)]/20 hover:bg-[var(--bg-card-hover)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.12)]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition ${
                                isToday
                                  ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-main)]'
                                  : hasDeadlines
                                    ? 'border-amber-300 bg-amber-300 text-slate-950 shadow-[0_8px_20px_rgba(245,158,11,0.24)] group-hover:bg-amber-200 group-hover:border-amber-200'
                                  : cell.isCurrentMonth
                                    ? 'border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] group-hover:border-[var(--text-primary)] group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-main)] group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.18)]'
                                    : 'border-[var(--border-color)]/60 bg-transparent text-[var(--text-muted)] group-hover:border-[var(--text-muted)]/50 group-hover:bg-[var(--bg-darker)] group-hover:text-[var(--text-secondary)]'
                              }`}
                            >
                              {cell.dayNumber}
                            </span>
                            {dayDeadlines.length ? (
                              <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-bold text-slate-950 transition group-hover:bg-amber-200">
                                {dayDeadlines.length}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-2.5 space-y-1.5">
                            {dayDeadlines.slice(0, 1).map((deadline) => (
                              <div
                                key={deadline.id}
                                className="rounded-[16px] border border-amber-400/20 bg-[rgba(245,158,11,0.12)] px-2.5 py-2 transition group-hover:border-amber-300/35 group-hover:bg-[rgba(245,158,11,0.16)]"
                              >
                                <p className="truncate text-[11px] font-bold text-[var(--text-primary)]">{deadline.title}</p>
                                <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">
                                  {currentUser?.role === 'admin' ? deadline.memberName : deadline.projectName}
                                </p>
                              </div>
                            ))}
                            {dayDeadlines.length > 1 ? (
                              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] transition group-hover:text-[var(--text-primary)]">
                                +{dayDeadlines.length - 1} more
                              </p>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="panel-card rounded-[30px] p-6">
                  <div className="flex items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Assignments</p>
                      <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">
                        {currentUser?.role === 'admin' ? 'All member deadlines' : 'Deadlines assigned to you'}
                      </h2>
                    </div>
                    <FolderKanban size={18} className="text-[var(--accent-blue)]" />
                  </div>

                  <div className="mt-5 space-y-4">
                    {visibleDeadlines.length ? (
                      visibleDeadlines.map((deadline) => {
                        const tone = getDeadlineTone(deadline.dueDate, todayKey);
                        const toneMeta = toneCopy[tone];

                        return (
                          <div key={deadline.id} className={`rounded-[24px] border p-5 ${toneMeta.panelClass}`}>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{deadline.projectName}</p>
                                <h3 className="text-xl font-black text-[var(--text-primary)]">{deadline.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)]">
                                  {currentUser?.role === 'admin'
                                    ? `Assigned to ${deadline.memberName}`
                                    : `Assigned by ${deadline.createdByName}`}
                                </p>
                                {deadline.note ? (
                                  <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{deadline.note}</p>
                                ) : null}
                              </div>

                              <div className="min-w-[220px] space-y-3">
                                <div className="rounded-[22px] border border-[var(--border-color)] bg-[var(--bg-darker)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                                  <div className="flex items-center justify-between">
                                    <span>Due date</span>
                                    <span className="font-bold text-[var(--text-primary)]">{formatDeadlineDate(deadline.dueDate)}</span>
                                  </div>
                                  <div className="mt-2 flex items-center justify-between">
                                    <span>Status</span>
                                    <span className="font-bold text-[var(--text-primary)]">{toneMeta.badge}</span>
                                  </div>
                                </div>

                                {currentUser?.role === 'admin' ? (
                                  <button
                                    onClick={() => deleteMemberDeadline(deadline.id)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--text-primary)] transition hover:bg-[var(--bg-darker)]"
                                  >
                                    <Trash2 size={14} />
                                    Remove
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-10 text-center text-sm leading-6 text-[var(--text-muted)]">
                        No deadlines available for this calendar view yet.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
