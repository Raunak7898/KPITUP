import { useRef, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  FolderKanban,
  Info,
  Lock,
  ShieldCheck,
  Trash2,
  Upload,
  UserCircle,
  Users,
  XCircle,
  LucideIcon,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { useStore, ADMIN_EMAIL } from '../store';

const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-[var(--accent-blue)]' : 'bg-[var(--border-color)]'}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </button>
);

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <div className="panel-card rounded-[28px] p-6">{children}</div>
);

const SectionTitle = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
  <div className="mb-5 flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-[14px] border border-[var(--border-color)] bg-[var(--bg-main)]">
      <Icon size={16} className="text-[var(--accent-blue)]" />
    </div>
    <h2 className="text-base font-black text-[var(--text-primary)]">{label}</h2>
  </div>
);

export default function SettingsPage() {
  const { currentUser, changeAdminPassword, updateMemberAvatar } = useStore();
  const isAdmin = currentUser?.role === 'admin';

  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarResult, setAvatarResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarResult({ type: 'error', text: 'Please select a valid image file (PNG, JPG, GIF, WebP).' });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setAvatarResult({ type: 'error', text: 'Image must be smaller than 3 MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateMemberAvatar(dataUrl);
      setAvatarResult({ type: 'success', text: 'Profile picture updated successfully!' });
    };
    reader.readAsDataURL(file);
    // reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    updateMemberAvatar('');
    setAvatarResult({ type: 'success', text: 'Profile picture removed.' });
  };


  // Notification prefs (local UI state only)
  const [notifTasks, setNotifTasks] = useState(true);
  const [notifMembers, setNotifMembers] = useState(true);
  const [notifProjects, setNotifProjects] = useState(false);
  const [notifDeadlines, setNotifDeadlines] = useState(true);
  const [notifReviews, setNotifReviews] = useState(true);

  // Change-password form (admin only)
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdResult, setPwdResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdResult(null);

    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdResult({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (newPwd.length < 6) {
      setPwdResult({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdResult({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    const result = changeAdminPassword(currentPwd, newPwd);
    setPwdResult({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="app-scroll flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-4xl space-y-6">

            {/* Header */}
            <section className="panel-card rounded-[32px] p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-blue)]">Configuration</p>
              <h1 className="mt-3 text-4xl font-black text-[var(--text-primary)]">Project Settings</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Manage workspace preferences, notifications, and security for your KPITUP environment.
              </p>
            </section>

            {/* ── Profile Picture ── */}
            <SectionCard>
              <SectionTitle icon={UserCircle} label="Profile Picture" />
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* Avatar Preview */}
                <div className="relative shrink-0">
                  <div className="h-28 w-28 rounded-full border-4 border-[var(--border-color)] bg-[var(--bg-main)] overflow-hidden flex items-center justify-center shadow-lg">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-[var(--text-primary)]">
                        {currentUser?.name
                          ?.split(' ')
                          .map((p) => p.charAt(0))
                          .join('')
                          .slice(0, 2) || 'KP'}
                      </span>
                    )}
                  </div>
                  {/* Role badge */}
                  <span className={`absolute -bottom-1 -right-1 rounded-full border-2 border-[var(--bg-card)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isAdmin ? 'bg-[var(--accent-warm)] text-white' : 'bg-[var(--accent-blue)] text-white'
                  }`}>
                    {isAdmin ? 'Admin' : 'Member'}
                  </span>
                </div>

                {/* Upload controls */}
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{currentUser?.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{currentUser?.email}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      id="avatar-upload-input"
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--accent-blue)] bg-[var(--accent-blue)] px-5 py-2.5 text-sm font-bold text-[var(--accent-foreground)] shadow-sm transition hover:opacity-80"
                    >
                      <Upload size={15} />
                      {currentUser?.avatar ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {currentUser?.avatar && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-red-400/50 hover:text-red-400"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-muted)]">
                    Supported: PNG, JPG, GIF, WebP — max 3 MB. Your photo appears across the workspace.
                  </p>

                  {avatarResult && (
                    <div className={`flex items-center gap-2 rounded-[14px] border px-4 py-3 text-sm font-medium ${
                      avatarResult.type === 'success'
                        ? 'border-green-500/20 bg-green-500/10 text-green-400'
                        : 'border-red-500/20 bg-red-500/10 text-red-400'
                    }`}>
                      {avatarResult.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {avatarResult.text}
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* ── Workspace Info ── */}
            <SectionCard>
              <SectionTitle icon={FolderKanban} label="Workspace Info" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[18px] border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Workspace Name</p>
                  <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">KPITUP</p>
                </div>
                <div className="rounded-[18px] border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Admin Account</p>
                  <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{ADMIN_EMAIL}</p>
                </div>
                <div className="rounded-[18px] border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Your Role</p>
                  <p className={`mt-1 text-sm font-bold ${isAdmin ? 'text-[var(--accent-warm)]' : 'text-[var(--accent-blue)]'}`}>
                    {isAdmin ? '🛡️ Administrator' : '👤 Member'}
                  </p>
                </div>
                <div className="rounded-[18px] border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Logged in as</p>
                  <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{currentUser?.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{currentUser?.email}</p>
                </div>
              </div>
            </SectionCard>

            {/* ── Notifications ── */}
            <SectionCard>
              <SectionTitle icon={Bell} label="Notification Preferences" />
              <p className="mb-5 text-sm text-[var(--text-secondary)]">
                Choose which workspace events trigger in-app notifications.
              </p>
              <div className="divide-y divide-[var(--border-color)] rounded-[20px] border border-[var(--border-color)] bg-[var(--bg-main)] overflow-hidden">
                {[
                  { label: 'Task Updates', desc: 'When tasks are moved, accepted, or completed', value: notifTasks, toggle: () => setNotifTasks(v => !v) },
                  { label: 'Review Decisions', desc: 'When admin approves or returns a task', value: notifReviews, toggle: () => setNotifReviews(v => !v) },
                  { label: 'Member Invites', desc: 'When someone joins a project team', value: notifMembers, toggle: () => setNotifMembers(v => !v) },
                  { label: 'Deadline Alerts', desc: 'When a member deadline is approaching', value: notifDeadlines, toggle: () => setNotifDeadlines(v => !v) },
                  { label: 'Project Events', desc: 'When projects are created or archived', value: notifProjects, toggle: () => setNotifProjects(v => !v) },
                ].map(({ label, desc, value, toggle }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{desc}</p>
                    </div>
                    <Toggle value={value} onChange={toggle} />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── Members overview ── */}
            <SectionCard>
              <SectionTitle icon={Users} label="Access & Roles" />
              <p className="mb-5 text-sm text-[var(--text-secondary)]">
                Workspace access is controlled by the admin. Members are added per project.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Access Model', value: 'Invite Only', accent: false },
                  { label: 'Default Member Role', value: 'Contributor', accent: false },
                  { label: 'Admin Override', value: isAdmin ? 'Enabled' : 'N/A', accent: isAdmin },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="rounded-[18px] border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">{label}</p>
                    <p className={`mt-2 text-sm font-black ${accent ? 'text-[var(--accent-warm)]' : 'text-[var(--text-primary)]'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── Security (admin only) ── */}
            {isAdmin && (
              <SectionCard>
                <SectionTitle icon={Lock} label="Security — Change Admin Password" />
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { label: 'Current Password', value: currentPwd, setter: setCurrentPwd },
                      { label: 'New Password', value: newPwd, setter: setNewPwd },
                      { label: 'Confirm Password', value: confirmPwd, setter: setConfirmPwd },
                    ].map(({ label, value, setter }) => (
                      <label key={label} className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
                        <input
                          type="password"
                          value={value}
                          onChange={e => setter(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-[14px] border border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-blue)]"
                        />
                      </label>
                    ))}
                  </div>

                  {pwdResult && (
                    <div className={`flex items-center gap-2 rounded-[14px] border px-4 py-3 text-sm font-medium ${
                      pwdResult.type === 'success'
                        ? 'border-green-500/20 bg-green-500/10 text-green-400'
                        : 'border-red-500/20 bg-red-500/10 text-red-400'
                    }`}>
                      {pwdResult.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {pwdResult.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="rounded-[14px] border border-[var(--accent-blue)] bg-[var(--accent-blue)] px-6 py-2.5 text-sm font-bold text-[var(--accent-foreground)] shadow-sm transition hover:opacity-80"
                  >
                    Update Password
                  </button>
                </form>
              </SectionCard>
            )}

            {/* ── Security info (non-admin) ── */}
            {!isAdmin && (
              <SectionCard>
                <SectionTitle icon={ShieldCheck} label="Security" />
                <div className="rounded-[18px] border border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-5 text-sm text-[var(--text-secondary)]">
                  Password management is handled by the workspace admin. Contact your admin if you need access changes.
                </div>
              </SectionCard>
            )}

            {/* ── About ── */}
            <SectionCard>
              <SectionTitle icon={Info} label="About KPITUP" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Version', value: '1.0.0' },
                  { label: 'Stack', value: 'React + Vite' },
                  { label: 'Backend', value: 'Supabase' },
                  { label: 'License', value: 'MIT' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-[18px] border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">{label}</p>
                    <p className="mt-2 text-sm font-black text-[var(--text-primary)]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-[18px] border border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-4 text-sm text-[var(--text-secondary)]">
                KPITUP is an agile project management workspace built for structured delivery teams. Admin governs the full
                task lifecycle — creation, assignment, and final review — while members accept, execute, and submit their work.
              </div>
            </SectionCard>

          </div>
        </main>
      </div>
    </div>
  );
}
