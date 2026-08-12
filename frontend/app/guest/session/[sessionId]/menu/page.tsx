import { listMenuItems } from '../../../../../lib/api/menu-items';
import { MenuList } from './menu-list';
import { CartButton } from './cart-button';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function GuestMenuPage({ params }: PageProps) {
  const { sessionId } = await params;

  let menuItems;
  try {
    menuItems = await listMenuItems();
  } catch (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600">Error Loading Menu</h1>
          <p className="mt-2 text-zinc-500">Unable to load menu items. Please try again.</p>
        </div>
      </div>
    );
  }

  const availableItems = menuItems.filter((item) => item.isAvailable);
  const unavailableItems = menuItems.filter((item) => !item.isAvailable);

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 dark:bg-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">Menu</h1>
            <p className="text-sm text-zinc-500">{availableItems.length} items available</p>
          </div>
          <CartButton sessionId={sessionId} />
        </div>
      </header>

      {/* Menu Content */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {availableItems.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-zinc-500">No menu items available at the moment.</p>
          </div>
        ) : (
          <>
            <MenuList items={availableItems} />

            {unavailableItems.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 text-lg font-medium text-zinc-400">Currently Unavailable</h2>
                <div className="space-y-3 opacity-50">
                  {unavailableItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium line-through">{item.name}</h3>
                          {item.description && (
                            <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
                          )}
                        </div>
                        <span className="font-medium text-zinc-400">
                          Rs. {Number(item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
