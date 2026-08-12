'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  listPublicTables,
  requestCheckIn,
  GuestApiError,
  type PublicTable,
  type GuestSession,
} from './guest-client';

type Screen = 'tables' | 'check-in' | 'waiting';

const PINK = '#FF3E80';
const GOLD = '#E8B44C';
const GREEN = '#2ECC71';
const RED = '#FF4D4D';
const TEAL = '#2FD9C4';
const GLASS = 'rgba(255,255,255,0.07)';
const GLASS_BORDER = 'rgba(255,255,255,0.16)';
const PAPER = '#FBF1E6';

// Frontend-only section mapping: numbers 1-10 = Main Entrance (M1-M10),
// numbers 11-20 = Rooftop (R1-R10). No backend/schema change needed.
function getSection(tableNumber: number): 'MAIN' | 'ROOFTOP' | null {
  if (tableNumber >= 1 && tableNumber <= 10) return 'MAIN';
  if (tableNumber >= 11 && tableNumber <= 20) return 'ROOFTOP';
  return null;
}

function getDisplayLabel(tableNumber: number): string {
  const section = getSection(tableNumber);
  if (section === 'MAIN') return `M${tableNumber}`;
  if (section === 'ROOFTOP') return `R${tableNumber - 10}`;
  return String(tableNumber);
}

function Skyline() {
  const buildings = [18, 34, 22, 46, 28, 60, 24, 40, 30, 52, 20, 36, 26];
  return (
    <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="w-full h-14 opacity-40">
      {buildings.map((h, i) => (
        <rect
          key={i}
          x={i * (400 / buildings.length)}
          y={60 - h}
          width={400 / buildings.length - 2}
          height={h}
          fill={i % 3 === 0 ? GOLD : '#F7EFE1'}
        />
      ))}
    </svg>
  );
}

function VipTableCard({
  table,
  onSelect,
}: {
  table: PublicTable;
  onSelect: (t: PublicTable) => void;
}) {
  const available = table.status === 'AVAILABLE';
  const label = getDisplayLabel(table.number);

  return (
    <button
      onClick={() => onSelect(table)}
      disabled={!available}
      className={`group relative overflow-hidden rounded-2xl p-5 text-left backdrop-blur-md transition ${
        available ? 'cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed opacity-60'
      }`}
      style={{
        background: GLASS,
        border: `1px solid ${available ? 'rgba(46,204,113,0.4)' : 'rgba(255,77,77,0.4)'}`,
        boxShadow: available ? `0 0 24px rgba(46,204,113,0.15)` : `0 0 16px rgba(255,77,77,0.1)`,
      }}
    >
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.25em]"
        style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono-ticket)' }}
      >
        Table
      </div>
      <div className="mt-1 text-6xl leading-none" style={{ color: PAPER, fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
        {label}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div style={{ fontFamily: 'var(--font-mono-ticket)' }}>
          <div className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Seats
          </div>
          <div className="text-sm font-semibold" style={{ color: PAPER }}>
            {table.capacity}
          </div>
        </div>

        {available ? (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: GREEN }} />
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: GREEN, fontFamily: 'var(--font-mono-ticket)' }}>
              Available
            </span>
          </div>
        ) : (
          <div
            className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{ background: 'rgba(255,77,77,0.15)', color: RED, fontFamily: 'var(--font-mono-ticket)' }}
          >
            Reserved
          </div>
        )}
      </div>
    </button>
  );
}

function TableSection({
  title,
  subtitle,
  tables,
  onSelect,
}: {
  title: string;
  subtitle: string;
  tables: PublicTable[];
  onSelect: (t: PublicTable) => void;
}) {
  if (tables.length === 0) return null;
  return (
    <div className="mt-10">
      <div className="flex items-baseline gap-3">
        <h3 className="text-lg" style={{ color: PAPER, fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontWeight: 600 }}>
          {title}
        </h3>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono-ticket)' }}>
          {subtitle}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {tables
          .slice()
          .sort((a, b) => a.number - b.number)
          .map((table) => (
            <VipTableCard key={table.id} table={table} onSelect={onSelect} />
          ))}
      </div>
    </div>
  );
}

export default function GuestLandingPage() {
  const [screen, setScreen] = useState<Screen>('tables');
  const [tables, setTables] = useState<PublicTable[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [tablesError, setTablesError] = useState<string | null>(null);

  const [selectedTable, setSelectedTable] = useState<PublicTable | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [, setSession] = useState<GuestSession | null>(null);

  const loadTables = useCallback(async () => {
    try {
      const data = await listPublicTables();
      setTables(data);
      setTablesError(null);
    } catch {
      setTablesError('Could not load tables. Please try again.');
    } finally {
      setLoadingTables(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
    if (screen !== 'tables') return;
    const interval = setInterval(loadTables, 5000);
    return () => clearInterval(interval);
  }, [loadTables, screen]);

  function pickTable(table: PublicTable) {
    if (table.status !== 'AVAILABLE') return;
    setSelectedTable(table);
    setCheckInError(null);
    setScreen('check-in');
  }

  async function submitCheckIn(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTable) return;
    setSubmitting(true);
    setCheckInError(null);
    try {
      const created = await requestCheckIn(selectedTable.id, {
        guestName: guestName.trim() || undefined,
        guestPhone: guestPhone.trim() || undefined,
      });
      setSession(created);
      setScreen('waiting');
    } catch (err) {
      if (err instanceof GuestApiError && err.body && typeof err.body === 'object' && 'message' in err.body) {
        setCheckInError(String((err.body as { message: unknown }).message));
      } else {
        setCheckInError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (screen === 'tables') {
    const mainTables = tables.filter((t) => getSection(t.number) === 'MAIN');
    const rooftopTables = tables.filter((t) => getSection(t.number) === 'ROOFTOP');

    return (
      <main className="mx-auto max-w-4xl px-6 py-14">
        <div className="text-[11px] font-semibold uppercase tracking-[0.35em]" style={{ color: TEAL, fontFamily: 'var(--font-mono-ticket)' }}>
          New Baneswor, Kathmandu
        </div>

        <h1 className="mt-3 text-6xl sm:text-7xl leading-[0.95]" style={{ color: PAPER, fontFamily: 'var(--font-display)', letterSpacing: '0.01em' }}>
          CITYSCAPE
        </h1>
        <div className="mt-1 text-2xl" style={{ color: GOLD, fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontWeight: 600 }}>
          Legacy Lounge &amp; Bar
        </div>

        <p className="mt-5 max-w-xl text-[15px] leading-relaxed" style={{ color: 'rgba(251,241,230,0.75)' }}>
          Signature cocktails, rooftop views, and late-night dance parties above New
          Baneswor. Perfect for birthdays, anniversaries, or a Friday worth
          celebrating — peaceful skyline views up top, the party downstairs.
        </p>

        <div className="mt-6">
          <Skyline />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            { label: 'Hours', value: '11:00 AM – 11:00 PM' },
            { label: 'Reservations', value: '98 2327 4624' },
            { label: 'Location', value: 'New Baneswor, KTM' },
          ].map((item) => (
            <div key={item.label} className="rounded-full px-4 py-2 backdrop-blur-md" style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}>
              <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono-ticket)' }}>
                {item.label}{' '}
              </span>
              <span className="text-xs font-medium" style={{ color: PAPER }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <h2 className="mt-12 mb-1 text-xl" style={{ color: PAPER, fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontWeight: 600 }}>
          Reserve your table
        </h2>

        {loadingTables && <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading tables…</p>}
        {tablesError && <p style={{ color: PINK }}>{tablesError}</p>}

        <TableSection title="Main Entrance" subtitle="M1 – M10 · Seats 4" tables={mainTables} onSelect={pickTable} />
        <TableSection title="Rooftop View" subtitle="R1 – R10 · Seats 4" tables={rooftopTables} onSelect={pickTable} />
      </main>
    );
  }

  if (screen === 'check-in' && selectedTable) {
    const label = getDisplayLabel(selectedTable.number);
    return (
      <main className="mx-auto max-w-md px-6 py-14">
        <button onClick={() => setScreen('tables')} className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono-ticket)' }}>
          ← Back to tables
        </button>

        <div className="mt-6 overflow-hidden rounded-2xl p-6 backdrop-blur-md" style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono-ticket)' }}>
            Checking in — Table
          </div>
          <div className="mt-1 text-6xl leading-none" style={{ color: PAPER, fontFamily: 'var(--font-display)' }}>
            {label}
          </div>

          <form onSubmit={submitCheckIn} className="mt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono-ticket)' }}>
                Name
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-[15px] outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${GLASS_BORDER}`, color: PAPER }}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono-ticket)' }}>
                Phone
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-[15px] outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${GLASS_BORDER}`, color: PAPER }}
                placeholder="Your phone number"
              />
            </div>

            {checkInError && (
              <p className="text-sm" style={{ color: PINK }}>
                {checkInError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg py-3 text-[15px] font-semibold transition disabled:opacity-50"
              style={{ background: PINK, color: '#1B1330' }}
            >
              {submitting ? 'Checking in…' : 'Check in'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (screen === 'waiting' && selectedTable) {
    const label = getDisplayLabel(selectedTable.number);
    return (
      <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(255,62,128,0.15)' }}>
          <span className="h-3 w-3 rounded-full animate-pulse" style={{ background: PINK }} />
        </div>
        <h1 className="mt-6 text-3xl" style={{ color: PAPER, fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontWeight: 600 }}>
          Almost there
        </h1>
        <p className="mt-3 text-[15px]" style={{ color: 'rgba(251,241,230,0.7)' }}>
          We&apos;ve let the staff know you&apos;re at Table {label}.
          Hang tight while they confirm your check-in.
        </p>
        <div className="mt-8 text-xs uppercase tracking-widest" style={{ color: TEAL, fontFamily: 'var(--font-mono-ticket)' }}>
          Waiting for confirmation…
        </div>
      </main>
    );
  }

  return null;
}
