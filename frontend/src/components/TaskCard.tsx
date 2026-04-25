import { AlertCircle, CalendarClock, MessageSquare } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  highlight?: 'default' | 'review' | 'done';
  footer?: React.ReactNode;
}

const priorityTone: Record<Task['priority'], string> = {
  Low: 'bg-slate-500/10 text-slate-300',
  Medium: 'bg-amber-500/10 text-amber-300',
  High: 'bg-rose-500/10 text-rose-300',
};

export const TaskCard = ({
  task,
  onClick,
  primaryActionLabel,
  onPrimaryAction,
  highlight = 'default',
}: TaskCardProps) => {
  const borderTone =
    highlight === 'review'
      ? 'border-amber-500/20'
      : highlight === 'done'
        ? 'border-emerald-500/20'
        : 'border-[var(--border-color)]';

  return (
    <div className={`task-card ${borderTone}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${priorityTone[task.priority]}`}>
              {task.priority}
            </span>
            {task.reviewDecision === 'changes_requested' ? (
              <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-red-300">
                Changes Requested
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClick}
            className="text-left text-base font-bold leading-6 text-[var(--text-primary)] transition hover:text-[var(--accent-blue)]"
          >
            {task.title}
          </button>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{task.status}</span>
      </div>

      {task.description ? (
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)] line-clamp-3">{task.description}</p>
      ) : null}

      <div className="mt-4 grid gap-2 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          {task.assigneeAvatar ? (
            <img src={task.assigneeAvatar} alt={task.assigneeName} className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-main)] text-[8px] font-black text-[var(--text-primary)]">
              {task.assigneeName
                .split(' ')
                .map((part) => part.charAt(0))
                .join('')
                .slice(0, 2)}
            </div>
          )}
          <span>{task.assigneeName}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarClock size={14} className="text-[var(--text-muted)]" />
          <span>{task.dueDate || 'No target date'}</span>
        </div>
        {task.reviewComment ? (
          <div className="flex items-start gap-2 rounded-2xl bg-[var(--bg-main)] px-3 py-2">
            <MessageSquare size={14} className="mt-0.5 text-[var(--accent-warm)]" />
            <span className="leading-5">{task.reviewComment}</span>
          </div>
        ) : null}
      </div>

      {primaryActionLabel && onPrimaryAction ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrimaryAction();
          }}
          className="btn-primary-theme mt-5 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] transition"
        >
          <AlertCircle size={14} />
          {primaryActionLabel}
        </button>
      ) : null}

      {footer}
    </div>
  );
};
