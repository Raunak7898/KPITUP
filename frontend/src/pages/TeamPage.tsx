import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCheck, Mail, UserPlus } from 'lucide-react';
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

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const { projects, addMember, currentUser } = useStore();
  const project = projects.find((entry) => entry.id === id);
  const [inviteEmail, setInviteEmail] = useState('');

  if (!project) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="app-scroll flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center gap-4">
              <Link
                to={`/project/${project.id}`}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Project Team</p>
                <h1 className="mt-2 text-3xl font-black text-[var(--text-primary)]">{project.name}</h1>
              </div>
            </div>

            <section className="panel-card rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Invite Member</p>
                  <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">Add a new project contributor</h2>
                </div>
                {currentUser?.role !== 'admin' ? (
                  <span className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm text-[var(--text-secondary)]">
                    Only admin can add members
                  </span>
                ) : null}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (currentUser?.role !== 'admin' || !inviteEmail.trim()) {
                    return;
                  }

                  addMember(project.id, {
                    name: buildNameFromEmail(inviteEmail),
                    email: inviteEmail.toLowerCase(),
                    title: 'Project Contributor',
                  });
                  setInviteEmail('');
                }}
                className="mt-5 flex flex-col gap-3 md:flex-row"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="member@company.com"
                    className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] py-3.5 pl-12 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={currentUser?.role !== 'admin'}
                  className="btn-primary-theme inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserPlus size={16} />
                  Add Member
                </button>
              </form>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              {project.members.map((member) => (
                <div key={member.id} className="panel-card rounded-[28px] p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-main)] text-sm font-black text-[var(--text-primary)]">
                      {member.name
                        .split(' ')
                        .map((part) => part.charAt(0))
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[var(--text-primary)]">{member.name}</h3>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">{member.email}</p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--bg-main)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        <CheckCheck size={12} />
                        {member.role === 'admin' ? 'Admin' : member.title || 'Member'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
