import { useEffect, useState } from 'react';
import { CalendarDays, Crown, Target, UserCircle2, X } from 'lucide-react';
import { Priority, Task, TeamMember } from '../types';

interface TaskFormValues {
  title: string;
  description: string;
  priority: Priority;
  points: number;
  assigneeId: string;
  dueDate?: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskFormValues) => void;
  onDelete?: () => void;
  initialTask?: Task;
  members: TeamMember[];
}

export const TaskModal = ({ isOpen, onClose, onSave, onDelete, initialTask, members }: TaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [points, setPoints] = useState<number>(5);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setAssigneeId(initialTask.assigneeId);
      setPriority(initialTask.priority);
      setPoints(initialTask.points || 5);
      setDueDate(initialTask.dueDate ?? '');
      return;
    }

    const availableMembers = members.filter((m) => m.role !== 'admin');
    const firstMember = availableMembers.length > 0 ? availableMembers[0] : null;
    setTitle('');
    setDescription('');
    setAssigneeId(firstMember?.id ?? '');
    setPriority('Medium');
    setPoints(5);
    setDueDate('');
  }, [initialTask, isOpen, members]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
      <div className="panel-card w-full max-w-2xl rounded-[30px] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent-blue)]">
              {initialTask ? 'Edit Assignment' : 'Create Project Task'}
            </p>
            <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">
              {initialTask ? 'Update task details' : 'Assign work to a project member'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-color)] text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave({
              title,
              description,
              priority,
              points,
              assigneeId,
              dueDate: dueDate || undefined,
            });
          }}
          className="grid gap-6 p-6"
        >
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Task Title</span>
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Build pricing module comparison cards"
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
              />
            </label>

            <div className="panel-muted rounded-[24px] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Lifecycle Rule</p>
              <div className="mt-3 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <Target size={18} className="text-[var(--accent-warm)]" />
                New task is always created in <span className="font-bold text-[var(--text-primary)]">To Do</span>.
              </div>
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Description</span>
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add context, handoff notes, expectations, and success criteria."
              className="w-full resize-none rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-4">
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Assign To</span>
              <div className="relative">
                <UserCircle2 className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                <select
                  required
                  value={assigneeId}
                  onChange={(event) => setAssigneeId(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] py-3.5 pl-12 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                >
                  {members.filter(m => m.role !== 'admin').length > 0 ? (
                    members
                      .filter((member) => member.role !== 'admin')
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))
                  ) : (
                    <option value="" disabled>
                      No members in project yet
                    </option>
                  )}
                </select>
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Priority</span>
              <select
                value={priority}
                onChange={(event) => {
                  const p = event.target.value as Priority;
                  setPriority(p);
                  // Auto-suggest points if creating new task
                  if (!initialTask) {
                    setPoints(p === 'High' ? 10 : p === 'Medium' ? 5 : 2);
                  }
                }}
                className="w-full appearance-none rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Reward Points</span>
              <div className="relative">
                <Target className="absolute left-4 top-3.5 text-yellow-500" size={18} />
                <input
                  type="number"
                  required
                  min={0}
                  value={points}
                  onChange={(event) => setPoints(parseInt(event.target.value) || 0)}
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] py-3.5 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Target Date</span>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] py-3.5 pl-12 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                />
              </div>
            </label>
          </div>

          {initialTask ? (
            <div className="panel-muted flex items-start gap-3 rounded-[24px] p-4 text-sm text-[var(--text-secondary)]">
              <Crown size={18} className="mt-0.5 text-[var(--accent-warm)]" />
              Status changes are controlled by the assignee and admin review flow. Edit assignment details here, then
              let the workflow move the task forward.
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-5">
            {initialTask && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/15"
              >
                Delete Task
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-[var(--border-color)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary-theme rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-[0.18em] transition"
              >
                {initialTask ? 'Save Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
