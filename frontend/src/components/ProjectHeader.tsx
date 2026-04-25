import { CalendarRange, Crown, FolderKanban, Trophy, Users } from 'lucide-react';
import { Project, User } from '../types';


interface ProjectHeaderProps {
  project: Project;
  currentUser: User | null;
  onDeleteProject?: () => void;
}

export const ProjectHeader = ({ project, currentUser, onDeleteProject }: ProjectHeaderProps) => {
  const reviewCount = project.tasks.filter((task) => task.status === 'In Review').length;
  const taskPoints = project.tasks
    .filter((task) => task.status === 'Done')
    .reduce((sum, task) => sum + (task.points || 0), 0);
  const storyPoints = project.stories
    .filter((story) => story.status === 'Done')
    .reduce((sum, story) => sum + (story.points || 0), 0);
  const totalCompletedPoints = taskPoints + storyPoints;

  return (
    <div className="relative overflow-hidden border-b border-[var(--border-color)] bg-[var(--bg-main)] px-6 py-6">
      <div className={`absolute inset-0 bg-gradient-to-r ${project.theme} opacity-80`} />
      <div className="relative z-10 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(160deg,rgba(22,163,74,0.12),rgba(255,255,255,0.03))] text-[var(--accent-blue)] shadow-lg">
              <div className="absolute inset-[4px] rounded-[18px] border border-white/8" />
              <FolderKanban size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[var(--text-primary)]">{project.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">{project.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: 'Due Date',
              value: project.dueDate || 'Not set',
              icon: CalendarRange,
              color: 'text-rose-500',
              bg: 'bg-rose-500/10',
            },
            {
              label: 'Team Size',
              value: `${project.members.length} Members`,
              icon: Users,
              color: 'text-sky-500',
              bg: 'bg-sky-500/10',
            },
            {
              label: 'Review Queue',
              value: `${reviewCount} Pending`,
              icon: Crown,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10',
            },
            {
              label: 'Project Score',
              value: `${totalCompletedPoints} Points`,
              icon: Trophy,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
              special: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-white/10 p-5 transition-all hover:border-white/20 ${
                stat.special ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent' : 'bg-white/5'
              } backdrop-blur-md`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-80 group-hover:opacity-100 transition-opacity">
                  {stat.label}
                </p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-[12px] ${stat.bg} ${stat.color} shadow-inner`}>
                  <stat.icon size={14} />
                </div>
              </div>
              <p className="mt-4 text-sm font-black tracking-tight text-[var(--text-primary)]">
                {stat.value}
              </p>
              <div className="absolute -right-2 -bottom-2 h-12 w-12 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {currentUser?.role === 'admin' ? (
        <div className="relative z-10 mt-5 flex items-center justify-between rounded-[24px] border border-[var(--border-color)] bg-[rgba(255,255,255,0.04)] px-6 py-4 text-sm text-[var(--text-secondary)]">
          <div>
            <span className="font-bold text-[var(--text-primary)]">Admin Control:</span> Task creation and final review are
            enabled for this board.
          </div>
          <button
            onClick={() => {
              console.log('Delete button clicked. Role:', currentUser?.role);
              if (!currentUser || currentUser.role !== 'admin') {
                alert(`Error: Your role is ${currentUser?.role}, not admin.`);
                return;
              }
              if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
                onDeleteProject?.();
              }
            }}
            className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-rose-500 transition hover:bg-rose-500/20"
          >
            Delete Project
          </button>
        </div>
      ) : null}
    </div>
  );
};
