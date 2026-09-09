'use client';

import React, { useEffect } from 'react';
import { Product } from '@/lib/products';
import { useQuoteStore } from '@/lib/useQuoteStore';

interface QuoteModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const addItem = useQuoteStore((state) => state.addItem);

  useEffect(() => {
    if (isOpen && product) {
      addItem({
        productId: product.id,
        name: product.name,
        category: product.category,
        basePrice: product.priceRaw,
        quantity: 1,
        autoOpenDrawer: true,
      });
      onClose();
    }
  }, [isOpen, product, addItem, onClose]);

  return null;
};
