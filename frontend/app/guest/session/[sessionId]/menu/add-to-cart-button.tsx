'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../../hooks/use-cart';
import { GREEN, PINK } from '../../../theme';

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
        className="rounded-full px-4 py-1.5 text-sm"
        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
      >
        Add
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {localQuantity > 0 && (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: 'rgba(255,255,255,0.12)', color: '#FBF1E6' }}
        >
          {localQuantity} in cart
        </span>
      )}
      <button
        onClick={handleAdd}
        className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all"
        style={{
          background: showAdded ? GREEN : PINK,
          color: '#1B1330',
        }}
      >
        {showAdded ? 'Added!' : localQuantity > 0 ? 'Add More' : 'Add to Cart'}
      </button>
    </div>
  );
}
