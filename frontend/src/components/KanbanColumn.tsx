import { LucideIcon } from 'lucide-react';
import { Status, Task } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
  icon: LucideIcon;
  description: string;
  onTaskClick: (task: Task) => void;
  getPrimaryActionLabel?: (task: Task) => string | null;
  onPrimaryAction?: (task: Task) => void;
  renderTaskFooter?: (task: Task) => React.ReactNode;
}

export const KanbanColumn = ({
  status,
  tasks,
  icon: Icon,
  description,
  onTaskClick,
  getPrimaryActionLabel,
  onPrimaryAction,
  renderTaskFooter,
}: KanbanColumnProps) => (
  <section className="panel-card flex min-h-[520px] min-w-[300px] max-w-[340px] flex-col rounded-[28px] p-4">
    <div className="border-b border-[var(--border-color)] px-2 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bg-main)] text-[var(--accent-blue)]">
            <Icon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.22em] text-[var(--text-primary)]">{status}</h3>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{description}</p>
          </div>
        </div>
        <span className="rounded-full bg-[var(--bg-main)] px-3 py-1 text-xs font-bold text-[var(--text-primary)]">
          {tasks.length}
        </span>
      </div>
    </div>

    <div className="app-scroll mt-4 flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
      {tasks.length ? (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            primaryActionLabel={getPrimaryActionLabel?.(task) ?? undefined}
            onPrimaryAction={onPrimaryAction ? () => onPrimaryAction(task) : undefined}
            highlight={status === 'In Review' ? 'review' : status === 'Done' ? 'done' : 'default'}
            footer={renderTaskFooter?.(task)}
          />
        ))
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-[24px] border border-dashed border-[var(--border-color)] bg-[var(--bg-main)] px-6 py-10 text-center text-sm leading-6 text-[var(--text-muted)]">
          No tasks in {status.toLowerCase()} right now.
        </div>
      )}
    </div>
  </section>
);
