'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
          <span className="text-2xl">✓</span> TaskFlow
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:inline">
              Hi, <span className="font-medium">{user.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="font-medium text-slate-600 hover:text-indigo-600">
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white transition hover:bg-indigo-700"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
