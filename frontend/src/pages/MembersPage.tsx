import { useMemo, useState } from 'react';
import { Mail, Search, Trophy, Users } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { useStore } from '../store';

const buildNameFromEmail = (email: string) =>
  email
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function MembersPage() {
  const { projects, addMember, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? '');

  const members = useMemo(() => {
    const stats = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        role: 'admin' | 'member';
        avatar?: string;
        isOnline?: boolean;
        totalPoints: number;
        projects: string[];
        todo: number;
        active: number;
        review: number;
        done: number;
      }
    >();

    projects.forEach((project) => {
      project.members.forEach((member) => {
        const emailKey = member.email.toLowerCase();
        const existing = stats.get(emailKey) ?? {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          avatar: member.avatar,
          isOnline: member.isOnline,
          totalPoints: 0,
          projects: [],
          todo: 0,
          active: 0,
          review: 0,
          done: 0,
        };
        
        // Update presence/avatar/points
        if (member.isOnline) existing.isOnline = true;
        if (member.avatar) existing.avatar = member.avatar;
        if (member.totalPoints) existing.totalPoints = Math.max(existing.totalPoints, member.totalPoints);

        if (!existing.projects.includes(project.name)) {
          existing.projects = [...existing.projects, project.name];
        }

        stats.set(emailKey, existing);
      });

      project.tasks.forEach((task) => {
        const entry = stats.get(task.assigneeEmail.toLowerCase());
        if (!entry) {
          return;
        }

        if (task.status === 'To Do') entry.todo += 1;
        if (task.status === 'In Progress') entry.active += 1;
        if (task.status === 'In Review') entry.review += 1;
        if (task.status === 'Done') entry.done += 1;
      });
    });

    return Array.from(stats.values()).filter((member) =>
      `${member.name} ${member.email}`.toLowerCase().includes(search.toLowerCase()),
    );
  }, [projects, search]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="app-scroll flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="panel-card rounded-[32px] p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Workspace Directory</p>
                  <h1 className="mt-3 text-4xl font-black text-[var(--text-primary)]">Everyone participating across active projects.</h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
                    Use this directory to see who is in each project and how many tasks they have in To Do, In Progress,
                    In Review, and Done.
                  </p>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search member name or email"
                    className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] py-3.5 pl-12 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)] sm:w-80"
                  />
                </div>
              </div>
            </section>

            <section className="panel-card rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Invite By Email</p>
                  <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">Add a member to a project team</h2>
                </div>
                {currentUser?.role !== 'admin' ? (
                  <span className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm text-[var(--text-secondary)]">
                    Admin only
                  </span>
                ) : null}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (currentUser?.role !== 'admin' || !inviteEmail.trim() || !selectedProjectId) {
                    return;
                  }

                  addMember(selectedProjectId, {
                    name: buildNameFromEmail(inviteEmail),
                    email: inviteEmail.toLowerCase(),
                    title: 'Contributor',
                  });
                  setInviteEmail('');
                }}
                className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px_auto]"
              >
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="member@company.com"
                    className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] py-3.5 pl-12 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                  />
                </div>
                <select
                  value={selectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={currentUser?.role !== 'admin'}
                  className="btn-primary-theme rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add Member
                </button>
              </form>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {members.map((member) => (
                <div key={member.email} className="panel-card rounded-[28px] p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-main)] text-sm font-black text-[var(--text-primary)] overflow-hidden shrink-0">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        member.name
                          .split(' ')
                          .map((part) => part.charAt(0))
                          .join('')
                          .slice(0, 2)
                      )}
                      {member.isOnline && (
                        <span className="absolute bottom-0 right-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--bg-card)] bg-emerald-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-xl font-black text-[var(--text-primary)]">{member.name}</h3>
                          {member.role === 'admin' ? (
                            <span className="rounded-full bg-[var(--accent-warm)]/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent-warm)]">
                              Admin
                            </span>
                          ) : null}
                        </div>
                        {member.role === 'member' && (
                          <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 border border-yellow-500/20">
                            <Trophy size={12} className="text-yellow-500" />
                            <span className="text-[11px] font-black text-yellow-500">{member.totalPoints || 0}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm text-[var(--text-secondary)]">{member.email}</p>
                        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${member.isOnline ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${member.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-[var(--text-muted)]'}`} />
                          {member.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {member.projects.map((projectName) => (
                      <span key={projectName} className="rounded-full bg-[var(--bg-main)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                        {projectName}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-4 gap-3">
                    {[
                      { label: 'To Do', value: member.todo },
                      { label: 'Active', value: member.active },
                      { label: 'Review', value: member.review },
                      { label: 'Done', value: member.done },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[20px] bg-[var(--bg-main)] px-3 py-3 text-center">
                        <p className="text-lg font-black text-[var(--text-primary)]">{item.value}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {!members.length ? (
              <div className="panel-card rounded-[28px] px-6 py-12 text-center">
                <Users className="mx-auto text-[var(--text-muted)]" size={32} />
                <p className="mt-3 text-sm text-[var(--text-secondary)]">No members match your search.</p>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
