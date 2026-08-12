'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../../hooks/use-cart';

interface AddToCartButtonProps {
  item: {
    id: string;
    name: string;
    price: number;
  };
}

export function AddToCartButton({ item }: AddToCartButtonProps) {
  const { addItem, items, isHydrated } = useCart();
  const [showAdded, setShowAdded] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(0);

  useEffect(() => {
    const cartItem = items.find((i) => i.id === item.id);
    setLocalQuantity(cartItem?.quantity || 0);
  }, [items, item.id]);

  const handleAdd = () => {
    addItem(item);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 1500);
  };

  if (!isHydrated) {
    return (
      <button
        disabled
        className="rounded-full bg-zinc-200 px-4 py-1.5 text-sm text-zinc-400 dark:bg-zinc-700"
      >
        Add
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {localQuantity > 0 && (
        <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white dark:bg-white dark:text-black">
          {localQuantity} in cart
        </span>
      )}
      <button
        onClick={handleAdd}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
          showAdded
            ? 'bg-green-500 text-white'
            : 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
        }`}
      >
        {showAdded ? 'Added!' : localQuantity > 0 ? 'Add More' : 'Add to Cart'}
      </button>
    </div>
  );
}
