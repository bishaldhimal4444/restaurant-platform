'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useLogout } from '../hooks/use-auth';

export function Header() {
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();
  const logout = useLogout();

  if (pathname?.startsWith('/guest')) {
    return null;
  }

  return (
    <header className="border-b border-zinc-200 bg-zinc-950 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">CityScape</span>
          {isAuthenticated && (
            <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
              Owner Dashboard
            </span>
          )}
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {isLoading ? null : isAuthenticated ? (
            <>
              <Link href="/tables" className="text-zinc-300 hover:text-white hover:underline">
                Tables
              </Link>
              <Link href="/menu-items" className="text-zinc-300 hover:text-white hover:underline">
                Menu
              </Link>
              <Link href="/orders" className="text-zinc-300 hover:text-white hover:underline">
                Kitchen
              </Link>
              <span className="text-zinc-500">{user?.email}</span>
              <button
                onClick={() => logout.mutate()}
                className="rounded-full border border-zinc-700 px-4 py-1.5 text-zinc-200 hover:bg-zinc-800"
              >
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="text-zinc-300 hover:text-white hover:underline">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
