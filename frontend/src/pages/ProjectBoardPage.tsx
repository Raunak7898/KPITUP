import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    deleteProject,
    deleteTask,
    acceptTask,
    submitTaskForReview,
    reviewTask,
  } = useStore();
  const navigate = useNavigate();

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

  const handleDeleteProject = async () => {
    await deleteProject(project.id);
    navigate(isAdmin ? '/admin' : '/dashboard');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <ProjectHeader project={project} currentUser={currentUser} onDeleteProject={handleDeleteProject} />

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
              <div className="app-scroll min-w-0 overflow-x-auto pb-2">
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
                      renderTaskExtras={(task) => isAdmin ? (
                        <div className="mt-3 space-y-2 border-t border-[var(--border-color)] pt-3">
                          <textarea
                            placeholder="Feedback (optional)"
                            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]"
                            rows={2}
                            id={`feedback-${task.id}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const feedback = (document.getElementById(`feedback-${task.id}`) as HTMLTextAreaElement)?.value;
                                reviewTask(project.id, task.id, 'approved', feedback);
                              }}
                              className="btn-primary-theme flex-1 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest transition hover:opacity-90"
                            >
                              Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const feedback = (document.getElementById(`feedback-${task.id}`) as HTMLTextAreaElement)?.value;
                                reviewTask(project.id, task.id, 'changes_requested', feedback);
                              }}
                              className="btn-warm-theme flex-1 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest transition hover:opacity-90"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ) : null}
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
