import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, CheckCircle2, KeyRound, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabase';

const slides = [
  { url: '/images/slide1.jpg' },
  { url: '/images/slide2.jpg' },
  { url: '/images/slide3.jpg', scaleX: -1 }
];

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  // Determine if we are in "set new password" mode (token in URL hash)
  const [mode, setMode] = useState<'request' | 'update'>('request');

  // Request mode state
  const [email, setEmail] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Update mode state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Slideshow
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Detect Supabase recovery token in URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      setMode('update');
    }

    // Also listen for the PASSWORD_RECOVERY auth event
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // --- Handler: Send Reset Email ---
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError('');
    setRequestLoading(true);

    // Determine redirect URL — works for both local dev and production
    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setRequestLoading(false);
    if (error) {
      setRequestError(error.message || 'Failed to send reset email. Please try again.');
    } else {
      setRequestSent(true);
    }
  };

  // --- Handler: Update Password ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');

    if (newPassword.length < 6) {
      setUpdateError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setUpdateError('Passwords do not match.');
      return;
    }

    setUpdateLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdateLoading(false);

    if (error) {
      setUpdateError(error.message || 'Failed to update password. Please try again.');
    } else {
      // Sign out the recovery session so user must log in fresh with new password
      await supabase.auth.signOut();
      setUpdateSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  const passwordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: '', width: '0%' };
    if (pwd.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' };
    if (pwd.length < 8) return { label: 'Weak', color: '#f97316', width: '40%' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Fair', color: '#eab308', width: '60%' };
    if (!/[^A-Za-z0-9]/.test(pwd)) return { label: 'Good', color: '#22c55e', width: '80%' };
    return { label: 'Strong', color: '#16a34a', width: '100%' };
  };

  const strength = passwordStrength(newPassword);

  return (
    <div className="h-screen w-full relative flex overflow-hidden bg-black">
      {/* Background Slideshow */}
      {slides.map((slide, index) => (
        <div
          key={slide.url}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${slide.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: slide.scaleX ? `scaleX(${slide.scaleX})` : 'none'
            }}
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>
      ))}

      {/* Left side branding */}
      <div className="absolute bottom-12 left-12 text-white z-10 max-w-lg hidden md:block">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-sac-green/90 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
            <KeyRound size={20} className="text-white" />
          </div>
          <span className="text-white/70 font-semibold text-sm tracking-widest uppercase">Account Recovery</span>
        </div>
        <h2 className="text-4xl font-bold leading-tight drop-shadow-lg text-white/90">
          Secure your account with a strong new password
        </h2>
        <div className="w-16 h-1 bg-sac-green mt-6 rounded-full opacity-80" />
      </div>

      {/* Panel */}
      <div className="relative z-10 w-full md:w-[450px] lg:w-[480px] ml-auto h-full overflow-y-auto flex flex-col justify-center bg-black/40 backdrop-blur-md border-l border-white/10 shadow-2xl p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">

          {/* Logo */}
          <div className="text-center">
            <div className="w-20 h-20 bg-sac-green/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-[0_0_30px_rgba(22,101,52,0.5)] border border-white/20">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {mode === 'request' ? 'Forgot Password?' : 'Set New Password'}
            </h1>
            <p className="text-gray-300 mt-2 font-medium text-sm">
              {mode === 'request'
                ? "Enter your email and we'll send you a reset link."
                : 'Create a strong password for your account.'}
            </p>
          </div>

          {/* ── REQUEST MODE ── */}
          {mode === 'request' && (
            <>
              {requestSent ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm p-6 text-center space-y-4">
                  <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
                  <h3 className="text-white font-bold text-lg">Check Your Inbox</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    We sent a password reset link to <span className="text-emerald-400 font-semibold">{email}</span>.
                    Click the link in the email to set a new password.
                  </p>
                  <p className="text-gray-400 text-xs">
                    Didn't receive it? Check your spam folder or{' '}
                    <button
                      onClick={() => setRequestSent(false)}
                      className="text-sac-green underline hover:text-emerald-400 transition-colors"
                    >
                      try again
                    </button>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestReset} className="space-y-5">
                  {requestError && (
                    <div className="rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm px-4 py-3 text-center">
                      {requestError}
                    </div>
                  )}
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sac-green transition-colors" size={18} />
                    <input
                      id="reset-email"
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-sac-green focus:border-transparent text-white placeholder-gray-400 font-medium backdrop-blur-sm transition-all"
                      placeholder="Your Email Address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="w-full bg-sac-green text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-[0_8px_20px_rgba(22,101,52,0.4)] hover:shadow-[0_12px_25px_rgba(22,101,52,0.6)] hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {requestLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <>Send Reset Link <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ── UPDATE PASSWORD MODE ── */}
          {mode === 'update' && (
            <>
              {updateSuccess ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm p-6 text-center space-y-4">
                  <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
                  <h3 className="text-white font-bold text-lg">Password Updated!</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Your password has been successfully changed. Redirecting you to login...
                  </p>
                  <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                    <div className="h-full bg-sac-green rounded-full animate-[shrink_3s_linear_forwards]" style={{ width: '100%' }} />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  {updateError && (
                    <div className="rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm px-4 py-3 text-center">
                      {updateError}
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-2">
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sac-green transition-colors" size={18} />
                      <input
                        id="new-password"
                        type={showNew ? 'text' : 'password'}
                        required
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-sac-green focus:border-transparent text-white placeholder-gray-400 font-medium backdrop-blur-sm transition-all"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {newPassword && (
                      <div className="space-y-1 px-1">
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: strength.width, backgroundColor: strength.color }}
                          />
                        </div>
                        <p className="text-xs font-medium" style={{ color: strength.color }}>
                          {strength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sac-green transition-colors" size={18} />
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-sac-green focus:border-transparent text-white placeholder-gray-400 font-medium backdrop-blur-sm transition-all"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Match indicator */}
                  {confirmPassword && (
                    <p className={`text-xs font-medium px-1 ${newPassword === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                      {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="w-full bg-sac-green text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-[0_8px_20px_rgba(22,101,52,0.4)] hover:shadow-[0_12px_25px_rgba(22,101,52,0.6)] hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {updateLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <>Update Password <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Back to login */}
          {!updateSuccess && (
            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white font-medium text-sm transition-colors hover:underline underline-offset-4 decoration-sac-green decoration-2"
              >
                <ArrowLeft size={15} />
                Back to Sign In
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
