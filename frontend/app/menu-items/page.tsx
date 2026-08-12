import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionToken } from '../../lib/auth/session';
import { listMenuItems } from '../../lib/api/menu-items';
import { MenuItemRow } from './menu-item-row';

export default async function MenuItemsPage() {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  const items = await listMenuItems();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Menu</h1>
        <Link
          href="/menu-items/new"
          className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Add item
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-zinc-500">No menu items yet. Add your first one to get started.</p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map((item) => (
            <MenuItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
