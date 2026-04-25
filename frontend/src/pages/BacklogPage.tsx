import { useStore } from '../store';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { AlertCircle, Calendar, Filter, ListTodo, MoreHorizontal, Plus } from 'lucide-react';

export default function BacklogPage() {
  const { projects } = useStore();

  const allTasks = projects.flatMap((project) => project.tasks.map((task) => ({ ...task, projectName: project.name })));
  const backlogTasks = allTasks.filter((task) => task.status === 'To Do');

  return (
    <div className="flex h-screen bg-[var(--bg-main)] overflow-hidden transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-wide">Backlog</h2>
                <p className="text-[var(--text-muted)] mt-1">Manage and prioritize tasks before they enter active sprints.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-darker)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  <Filter size={16} /> Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
                  <Plus size={18} /> New Item
                </button>
              </div>
            </div>

            <div className="bg-[var(--bg-darker)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-main)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                <div className="col-span-6">Task Name</div>
                <div className="col-span-2 text-center">Priority</div>
                <div className="col-span-2 text-center">Project</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              <div className="divide-y divide-[var(--border-color)]">
                {backlogTasks.length === 0 ? (
                  <div className="p-20 text-center text-[var(--text-muted)]">No tasks in backlog.</div>
                ) : (
                  backlogTasks.map((task) => (
                    <div key={task.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[var(--bg-card-hover)] transition-colors group">
                      <div className="col-span-6 flex items-center gap-3">
                        <ListTodo size={18} className="text-blue-500 shrink-0" />
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">{task.title}</span>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          task.priority === 'High' ? 'bg-red-500/10 text-red-500' :
                          task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-xs text-[var(--text-secondary)]">{task.projectName}</span>
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <button className="p-2 text-[var(--text-muted)] hover:text-blue-500 transition-colors">
                          <Calendar size={16} />
                        </button>
                        <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-[var(--bg-darker)] border border-[var(--border-color)] p-5 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{backlogTasks.filter((task) => task.priority === 'High').length}</p>
                  <p className="text-xs text-[var(--text-muted)]">High Priority Items</p>
                </div>
              </div>
              <div className="bg-[var(--bg-darker)] border border-[var(--border-color)] p-5 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ListTodo size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{backlogTasks.length}</p>
                  <p className="text-xs text-[var(--text-muted)]">Total Items</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
