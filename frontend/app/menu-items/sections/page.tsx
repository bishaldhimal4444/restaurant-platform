import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionToken } from '../../../lib/auth/session';
import { listMenuSections } from '../../../lib/api/menu-items';
import { SectionRow } from './section-row';

export default async function MenuSectionsPage() {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  const sections = await listMenuSections(token);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Menu Sections</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Organize your menu into categories like Breakfast, Main Course, Drinks, etc.
          </p>
        </div>
        <Link
          href="/menu-items/sections/new"
          className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Add section
        </Link>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 p-8 text-center dark:border-zinc-800">
          <p className="text-zinc-500">No menu sections yet. Create your first section to organize your menu.</p>
          <Link
            href="/menu-items/sections/new"
            className="mt-4 inline-block rounded-full bg-zinc-900 px-4 py-1.5 text-sm text-white hover:bg-zinc-700"
          >
            Create first section
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {sections
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((section, index) => (
              <SectionRow key={section.id} section={section} />
            ))}
        </div>
      )}
    </div>
  );
}
