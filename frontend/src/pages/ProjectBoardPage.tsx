import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, CheckCheck, CircleDot, Loader, Plus, ShieldCheck } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { ProjectHeader } from '../components/ProjectHeader';
import { KanbanColumn } from '../components/KanbanColumn';
import { TaskModal } from '../components/TaskModal';
import { StoriesView } from '../components/StoriesView';
import { Task } from '../types';
import { useStore } from '../store';

export default function ProjectBoardPage() {
  const { id } = useParams<{ id: string }>();
  const {
    projects,
    currentUser,
    allMembers,
    addTask,
    updateTask,
    deleteTask,
    acceptTask,
    submitTaskForReview,
    reviewTask,
  } = useStore();

  const project = projects.find((entry) => entry.id === id) ?? projects[0];
  const isAdmin = currentUser?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'stories' | 'tasks'>('tasks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  const reviewTasks = useMemo(
    () => project?.tasks.filter((task) => task.status === 'In Review') ?? [],
    [project?.tasks],
  );

  if (!project) {
    return null;
  }

  const getTasksByStatus = (status: Task['status']) => project.tasks.filter((task) => task.status === status);

  const handleTaskSave = (taskData: {
    title: string;
    description: string;
    priority: Task['priority'];
    assigneeId: string;
    dueDate?: string;
  }) => {
    if (selectedTask) {
      updateTask(project.id, selectedTask.id, taskData);
    } else {
      addTask(project.id, taskData);
    }

    setSelectedTask(undefined);
    setIsModalOpen(false);
  };

  const getPrimaryActionLabel = (task: Task) => {
    if (!currentUser || currentUser.email.toLowerCase() !== task.assigneeEmail.toLowerCase()) {
      return null;
    }

    if (task.status === 'To Do') {
      return 'Accept Task';
    }

    if (task.status === 'In Progress') {
      return 'Submit For Review';
    }

    return null;
  };

  const handlePrimaryAction = (task: Task) => {
    if (task.status === 'To Do') {
      acceptTask(project.id, task.id);
      return;
    }

    if (task.status === 'In Progress') {
      submitTaskForReview(project.id, task.id);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <ProjectHeader project={project} currentUser={currentUser} />

        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6">
          <div className="flex items-center gap-1">
            {[
              { id: 'tasks', label: 'Task Board', icon: CircleDot },
              { id: 'stories', label: 'User Stories', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'stories' | 'tasks')}
                  className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] transition ${
                    isActive
                      ? 'border-[var(--accent-blue)] text-[var(--accent-blue)]'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'tasks' && isAdmin ? (
            <button
              onClick={() => {
                setSelectedTask(undefined);
                setIsModalOpen(true);
              }}
              className="btn-primary-theme inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition"
            >
              <Plus size={16} />
              Create Task
            </button>
          ) : null}
        </div>

        <main className="app-scroll flex-1 overflow-auto px-6 py-6">
          {activeTab === 'stories' ? (
            <StoriesView projectId={project.id} isAdmin={isAdmin} />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                <div className="app-scroll overflow-x-auto pb-2">
                  <div className="flex min-w-max gap-5">
                    <KanbanColumn
                      status="To Do"
                      tasks={getTasksByStatus('To Do')}
                      icon={CircleDot}
                      description="Freshly assigned work waiting for the assignee to accept."
                      onTaskClick={(task) => {
                        if (isAdmin) {
                          setSelectedTask(task);
                          setIsModalOpen(true);
                        }
                      }}
                      getPrimaryActionLabel={getPrimaryActionLabel}
                      onPrimaryAction={handlePrimaryAction}
                    />
                    <KanbanColumn
                      status="In Progress"
                      tasks={getTasksByStatus('In Progress')}
                      icon={Loader}
                      description="Accepted tasks currently being worked on by the assigned member."
                      onTaskClick={(task) => {
                        if (isAdmin) {
                          setSelectedTask(task);
                          setIsModalOpen(true);
                        }
                      }}
                      getPrimaryActionLabel={getPrimaryActionLabel}
                      onPrimaryAction={handlePrimaryAction}
                    />
                    <KanbanColumn
                      status="In Review"
                      tasks={getTasksByStatus('In Review')}
                      icon={ShieldCheck}
                      description="Submitted work waiting for admin approval or rejection."
                      onTaskClick={(task) => {
                        if (isAdmin) {
                          setSelectedTask(task);
                          setIsModalOpen(true);
                        }
                      }}
                    />
                    <KanbanColumn
                      status="Done"
                      tasks={getTasksByStatus('Done')}
                      icon={CheckCheck}
                      description="Admin-approved work ready to close out."
                      onTaskClick={(task) => {
                        if (isAdmin) {
                          setSelectedTask(task);
                          setIsModalOpen(true);
                        }
                      }}
                    />
                  </div>
                </div>

                <aside className="panel-card h-fit rounded-[28px] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Review Snapshot</p>
                  <h3 className="mt-3 text-xl font-black text-[var(--text-primary)]">Admin queue for this project</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Submitted tasks land here and on the admin dashboard. Approve to move them into Done, reject to send
                    them back to In Progress.
                  </p>

                  <div className="mt-5 space-y-3">
                    {reviewTasks.length ? (
                      reviewTasks.map((task) => (
                        <div key={task.id} className="rounded-[22px] border border-[var(--border-color)] bg-[var(--bg-main)] p-4">
                          <p className="text-sm font-bold text-[var(--text-primary)]">{task.title}</p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            Submitted by {task.assigneeName}
                          </p>
                          {isAdmin && (
                            <div className="mt-3 space-y-2">
                              <textarea
                                placeholder="Feedback (optional)"
                                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]"
                                rows={2}
                                id={`feedback-${task.id}`}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const feedback = (document.getElementById(`feedback-${task.id}`) as HTMLTextAreaElement)?.value;
                                    reviewTask(project.id, task.id, 'approved', feedback);
                                  }}
                                  className="btn-primary-theme flex-1 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest transition hover:opacity-90"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const feedback = (document.getElementById(`feedback-${task.id}`) as HTMLTextAreaElement)?.value;
                                    reviewTask(project.id, task.id, 'changes_requested', feedback);
                                  }}
                                  className="btn-warm-theme flex-1 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest transition hover:opacity-90"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[22px] border border-dashed border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-8 text-center text-sm leading-6 text-[var(--text-muted)]">
                        No tasks are waiting for admin review in this project.
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          )}
        </main>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setSelectedTask(undefined);
          setIsModalOpen(false);
        }}
        onSave={handleTaskSave}
        onDelete={
          selectedTask
            ? () => {
                deleteTask(project.id, selectedTask.id);
                setSelectedTask(undefined);
                setIsModalOpen(false);
              }
            : undefined
        }
        initialTask={selectedTask}
        members={allMembers}
      />
    </div>
  );
}
