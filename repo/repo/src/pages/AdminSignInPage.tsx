import { useState } from 'react';
import { Lock, Mail, Heart, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { routeToHash } from '../lib/router';

export function AdminSignInPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const { error: err } = await fn(email.trim(), password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    // onAuthStateChange will redirect; the router also handles admin route guard
  };

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-hero-grid px-4 py-12">
      <div className="card w-full max-w-md p-8 sm:p-10">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 via-hotpink-500 to-sunny-400 text-white shadow-soft">
            <Heart className="h-7 w-7" fill="white" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-navy-900 sm:text-3xl">
            Team Sign-In
          </h1>
          <p className="mt-2 text-sm text-navy-600">
            {mode === 'signin'
              ? 'Welcome back. Sign in to manage MY Journal.'
              : 'Create your team account to start publishing.'}
          </p>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy-500">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@myjournal.org"
                className="w-full rounded-xl border-2 border-navy-100 bg-white py-3 pl-11 pr-4 font-semibold text-navy-800 outline-none transition-colors placeholder:text-navy-400 focus:border-teal-300"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy-500">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border-2 border-navy-100 bg-white py-3 pl-11 pr-4 font-semibold text-navy-800 outline-none transition-colors placeholder:text-navy-400 focus:border-teal-300"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border-2 border-hotpink-200 bg-hotpink-50 px-4 py-3 text-sm font-semibold text-hotpink-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn btn-pink w-full disabled:opacity-60"
          >
            {busy ? (
              'Please wait…'
            ) : (
              <>
                {mode === 'signin' ? (
                  <LogIn className="h-5 w-5" />
                ) : (
                  <UserPlus className="h-5 w-5" />
                )}
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-navy-600">
          {mode === 'signin' ? (
            <>
              New team member?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="font-bold text-teal-600 hover:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="font-bold text-teal-600 hover:underline"
              >
                Sign in instead
              </button>
            </>
          )}
        </div>

        <div className="mt-6 border-t border-navy-100 pt-5 text-center">
          <a
            href={routeToHash({ name: 'home' })}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-700"
          >
            Back to MY Journal
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
