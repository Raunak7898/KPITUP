import { Activity, Calendar, FileText, FolderKanban, LayoutDashboard, ListTodo, Settings, ShieldAlert, Users } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { BrandLockup } from './BrandLockup';

const isActive = (pathname: string, checks: string[]) => checks.some((check) => pathname.includes(check));

export const Sidebar = () => {
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const { projects, currentUser } = useStore();

  const activeLinkClass =
    'flex items-center gap-3 rounded-2xl bg-[var(--bg-main)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)]';
  const inactiveLinkClass =
    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)]';

  return (
    <aside className="app-scroll hidden h-screen w-[280px] shrink-0 overflow-y-auto border-r border-[var(--border-color)] bg-[var(--bg-darker)] lg:block">
      <div className="flex min-h-full flex-col px-5 py-6">
        <div className="mb-8">
          <BrandLockup variant="sidebar" />
        </div>

        <nav className="space-y-2">
          {currentUser?.role === 'admin' ? (
            <Link to="/admin" className={isActive(pathname, ['/admin']) ? activeLinkClass : inactiveLinkClass}>
              <ShieldAlert size={18} className="text-[var(--accent-warm)]" />
              Admin Panel
            </Link>
          ) : null}
          <Link to="/dashboard" className={pathname === '/dashboard' ? activeLinkClass : inactiveLinkClass}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link to="/projects" className={isActive(pathname, ['/projects', '/project/']) ? activeLinkClass : inactiveLinkClass}>
            <FolderKanban size={18} />
            Projects
          </Link>
          <Link to={id ? `/project/${id}/team` : '/members'} className={isActive(pathname, ['/members', '/team']) ? activeLinkClass : inactiveLinkClass}>
            <Users size={18} />
            Members
          </Link>
          <Link to="/my-tasks" className={isActive(pathname, ['/my-tasks']) ? activeLinkClass : inactiveLinkClass}>
            <ListTodo size={18} />
            My Tasks
          </Link>
          <Link to="/activities" className={isActive(pathname, ['/activities']) ? activeLinkClass : inactiveLinkClass}>
            <Activity size={18} />
            Activities
          </Link>
          <Link to="/reports" className={isActive(pathname, ['/reports']) ? activeLinkClass : inactiveLinkClass}>
            <FileText size={18} />
            Reports
          </Link>
          <Link to="/calendar" className={isActive(pathname, ['/calendar', '/roadmap']) ? activeLinkClass : inactiveLinkClass}>
            <Calendar size={18} />
            Calendar
          </Link>
          <Link to="/settings" className={isActive(pathname, ['/settings']) ? activeLinkClass : inactiveLinkClass}>
            <Settings size={18} />
            Settings
          </Link>
        </nav>

        <div className="mt-8 border-t border-[var(--border-color)] pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Project Boards</p>
          <div className="mt-4 space-y-2">
            {projects.map((project) => {
              const reviewCount = project.tasks.filter((task) => task.status === 'In Review').length;

              return (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className={`block rounded-[22px] border px-4 py-3 transition ${
                    id === project.id
                      ? 'border-[var(--accent-blue)] bg-[var(--bg-main)]'
                      : 'border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-main)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--text-primary)]">{project.name}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {project.tasks.length} tasks, {project.members.length} members
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--bg-card)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-primary)]">
                      {reviewCount}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
