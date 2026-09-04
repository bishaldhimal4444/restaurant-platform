import { listMenuItems } from '../../../../../lib/api/menu-items';
import { MenuList } from './menu-list';
import { CartButton } from './cart-button';
import { GOLD, PAPER, PAPER_DIM, PINK } from '../../../theme';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function GuestMenuPage({ params }: PageProps) {
  const { sessionId } = await params;

  let menuItems;
  try {
    menuItems = await listMenuItems();
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl" style={{ color: PINK, fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontWeight: 600 }}>
            Couldn&apos;t load the menu
          </h1>
          <p className="mt-2 text-sm" style={{ color: PAPER_DIM }}>
            Please try refreshing, or flag a staff member for help.
          </p>
        </div>
      </div>
    );
  }

  const availableItems = menuItems.filter((item) => item.isAvailable);
  const unavailableItems = menuItems.filter((item) => !item.isAvailable);

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header
        className="sticky top-0 z-10 backdrop-blur-md"
        style={{ background: 'rgba(11,6,32,0.75)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <div>
            <div
              className="text-[10px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono-ticket)' }}
            >
              CityScape
            </div>
            <h1 className="text-3xl leading-none" style={{ color: PAPER, fontFamily: 'var(--font-display)' }}>
              Menu
            </h1>
            <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono-ticket)' }}>
              {availableItems.length} ITEM{availableItems.length === 1 ? '' : 'S'} AVAILABLE
            </p>
          </div>
          <CartButton sessionId={sessionId} />
        </div>
      </header>

      {/* Menu Content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        {availableItems.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}
          >
            <p style={{ color: PAPER_DIM }}>No menu items available at the moment.</p>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Ask your server — they&apos;ll be happy to walk you through tonight&apos;s specials.
            </p>
          </div>
        ) : (
          <>
            <MenuList items={availableItems} />

            {unavailableItems.length > 0 && (
              <div className="mt-10">
                <h2
                  className="mb-4 text-sm font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono-ticket)' }}
                >
                  Currently Unavailable
                </h2>
                <div className="space-y-3 opacity-45">
                  {unavailableItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl p-4"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium line-through" style={{ color: PAPER }}>
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="font-medium" style={{ color: GOLD }}>
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
