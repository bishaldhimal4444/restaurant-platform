import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionToken } from '../../lib/auth/session';
import { listTables } from '../../lib/api/tables';
import type { Table } from '../../lib/types';

function getSection(tableNumber: number): 'MAIN' | 'ROOFTOP' | null {
  if (tableNumber >= 1 && tableNumber <= 10) return 'MAIN';
  if (tableNumber >= 11 && tableNumber <= 20) return 'ROOFTOP';
  return null;
}

function TableCard({ table }: { table: Table }) {
  return (
    <Link
      href={`/tables/${table.id}`}
      className="rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
    >
      <h2 className="text-lg font-semibold">Table {table.number}</h2>
      <p className="mt-1 text-sm text-zinc-500">Seats {table.capacity}</p>
      <p
        className={`mt-2 text-xs font-medium uppercase tracking-wide ${
          table.status === 'AVAILABLE' ? 'text-emerald-600' : 'text-amber-600'
        }`}
      >
        {table.status}
      </p>
    </Link>
  );
}

function TableSection({ title, tables }: { title: string; tables: Table[] }) {
  if (tables.length === 0) return null;
  return (
    <div className="mt-8">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {tables
          .slice()
          .sort((a, b) => a.number - b.number)
          .map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
      </div>
    </div>
  );
}

export default async function TablesPage() {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  const tables = await listTables(token);
  const mainTables = tables.filter((t) => getSection(t.number) === 'MAIN');
  const rooftopTables = tables.filter((t) => getSection(t.number) === 'ROOFTOP');
  const otherTables = tables.filter((t) => getSection(t.number) === null);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tables</h1>
        <Link
          href="/tables/new"
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Add table
        </Link>
      </div>

      {tables.length === 0 ? (
        <p className="mt-8 text-zinc-500">No tables yet. Add your first one.</p>
      ) : (
        <>
          <TableSection title="Main Entrance" tables={mainTables} />
          <TableSection title="Rooftop" tables={rooftopTables} />
          <TableSection title="Other" tables={otherTables} />
        </>
      )}
    </div>
  );
}
