'use client';

import { useState } from 'react';
import { AddToCartButton } from './add-to-cart-button';

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
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
        >
          <div className="flex gap-4">
            {/* Item Image (if available) */}
            {item.imageUrl && (
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Item Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{item.description}</p>
                  )}
                </div>
                <span className="ml-4 font-semibold text-zinc-900 dark:text-zinc-100">
                  Rs. {Number(item.price).toFixed(2)}
                </span>
              </div>

              {/* Ingredients (expandable) */}
              {item.ingredients && (
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="mt-2 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {expandedId === item.id ? 'Hide ingredients' : 'View ingredients'}
                </button>
              )}

              {expandedId === item.id && item.ingredients && (
                <p className="mt-2 rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                  {item.ingredients}
                </p>
              )}

              {/* Add to Cart Button */}
              <div className="mt-3">
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
