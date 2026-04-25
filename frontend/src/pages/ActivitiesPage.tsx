import { useState } from 'react';
import { useStore, Notification } from '../store';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { Activity, CalendarDays, CheckSquare, Clock, Layers, ShieldCheck, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ActivitiesPage() {
  const { notifications } = useStore();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<Notification['type'] | 'all'>('all');

  const filteredNotifications = notifications.filter(n => 
    filterType === 'all' ? true : n.type === filterType
  );

  const filterOptions: { label: string; value: Notification['type'] | 'all' }[] = [
    { label: 'All Activity', value: 'all' },
    { label: 'Tasks', value: 'task' },
    { label: 'Members', value: 'member' },
    { label: 'Projects', value: 'project' },
    { label: 'Stories', value: 'story' },
    { label: 'Reviews', value: 'review' },
    { label: 'Deadlines', value: 'deadline' },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-main)] overflow-hidden transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-wide">Activity Log</h2>
                <p className="text-[var(--text-muted)] mt-1">A real-time timeline of everything happening in your workspace.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterType(opt.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                      filterType === opt.value
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-[var(--bg-darker)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Vertical Line for Timeline */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--border-color)]"></div>

              <div className="space-y-8">
                {filteredNotifications.length === 0 ? (
                  <div className="bg-[var(--bg-darker)] border border-[var(--border-color)] rounded-2xl p-20 text-center">
                    <Activity size={48} className="mx-auto text-[var(--border-color)] mb-4" />
                    <p className="text-[var(--text-muted)]">No activity matching this filter.</p>
                  </div>
                ) : (
                  filteredNotifications.map((activity) => (
                    <div key={activity.id} className="relative flex items-start gap-6 group">
                      {/* Icon Circle */}
                      <div className={`relative z-10 w-12 h-12 rounded-full border-4 border-[var(--bg-main)] flex items-center justify-center shrink-0 shadow-sm ${
                        activity.type === 'task' ? 'bg-blue-500 text-white' :
                        activity.type === 'member' ? 'bg-green-500 text-white' :
                        activity.type === 'deadline' ? 'bg-neutral-700 text-white' :
                        activity.type === 'review' ? 'bg-amber-500 text-slate-950' :
                        'bg-purple-500 text-white'
                      }`}>
                        {activity.type === 'task' && <CheckSquare size={18} />}
                        {activity.type === 'member' && <UserPlus size={18} />}
                        {activity.type === 'deadline' && <CalendarDays size={18} />}
                        {activity.type === 'project' && <Layers size={18} />}
                        {activity.type === 'review' && <ShieldCheck size={18} />}
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-[var(--bg-darker)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--text-muted)] group-hover:shadow-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                            <Clock size={12} /> {activity.timestamp}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            activity.type === 'task' ? 'bg-blue-500/10 text-blue-500' :
                            activity.type === 'member' ? 'bg-green-500/10 text-green-500' :
                            activity.type === 'deadline' ? 'bg-white/10 text-white' :
                            activity.type === 'review' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-purple-500/10 text-purple-500'
                          }`}>
                            {activity.type}
                          </span>
                        </div>
                        <p className="text-[var(--text-primary)] font-medium leading-relaxed">
                          {activity.message}
                        </p>
                        
                        {/* Interactive Context (Mocked) */}
                        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] flex items-center justify-center text-[8px] font-bold">
                              {activity.message.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-[var(--text-muted)]">Updated by <span className="text-[var(--text-primary)] font-medium">System</span></span>
                          </div>
                          {activity.link && (
                            <button 
                              onClick={() => navigate(activity.link!)}
                              className="text-xs text-blue-500 hover:underline font-semibold"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Load More Mock */}
            {filteredNotifications.length > 0 && (
              <div className="flex justify-center pt-4">
                <button className="px-8 py-3 bg-[var(--bg-darker)] border border-[var(--border-color)] rounded-xl text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all">
                  Load Older Activities
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
