import { create } from 'zustand';
import {
  calculateTierUnitPrice,
  DEFAULT_BCV_RATE,
  INITIAL_DEPOSIT_PERCENT,
  DEFAULT_STORE_CONFIG,
  StoreConfig,
  formatUSD,
  formatVES,
  buildWhatsAppUrl,
  PRICING_CATALOG,
  ProductPricingRule,
} from './quote-utils';

export interface QuoteItem {
  id: string;
  productId: string;
  name: string;
  category?: string;
  quantity: number;
  unitPrice: number;        // Precio unitario con descuento aplicado
  originalUnitPrice: number;// Precio unitario regular
  subtotal: number;         // quantity * unitPrice
  finish?: string;          // Acabado o especificación (ej: Estándar, Brillante, Personalizado)
  notes?: string;           // Indicaciones del diseño o estampado
  hasVolumeDiscount: boolean;
  discountPercentage: number;
}

export interface ClientData {
  name: string;
  phone: string;
  cityOrAddress?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  generalNotes?: string;
}

export interface QuoteSummary {
  totalItemsCount: number;
  totalQuantity: number;
  subtotalUSD: number;
  savingsUSD: number;
  totalUSD: number;
  totalVES: number;
  depositPercentage: number;
  initialDepositUSD: number;
  initialDepositVES: number;
  remainingBalanceUSD: number;
  remainingBalanceVES: number;
  bcvRate: number;
}

export interface QuoteState {
  // State
  items: QuoteItem[];
  client: ClientData;
  isDrawerOpen: boolean;
  storeConfig: StoreConfig;
  pricingCatalog: Record<string, ProductPricingRule>;

  // Drawer control
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Item Actions
  addItem: (product: {
    productId: string;
    name: string;
    category?: string;
    basePrice?: number;
    quantity?: number;
    finish?: string;
    notes?: string;
    autoOpenDrawer?: boolean;
  }) => void;

  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemFinish: (itemId: string, finish: string) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  clearQuote: () => void;

  // Client Data & Store Config Actions
  setClientData: (data: Partial<ClientData>) => void;
  updateStoreConfig: (newConfig: Partial<StoreConfig>) => void;
  updatePricingRule: (productId: string, rule: Partial<ProductPricingRule>) => void;

  // Selectors & Generators
  getSummary: () => QuoteSummary;
  generateWhatsAppLink: (customNotes?: string) => string;
  generateWhatsAppMessage: (customNotes?: string) => string;
}

// Helper to load persistent configuration
const getInitialStoreConfig = (): StoreConfig => {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('mka_store_config');
      if (cached) {
        return { ...DEFAULT_STORE_CONFIG, ...JSON.parse(cached) };
      }
    } catch (e) {
      console.warn('Failed to parse cached store config', e);
    }
  }
  return DEFAULT_STORE_CONFIG;
};

export const useQuoteStore = create<QuoteState>((set, get) => ({
  items: [
    {
      id: 'item-tazas-1',
      productId: 'tazas-tradicionales',
      name: 'Tazas tradicionales personalizadas',
      category: 'Cerámica & Menaje',
      quantity: 3,
      unitPrice: 5,
      originalUnitPrice: 6,
      subtotal: 15,
      finish: 'Cerámica Esmaltada con Sublimación',
      notes: 'Logo MKA centrado',
      hasVolumeDiscount: true,
      discountPercentage: 17,
    },
    {
      id: 'item-termos-2',
      productId: 'termos-botella-600ml',
      name: 'Termos tipo botella de 600ml',
      category: 'Térmicos & Acero',
      quantity: 3,
      unitPrice: 8,
      originalUnitPrice: 9,
      subtotal: 24,
      finish: 'Acero Inoxidable Doble Pared',
      notes: 'Grabado láser nombre',
      hasVolumeDiscount: true,
      discountPercentage: 11,
    },
  ],
  client: {
    name: '',
    phone: '',
    cityOrAddress: '',
    paymentMethod: 'Pago Móvil (Tasa BCV)',
    shippingMethod: 'Entrega en Taller / Delivery',
    generalNotes: '',
  },
  isDrawerOpen: false,
  storeConfig: getInitialStoreConfig(),
  pricingCatalog: PRICING_CATALOG,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),

  addItem: ({ productId, name, category, basePrice, quantity = 1, finish, notes, autoOpenDrawer = true }) => {
    const sanitizedQty = Math.max(1, quantity);
    const { pricingCatalog } = get();
    const existingCatalogItem = pricingCatalog[productId] || PRICING_CATALOG[productId];
    const effectiveBasePrice = basePrice ?? existingCatalogItem?.basePrice ?? 10;

    const { unitPrice, originalUnitPrice, hasDiscount, discountPercentage } =
      calculateTierUnitPrice(productId, sanitizedQty, effectiveBasePrice, pricingCatalog);

    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === productId && item.finish === (finish || 'Personalizado')
      );

      let updatedItems: QuoteItem[];

      if (existingItemIndex > -1) {
        const existing = state.items[existingItemIndex];
        const newQty = existing.quantity + sanitizedQty;
        const recalculated = calculateTierUnitPrice(productId, newQty, effectiveBasePrice, state.pricingCatalog);

        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...existing,
          quantity: newQty,
          unitPrice: recalculated.unitPrice,
          originalUnitPrice: recalculated.originalUnitPrice,
          subtotal: newQty * recalculated.unitPrice,
          hasVolumeDiscount: recalculated.hasDiscount,
          discountPercentage: recalculated.discountPercentage,
          notes: notes || existing.notes,
        };
      } else {
        const newItem: QuoteItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId,
          name: name || existingCatalogItem?.name || 'Producto MKA',
          category: category || existingCatalogItem?.category || 'Personalizados MKA',
          quantity: sanitizedQty,
          unitPrice,
          originalUnitPrice,
          subtotal: sanitizedQty * unitPrice,
          finish: finish || 'Estándar',
          notes,
          hasVolumeDiscount: hasDiscount,
          discountPercentage,
        };
        updatedItems = [...state.items, newItem];
      }

      return {
        items: updatedItems,
        isDrawerOpen: autoOpenDrawer ? true : state.isDrawerOpen,
      };
    });
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },

  updateQuantity: (itemId, quantity) => {
    const sanitizedQty = Math.max(1, quantity);
    set((state) => {
      const updatedItems = state.items.map((item) => {
        if (item.id !== itemId) return item;

        const { unitPrice, originalUnitPrice, hasDiscount, discountPercentage } =
          calculateTierUnitPrice(item.productId, sanitizedQty, item.originalUnitPrice, state.pricingCatalog);

        return {
          ...item,
          quantity: sanitizedQty,
          unitPrice,
          originalUnitPrice,
          subtotal: sanitizedQty * unitPrice,
          hasVolumeDiscount: hasDiscount,
          discountPercentage,
        };
      });

      return { items: updatedItems };
    });
  },

  updateItemFinish: (itemId, finish) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, finish } : item
      ),
    }));
  },

  updateItemNotes: (itemId, notes) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, notes } : item
      ),
    }));
  },

  clearQuote: () => {
    set({ items: [] });
  },

  setClientData: (data) => {
    set((state) => ({
      client: { ...state.client, ...data },
    }));
  },

  updateStoreConfig: (newConfig) => {
    set((state) => {
      const updated = { ...state.storeConfig, ...newConfig };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mka_store_config', JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to save store config', e);
        }
      }
      return { storeConfig: updated };
    });
  },

  updatePricingRule: (productId, ruleUpdate) => {
    set((state) => {
      const currentRule = state.pricingCatalog[productId] || PRICING_CATALOG[productId];
      const updatedCatalog = {
        ...state.pricingCatalog,
        [productId]: {
          ...currentRule,
          ...ruleUpdate,
        },
      };

      // Recalculate all cart items with new rules
      const updatedItems = state.items.map((item) => {
        const { unitPrice, originalUnitPrice, hasDiscount, discountPercentage } =
          calculateTierUnitPrice(item.productId, item.quantity, item.originalUnitPrice, updatedCatalog);

        return {
          ...item,
          unitPrice,
          originalUnitPrice,
          subtotal: item.quantity * unitPrice,
          hasVolumeDiscount: hasDiscount,
          discountPercentage,
        };
      });

      return {
        pricingCatalog: updatedCatalog,
        items: updatedItems,
      };
    });
  },

  getSummary: () => {
    const { items, storeConfig } = get();
    const bcvRate = storeConfig.bcvRate || DEFAULT_BCV_RATE;
    const depositPercent = storeConfig.initialDepositPercent || INITIAL_DEPOSIT_PERCENT;

    let totalQuantity = 0;
    let subtotalUSD = 0;
    let originalSubtotalUSD = 0;

    for (const item of items) {
      totalQuantity += item.quantity;
      subtotalUSD += item.subtotal;
      originalSubtotalUSD += item.quantity * item.originalUnitPrice;
    }

    const savingsUSD = Math.max(0, originalSubtotalUSD - subtotalUSD);
    const totalUSD = subtotalUSD;
    const totalVES = totalUSD * bcvRate;

    const initialDepositUSD = (totalUSD * depositPercent) / 100;
    const initialDepositVES = (totalVES * depositPercent) / 100;

    const remainingBalanceUSD = Math.max(0, totalUSD - initialDepositUSD);
    const remainingBalanceVES = Math.max(0, totalVES - initialDepositVES);

    return {
      totalItemsCount: items.length,
      totalQuantity,
      subtotalUSD,
      savingsUSD,
      totalUSD,
      totalVES,
      depositPercentage: depositPercent,
      initialDepositUSD,
      initialDepositVES,
      remainingBalanceUSD,
      remainingBalanceVES,
      bcvRate,
    };
  },

  generateWhatsAppMessage: (customNotes?: string) => {
    const { items, client, storeConfig, getSummary } = get();
    const summary = getSummary();

    if (items.length === 0) {
      return `¡Hola! Me gustaría cotizar productos personalizados en ${storeConfig.storeName}. ¿Podrían darme información?`;
    }

    const clientGreeting = client.name
      ? `👤 *Cliente:* ${client.name}`
      : `👤 *Cliente:* Nuevo Pedido`;

    const clientPhone = client.phone ? `📱 *Teléfono:* ${client.phone}` : '';
    const clientLocation = client.cityOrAddress ? `📍 *Ciudad/Entrega:* ${client.cityOrAddress}` : '';
    const payMethod = client.paymentMethod ? `💳 *Método de Pago Preferido:* ${client.paymentMethod}` : '';
    const shipMethod = client.shippingMethod ? `🚚 *Tipo de Entrega:* ${client.shippingMethod}` : '';

    const clientHeader = [clientGreeting, clientPhone, clientLocation, payMethod, shipMethod]
      .filter(Boolean)
      .join('\n');

    // Desglose claro de productos
    const itemsBreakdown = items
      .map((item, index) => {
        const discountBadge = item.hasVolumeDiscount
          ? ` *(🔥 Descuento por mayoreo -${item.discountPercentage}% aplicado)*`
          : '';
        const finishText = item.finish ? `\n   ▪ Acabado: ${item.finish}` : '';
        const noteText = item.notes ? `\n   ▪ Personalización/Logo: ${item.notes}` : '';

        return `${index + 1}. *${item.name}* (x${item.quantity} unidades)
   ▪ Precio unitario: ${formatUSD(item.unitPrice)}${discountBadge}${finishText}${noteText}
   ▪ Subtotal: *${formatUSD(item.subtotal)}*`;
      })
      .join('\n\n');

    const savingsText = summary.savingsUSD > 0
      ? `\n🎁 *¡Ahorro por volumen aplicado!:* ${formatUSD(summary.savingsUSD)}`
      : '';

    const notesSection = customNotes || client.generalNotes
      ? `\n\n📝 *Instrucciones especiales:*\n${customNotes || client.generalNotes}`
      : '';

    const message = `✨ *SOLICITUD DE COTIZACIÓN - ${storeConfig.storeName.toUpperCase()}* ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${clientHeader}
📅 *Fecha:* ${new Date().toLocaleDateString('es-VE', { dateStyle: 'long' })}

📦 *PRODUCTOS SOLICITADOS:*
${itemsBreakdown}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *RESUMEN TOTAL:*
• *Total de piezas:* ${summary.totalQuantity} unidades${savingsText}
• *MONTO TOTAL:* *${formatUSD(summary.totalUSD)}*
• *Tasa Oficial BCV:* Bs. ${summary.bcvRate.toFixed(2)} por $
• *Total en Bolívares:* *${formatVES(summary.totalVES)}*

🛡️ *REGLA DE PAGO & FABRICACIÓN:*
• *Inicial requerida (${summary.depositPercentage}% para iniciar elaboración):* *${formatUSD(summary.initialDepositUSD)}* (~${formatVES(summary.initialDepositVES)})
• *Saldo restante (${100 - summary.depositPercentage}% al momento de entrega):* *${formatUSD(summary.remainingBalanceUSD)}* (~${formatVES(summary.remainingBalanceVES)})${notesSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Quedo a la espera de sus datos de pago para transferir la inicial y enviarles el diseño/logo para aprobación. ¡Muchas gracias!_`;

    return message;
  },

  generateWhatsAppLink: (customNotes?: string) => {
    const { storeConfig, generateWhatsAppMessage } = get();
    const message = generateWhatsAppMessage(customNotes);
    return buildWhatsAppUrl(storeConfig.whatsAppPhone || '+584121234567', message);
  },
}));
