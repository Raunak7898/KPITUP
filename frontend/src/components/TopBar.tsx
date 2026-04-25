import { Bell, CheckCheck, LogOut, Moon, RefreshCw, Search, Settings2, Sun, Trash2, Trophy } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useStore } from '../store';
import { SettingsPanel } from './SettingsPanel';

export const TopBar = () => {
  const {
    currentUser,
    theme,
    toggleTheme,
    projects,
    logout,
    notifications,
    markAllNotificationsRead,
    dismissNotification,
    initializeAuth,
  } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [query, setQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Background sync for admin to catch new members
  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    
    const interval = setInterval(() => {
      initializeAuth();
    }, 30000); // 30s background sync

    return () => clearInterval(interval);
  }, [currentUser, initializeAuth]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await initializeAuth();
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const mobileLinks = [
    currentUser?.role === 'admin' ? { label: 'Admin', path: '/admin', matches: ['/admin'] } : null,
    { label: 'Calendar', path: '/calendar', matches: ['/calendar', '/roadmap'] },
    { label: 'Dashboard', path: '/dashboard', matches: ['/dashboard'] },
    { label: 'Projects', path: '/projects', matches: ['/projects', '/project/'] },
    { label: 'Members', path: '/members', matches: ['/members', '/team'] },
    { label: 'Tasks', path: '/my-tasks', matches: ['/my-tasks'] },
  ].filter(Boolean) as Array<{ label: string; path: string; matches: string[] }>;

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = query.toLowerCase();
    return projects.flatMap((project) => {
      const projectMatch = project.name.toLowerCase().includes(normalizedQuery)
        ? [{ id: `project-${project.id}`, label: project.name, meta: 'Project', path: `/project/${project.id}` }]
        : [];

      const taskMatches = project.tasks
        .filter(
          (task) =>
            task.title.toLowerCase().includes(normalizedQuery) ||
            task.description.toLowerCase().includes(normalizedQuery),
        )
        .slice(0, 3)
        .map((task) => ({
          id: task.id,
          label: task.title,
          meta: `${project.name} • ${task.status}`,
          path: `/project/${project.id}`,
        }));

      return [...projectMatch, ...taskMatches];
    });
  }, [projects, query]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <>
      <header className="relative z-40 flex items-center justify-between gap-4 border-b border-[var(--border-color)] bg-[var(--bg-main)] px-6 py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects & tasks..."
            className="w-full rounded-full border border-[var(--border-color)] bg-[var(--bg-darker)] py-3 pl-11 pr-5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)] focus:bg-[var(--bg-main)]"
          />

          {query.trim() ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] panel-card rounded-[24px] p-3" style={{zIndex: 50}}>
              {searchResults.length ? (
                searchResults.slice(0, 8).map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      navigate(result.path);
                      setQuery('');
                    }}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-[var(--bg-main)]"
                  >
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{result.label}</span>
                    <span className="text-xs text-[var(--text-muted)]">{result.meta}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-sm text-[var(--text-muted)]">No results found.</div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {/* Points Trophy */}
          {currentUser?.role === 'member' && (
            <div className="flex items-center gap-2 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 mr-2">
              <div className="relative">
                <Trophy size={18} className="text-yellow-500" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500/70 leading-none">Total Credits</span>
                <span className="text-sm font-black text-yellow-500 leading-none mt-1">{currentUser?.totalPoints || 0}</span>
              </div>
            </div>
          )}

          {/* Manual Sync */}
          <div className="group relative">
            <button
              onClick={handleManualSync}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)]"
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            </button>
            <span className="pointer-events-none absolute top-full left-1/2 mt-2.5 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-[var(--border-color)] bg-[var(--bg-darker)] px-3 py-1.5 text-[11px] font-bold tracking-wide text-[var(--text-primary)] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              {isSyncing ? 'Syncing...' : 'Sync Workspace'}
            </span>
          </div>

          {/* Theme Toggle */}
          <div className="group relative">
            <button
              onClick={toggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)]"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="pointer-events-none absolute top-full left-1/2 mt-2.5 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-[var(--border-color)] bg-[var(--bg-darker)] px-3 py-1.5 text-[11px] font-bold tracking-wide text-[var(--text-primary)] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </div>

          {/* Settings */}
          <div className="group relative">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)]"
            >
              <Settings2 size={18} />
            </button>
            <span className="pointer-events-none absolute top-full left-1/2 mt-2.5 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-[var(--border-color)] bg-[var(--bg-darker)] px-3 py-1.5 text-[11px] font-bold tracking-wide text-[var(--text-primary)] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              Settings
            </span>
          </div>

          {/* Notifications */}
          <div className="group relative">
            <button
              onClick={() => setIsNotificationsOpen((current) => !current)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)]"
            >
              <Bell size={18} />
              {unreadCount ? (
                <span className="absolute right-2 top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--accent-warm)] px-1 text-[10px] font-bold text-[var(--accent-warm-foreground)]">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <span className="pointer-events-none absolute top-full left-1/2 mt-2.5 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-[var(--border-color)] bg-[var(--bg-darker)] px-3 py-1.5 text-[11px] font-bold tracking-wide text-[var(--text-primary)] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              Notifications
            </span>

            {isNotificationsOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] panel-card w-[360px] rounded-[26px] p-3" style={{zIndex: 50}}>
                <div className="flex items-center justify-between border-b border-[var(--border-color)] px-2 pb-3">
                  <div>
                    <p className="text-sm font-black text-[var(--text-primary)]">Notifications</p>
                    <p className="text-xs text-[var(--text-muted)]">Workflow activity across projects</p>
                  </div>
                  <button
                    onClick={markAllNotificationsRead}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-main)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-primary)]"
                  >
                    <CheckCheck size={12} />
                    Mark all
                  </button>
                </div>

                <div className="app-scroll mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                  {notifications.length ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-[22px] border px-4 py-3 ${
                          notification.read
                            ? 'border-[var(--border-color)] bg-[var(--bg-main)]'
                            : 'border-[var(--accent-blue)]/20 bg-[rgba(255,255,255,0.08)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div 
                            className={notification.link ? 'cursor-pointer group/msg' : ''}
                            onClick={() => {
                              if (notification.link) {
                                navigate(notification.link);
                                setIsNotificationsOpen(false);
                              }
                            }}
                          >
                            <p className={`text-sm font-semibold text-[var(--text-primary)] ${notification.link ? 'group-hover/msg:text-blue-500 transition-colors' : ''}`}>{notification.message}</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">{notification.timestamp}</p>
                          </div>
                          <button
                            onClick={() => dismissNotification(notification.id)}
                            className="text-[var(--text-muted)] transition hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-10 text-center text-sm text-[var(--text-muted)]">No notifications yet.</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Logout */}
          <div className="group relative">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] text-red-400 transition hover:border-red-400/50 hover:text-red-300"
            >
              <LogOut size={18} />
            </button>
            <span className="pointer-events-none absolute top-full left-1/2 mt-2.5 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-[var(--border-color)] bg-[var(--bg-darker)] px-3 py-1.5 text-[11px] font-bold tracking-wide text-[var(--text-primary)] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              Sign Out
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-darker)] px-3 py-2">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bg-main)] text-sm font-black text-[var(--text-primary)] overflow-hidden">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : (
                currentUser?.name
                  ?.split(' ')
                  .map((part) => part.charAt(0))
                  .join('')
                  .slice(0, 2) || 'KP'
              )}
              {currentUser?.isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--bg-darker)] bg-emerald-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-black text-[var(--text-primary)]">{currentUser?.name || 'Guest User'}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {currentUser?.role === 'admin' ? 'Admin' : 'Member'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="lg:hidden border-b border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3">
        <div className="app-scroll flex gap-2 overflow-x-auto pb-1">
          {mobileLinks.map((item) => {
            const isActive = item.matches.some((match) => pathname.includes(match));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
                  isActive
                    ? 'bg-[var(--text-primary)] text-[var(--bg-main)]'
                    : 'border border-[var(--border-color)] bg-[var(--bg-darker)] text-[var(--text-secondary)]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
