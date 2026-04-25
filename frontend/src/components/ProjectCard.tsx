import { Link } from 'react-router-dom';
import { CalendarRange, Crown, Users } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const reviewCount = project.tasks.filter((task) => task.status === 'In Review').length;

  return (
    <Link to={`/project/${project.id}`} className="panel-card rounded-[30px] p-6 transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-blue)]">Project</p>
          <h3 className="mt-2 text-2xl font-black text-[var(--text-primary)]">{project.name}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{project.description}</p>
        </div>
        <div className="rounded-[22px] bg-[var(--bg-main)] px-3 py-2 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Review</p>
          <p className="mt-1 text-lg font-black text-[var(--text-primary)]">{reviewCount}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] bg-[var(--bg-main)] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Tasks</p>
          <p className="mt-2 text-lg font-black text-[var(--text-primary)]">{project.tasks.length}</p>
        </div>
        <div className="rounded-[22px] bg-[var(--bg-main)] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Members</p>
          <p className="mt-2 text-lg font-black text-[var(--text-primary)]">{project.members.length}</p>
        </div>
        <div className="rounded-[22px] bg-[var(--bg-main)] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Due</p>
          <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">{project.dueDate || 'TBD'}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex -space-x-3">
          {project.members.slice(0, 4).map((member) => (
            <div
              key={member.id}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--bg-darker)] bg-[var(--bg-main)] text-[11px] font-black text-[var(--text-primary)]"
            >
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
              ) : (
                member.name
                  .split(' ')
                  .map((part) => part.charAt(0))
                  .join('')
                  .slice(0, 2)
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <Users size={15} />
          <CalendarRange size={15} />
          <Crown size={15} className="text-[var(--accent-warm)]" />
        </div>
      </div>
    </Link>
  );
};
