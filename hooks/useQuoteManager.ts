'use client';

import { useMemo, useCallback } from 'react';
import { useQuoteStore } from '@/lib/useQuoteStore';
import { formatUSD, formatVES } from '@/lib/quote-utils';

/**
 * Custom hook providing optimized selectors, formatted financial strings,
 * and high-performance business action dispatchers.
 */
export function useQuoteManager() {
  const items = useQuoteStore((state) => state.items);
  const client = useQuoteStore((state) => state.client);
  const storeConfig = useQuoteStore((state) => state.storeConfig);
  const isDrawerOpen = useQuoteStore((state) => state.isDrawerOpen);

  const addItem = useQuoteStore((state) => state.addItem);
  const removeItem = useQuoteStore((state) => state.removeItem);
  const updateQuantity = useQuoteStore((state) => state.updateQuantity);
  const updateItemFinish = useQuoteStore((state) => state.updateItemFinish);
  const clearQuote = useQuoteStore((state) => state.clearQuote);
  const setClientData = useQuoteStore((state) => state.setClientData);
  const updateStoreConfig = useQuoteStore((state) => state.updateStoreConfig);
  const openDrawer = useQuoteStore((state) => state.openDrawer);
  const closeDrawer = useQuoteStore((state) => state.closeDrawer);
  const getSummary = useQuoteStore((state) => state.getSummary);
  const generateWhatsAppLink = useQuoteStore((state) => state.generateWhatsAppLink);
  const generateWhatsAppMessage = useQuoteStore((state) => state.generateWhatsAppMessage);

  // Memoized financial summary
  const summary = useMemo(() => {
    return getSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, storeConfig, getSummary]);

  // Formatted currency strings for UI display
  const formattedValues = useMemo(
    () => ({
      totalUSD: formatUSD(summary.totalUSD),
      totalVES: formatVES(summary.totalVES),
      subtotalUSD: formatUSD(summary.subtotalUSD),
      savingsUSD: formatUSD(summary.savingsUSD),
      initialDepositUSD: formatUSD(summary.initialDepositUSD),
      initialDepositVES: formatVES(summary.initialDepositVES),
      remainingBalanceUSD: formatUSD(summary.remainingBalanceUSD),
      remainingBalanceVES: formatVES(summary.remainingBalanceVES),
      bcvRateFormatted: `Bs. ${summary.bcvRate.toFixed(2)}`,
    }),
    [summary]
  );

  // Optimized trigger to directly launch WhatsApp checkout
  const sendToWhatsApp = useCallback(
    (customNotes?: string) => {
      const url = generateWhatsAppLink(customNotes);
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return url;
    },
    [generateWhatsAppLink]
  );

  return {
    items,
    client,
    bcvRate: storeConfig.bcvRate,
    storeConfig,
    isDrawerOpen,
    summary,
    formattedValues,
    addItem,
    removeItem,
    updateQuantity,
    updateItemFinish,
    clearQuote,
    setClientData,
    updateStoreConfig,
    openDrawer,
    closeDrawer,
    generateWhatsAppLink,
    generateWhatsAppMessage,
    sendToWhatsApp,
  };
}
