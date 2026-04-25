import { useState } from 'react';
import { X, Bell, User, Shield, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const { currentUser, updateUser } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy'>('profile');
  const [notifTasks, setNotifTasks] = useState(true);
  const [notifMembers, setNotifMembers] = useState(true);
  const [notifProjects, setNotifProjects] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'privacy', label: 'Privacy', icon: Shield },
  ] as const;

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative transition-colors ${value ? 'bg-blue-500' : 'bg-[var(--bg-card-hover)]'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  const handleSaveProfile = () => {
    if (!displayName.trim() || !email.trim()) return;
    updateUser({ name: displayName.trim(), email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-[400px] h-full bg-[var(--bg-darker)] border-l border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden z-10 transition-colors">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-main)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Settings</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-main)]">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === key
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <>
              <section className="text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[var(--border-color)] mx-auto mb-4 bg-[var(--bg-card-hover)]">
                  <img src={`https://i.pravatar.cc/150?u=${currentUser?.email}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{currentUser?.name}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">{currentUser?.email}</p>
                <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  currentUser?.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {currentUser?.role === 'admin' ? '🛡️ Administrator' : '👤 Member'}
                </span>
              </section>

              <section>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Account Info</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wider">Display Name</label>
                    <input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg outline-none focus:border-blue-500 transition-colors"
                      placeholder="Your display name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg outline-none focus:border-blue-500 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {saved && (
                  <div className="mt-3 flex items-center gap-2 text-green-500 text-sm font-medium bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg">
                    <CheckCircle2 size={16} />
                    Profile saved successfully!
                  </div>
                )}

                <button
                  onClick={handleSaveProfile}
                  disabled={!displayName.trim() || !email.trim()}
                  className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </section>
            </>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <section>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Notify me about...</h3>
              <div className="bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)] divide-y divide-[var(--border-color)]">
                <div className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Task Updates</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">When tasks are moved or completed</p>
                  </div>
                  <Toggle value={notifTasks} onChange={() => setNotifTasks(v => !v)} />
                </div>
                <div className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Member Invites</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">When someone joins a project</p>
                  </div>
                  <Toggle value={notifMembers} onChange={() => setNotifMembers(v => !v)} />
                </div>
                <div className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Project Events</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">When projects are created or archived</p>
                  </div>
                  <Toggle value={notifProjects} onChange={() => setNotifProjects(v => !v)} />
                </div>
              </div>
            </section>
          )}

          {/* PRIVACY */}
          {activeTab === 'privacy' && (
            <section>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Data & Privacy</h3>
              <div className="bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)] divide-y divide-[var(--border-color)]">
                <div className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Profile Visibility</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Show your profile to teammates</p>
                  </div>
                  <Toggle value={true} onChange={() => {}} />
                </div>
                <div className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Activity Status</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Show when you are online</p>
                  </div>
                  <Toggle value={true} onChange={() => {}} />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <h4 className="text-sm font-bold text-red-500 mb-1">Danger Zone</h4>
                <p className="text-xs text-[var(--text-muted)] mb-3">These actions are permanent and cannot be undone.</p>
                <button className="w-full py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-semibold transition-colors">
                  Clear All Local Data
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
