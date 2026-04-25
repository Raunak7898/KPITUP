import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarRange, Crown, FolderPlus, Search, Sparkles, Trash2, Users } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { useStore } from '../store';

export default function ProjectsPage() {
  const { projects, addProject, deleteProject, currentUser } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const filteredProjects = useMemo(
    () => projects.filter((project) => project.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search],
  );

  const handleCreateProject = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addProject({
        name: name.trim(),
        description: description.trim(),
        dueDate: dueDate || undefined,
      });
      setName('');
      setDescription('');
      setDueDate('');
      setIsCreating(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (event: React.MouseEvent, projectId: string, projectName: string) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('ProjectsPage handleDeleteProject triggered for:', projectId);
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      await deleteProject(projectId);
      alert('Delete request sent to database.');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="app-scroll flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="panel-card relative overflow-hidden rounded-[32px] p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_24%)]" />
              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-4">
                  <span className="accent-badge">
                    <Sparkles size={14} />
                    Project Control Center
                  </span>
                  <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)]">Create projects, assign delivery teams, and track review-ready work.</h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
                      Admin creates projects from here. Every project board then controls stories, assignments,
                      member-driven execution, and final review.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search projects"
                      className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] py-3.5 pl-12 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)] sm:w-72"
                    />
                  </div>
                  {isAdmin ? (
                    <button
                      onClick={() => setIsCreating(true)}
                      className="btn-primary-theme inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-[0.18em] transition"
                    >
                      <FolderPlus size={16} />
                      New Project
                    </button>
                  ) : (
                    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                      Only admin can create projects.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {isCreating ? (
              <section className="panel-card rounded-[30px] p-6">
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Admin Action</p>
                  <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">Create a new project board</h2>
                </div>

                <form onSubmit={handleCreateProject} className="grid gap-4 lg:grid-cols-[1fr_1fr_220px_auto]">
                  <input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Project name"
                    className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                  />
                  <input
                    required
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What is this project about?"
                    className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                  />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary-theme rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="rounded-2xl border border-[var(--border-color)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => {
                const reviewCount = project.tasks.filter((task) => task.status === 'In Review').length;
                return (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="panel-card group relative cursor-pointer overflow-hidden rounded-[30px] p-6 transition hover:-translate-y-1"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.theme} opacity-60`} />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                          <span className="inline-flex rounded-full bg-[var(--bg-main)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-blue)]">
                            Premium board
                          </span>
                          <div>
                            <h3 className="text-2xl font-black text-[var(--text-primary)] transition group-hover:text-[var(--accent-blue)]">
                              {project.name}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{project.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="rounded-2xl bg-[var(--bg-card)] px-3 py-2 text-right">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Review</p>
                            <p className="mt-1 text-lg font-black text-[var(--text-primary)]">{reviewCount}</p>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition hover:bg-red-500 hover:text-white"
                              title="Delete Project"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[22px] bg-[var(--bg-card)] px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Tasks</p>
                          <p className="mt-2 text-lg font-black text-[var(--text-primary)]">{project.tasks.length}</p>
                        </div>
                        <div className="rounded-[22px] bg-[var(--bg-card)] px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Members</p>
                          <p className="mt-2 text-lg font-black text-[var(--text-primary)]">{project.members.length}</p>
                        </div>
                        <div className="rounded-[22px] bg-[var(--bg-card)] px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Due</p>
                          <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">{project.dueDate || 'TBD'}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex -space-x-3">
                          {project.members.slice(0, 4).map((member) => (
                            <div
                              key={member.id}
                              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--bg-darker)] bg-[var(--bg-main)] text-xs font-black text-[var(--text-primary)]"
                              title={member.name}
                            >
                              {member.name
                                .split(' ')
                                .map((part) => part.charAt(0))
                                .join('')
                                .slice(0, 2)}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-[var(--text-secondary)]">
                          <Users size={14} />
                          <CalendarRange size={14} />
                          <Crown size={14} className="text-[var(--accent-warm)]" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
