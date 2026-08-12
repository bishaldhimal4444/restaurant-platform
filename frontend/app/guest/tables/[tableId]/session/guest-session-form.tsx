'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface GuestSessionFormProps {
  tableId: string;
  ts: string;
  sig: string;
}

export function GuestSessionForm({ tableId, ts, sig }: GuestSessionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/guest/tables/${tableId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ts,
          sig,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to start session');
      }

      const session = await res.json();
      // Redirect to menu page
      router.push(`/guest/session/${session.id}/menu`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="guestName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Your Name *
        </label>
        <input
          type="text"
          id="guestName"
          required
          value={formData.guestName}
          onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="guestPhone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Phone Number *
        </label>
        <input
          type="tel"
          id="guestPhone"
          required
          value={formData.guestPhone}
          onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700"
          placeholder="98XXXXXXXX"
        />
      </div>

      <div>
        <label htmlFor="guestEmail" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email (optional)
        </label>
        <input
          type="email"
          id="guestEmail"
          value={formData.guestEmail}
          onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700"
          placeholder="john@example.com"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {loading ? 'Starting Session...' : 'Start Ordering'}
      </button>
    </form>
  );
}
