'use client';

import { useState } from 'react';
import { AddToCartButton } from './add-to-cart-button';
import { GOLD, PAPER, PAPER_DIM, TEAL } from '../../../theme';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  ingredients: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface MenuListProps {
  items: MenuItem[];
}

export function MenuList({ items }: MenuListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="overflow-hidden rounded-2xl p-5 backdrop-blur-md transition"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}
        >
          <div className="flex gap-4">
            {item.imageUrl && (
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg" style={{ color: PAPER, fontFamily: 'var(--font-accent)', fontWeight: 600 }}>
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="mt-1 text-sm leading-snug" style={{ color: PAPER_DIM }}>
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="whitespace-nowrap text-lg font-semibold" style={{ color: GOLD }}>
                  Rs. {Number(item.price).toFixed(2)}
                </span>
              </div>

              {item.ingredients && (
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="mt-2 text-xs font-medium uppercase tracking-wide"
                  style={{ color: TEAL, fontFamily: 'var(--font-mono-ticket)' }}
                >
                  {expandedId === item.id ? 'Hide ingredients' : 'View ingredients'}
                </button>
              )}

              {expandedId === item.id && item.ingredients && (
                <p
                  className="mt-2 rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', color: PAPER_DIM }}
                >
                  {item.ingredients}
                </p>
              )}

              <div className="mt-4">
                <AddToCartButton
                  item={{
                    id: item.id,
                    name: item.name,
                    price: Number(item.price),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
