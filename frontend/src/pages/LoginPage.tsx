import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, X } from 'lucide-react';
import { ADMIN_EMAIL, useStore } from '../store';
import { supabase } from '../lib/supabaseClient';



export default function LoginPage() {
  const navigate = useNavigate();
  const { resetAdminPassword, signup } = useStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState(ADMIN_EMAIL);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (!password.trim()) {
          setError('Please set a password for your account.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        
        const result = await signup({ name, email: normalizedEmail, password });
        if (result.success) {
          setSuccess(result.message);
          setMode('login');
          setPassword('');
        } else {
          setError(result.message);
        }
        setLoading(false);
        return;
      }

      // Login Flow
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        navigate(normalizedEmail === ADMIN_EMAIL ? '/admin' : '/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (event: React.FormEvent) => {
    event.preventDefault();

    if (!resetEmail.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setResetMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    if (newPassword.length < 6) {
      setResetMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetMessage({ type: 'error', text: 'New password and confirm password must match.' });
      return;
    }

    const result = resetAdminPassword(resetEmail, newPassword);
    setResetMessage({ type: result.success ? 'success' : 'error', text: result.message });

    if (result.success) {
      setPassword(newPassword);
      setEmail(resetEmail.trim().toLowerCase());
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070d1d] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(105,84,255,0.22),transparent_26%),radial-gradient(circle_at_center,rgba(61,78,180,0.14),transparent_32%),linear-gradient(180deg,#070d1d_0%,#091120_100%)]" />
        <div className="absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-[64px] border border-white/5 bg-[rgba(115,96,255,0.04)] blur-sm" />
        <div className="absolute left-1/2 top-1/2 h-[460px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-[44px] border border-white/[0.04]" />
        <div className="absolute left-1/2 top-1/2 h-[620px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-[56px] border border-white/[0.03]" />
      </div>

      <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <section className="w-full max-w-[460px] rounded-[34px] border border-white/10 bg-[rgba(10,18,37,0.88)] px-7 py-9 shadow-[0_28px_90px_rgba(3,8,20,0.72)] backdrop-blur-xl sm:px-10">
          <div className="text-center">
            <div className="mb-8 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 shadow-[0_0_36px_rgba(99,87,255,0.18)]">
              <span className="text-3xl font-black tracking-tight">
                <span className="text-[#16A34A]">KPIT</span>
                <span className="text-white">UP</span>
              </span>
            </div>
            <h1 className="text-[2.15rem] font-black tracking-tight text-white sm:text-[2.45rem]">
              {mode === 'login' ? 'Welcome back' : 'Join the Workspace'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {mode === 'login' 
                ? 'Enter your details to access your workspace.' 
                : 'Register to start collaborating with your delivery team.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error ? (
              <div className="rounded-[18px] border border-red-500/25 bg-red-500/12 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-[18px] border border-emerald-500/25 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            ) : null}

            {mode === 'signup' && (
              <label className="block space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-sm font-semibold text-slate-400">Full Name</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    className="h-14 w-full rounded-[18px] border border-white/10 bg-[#edf1ff] py-3 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-[#7b6cff] focus:bg-white"
                  />
                </div>
              </label>
            )}

            <label className="block space-y-2.5">
              <span className="text-sm font-semibold text-slate-400">Email Address</span>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  className="h-14 w-full rounded-[18px] border border-white/10 bg-[#edf1ff] py-3 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-[#7b6cff] focus:bg-white"
                />
              </div>
            </label>

            <label className="block space-y-2.5">
              <span className="text-sm font-semibold text-slate-400">
                {mode === 'login' ? 'Password' : 'Set Account Password'}
              </span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === 'login' ? 'Enter your password' : 'Min. 6 characters'}
                  className="h-14 w-full rounded-[18px] border border-white/10 bg-[#edf1ff] py-3 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-[#7b6cff] focus:bg-white"
                />
              </div>
            </label>

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email.trim().toLowerCase() || ADMIN_EMAIL);
                    setResetMessage(null);
                    setIsForgotOpen(true);
                  }}
                  className="text-sm font-semibold text-[#7f72ff] transition hover:text-[#a296ff]"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-[18px] bg-gradient-to-r from-[#6b5cff] via-[#5f56f6] to-[#5b4ade] text-base font-bold text-white shadow-[0_18px_40px_rgba(101,84,255,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(101,84,255,0.5)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Enter' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 space-y-4 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setSuccess('');
              }}
              className="text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Log in"}
            </button>
            <div className="pt-2">
              <p className="text-xs text-slate-600">Admin email: {ADMIN_EMAIL}</p>
            </div>
          </div>
        </section>
      </div>

      {isForgotOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,6,16,0.78)] p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(10,18,37,0.96)] shadow-[0_26px_90px_rgba(3,8,20,0.76)]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7f72ff]">Forgot Password</p>
                <h2 className="mt-2 text-2xl font-black text-white">Reset admin password</h2>
              </div>
              <button
                onClick={() => setIsForgotOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-slate-500 transition hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4 p-6">
              <p className="text-sm leading-6 text-slate-400">
                Use the admin email and set a new password. This is a local reset flow for the current demo app.
              </p>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Admin Email</span>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  className="w-full rounded-[18px] border border-white/10 bg-[#edf1ff] px-4 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-[#7b6cff] focus:bg-white"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-[18px] border border-white/10 bg-[#edf1ff] px-4 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-[#7b6cff] focus:bg-white"
                  placeholder="Enter new password"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Confirm Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-[18px] border border-white/10 bg-[#edf1ff] px-4 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-[#7b6cff] focus:bg-white"
                  placeholder="Confirm new password"
                />
              </label>

              {resetMessage ? (
                <div
                  className={`rounded-[18px] border px-4 py-3 text-sm ${
                    resetMessage.type === 'success'
                      ? 'border-green-500/20 bg-green-500/10 text-green-300'
                      : 'border-red-500/20 bg-red-500/10 text-red-300'
                  }`}
                >
                  {resetMessage.text}
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-[18px] bg-gradient-to-r from-[#6b5cff] via-[#5f56f6] to-[#5b4ade] px-4 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(101,84,255,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(101,84,255,0.4)]"
              >
                Reset Password
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
