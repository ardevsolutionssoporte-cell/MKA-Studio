/**
 * Pure business logic & financial formatting utilities for MKA Studio Quotes
 * Independent from UI framework.
 */

export interface PricingTier {
  minQuantity: number;
  unitPrice: number;
}

export interface ProductPricingRule {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  tiers?: PricingTier[];
}

/**
 * Standard pricing catalog with dynamic volume tiers as specified:
 * - "Tazas tradicionales": $6 base, $5 each for quantity >= 3
 * - "Termos tipo botella de 600ml": $9 base, $8 each for quantity >= 3
 * - High-end MKA Studio catalogue products with tiered incentives
 */
export const PRICING_CATALOG: Record<string, ProductPricingRule> = {
  'tazas-tradicionales': {
    id: 'tazas-tradicionales',
    name: 'Tazas tradicionales',
    category: 'Cerámica & Menaje',
    basePrice: 6,
    tiers: [
      { minQuantity: 3, unitPrice: 5 },
    ],
  },
  'termos-botella-600ml': {
    id: 'termos-botella-600ml',
    name: 'Termos tipo botella de 600ml',
    category: 'Térmicos & Acero',
    basePrice: 9,
    tiers: [
      { minQuantity: 3, unitPrice: 8 },
    ],
  },
  'mka-alpha-headphones': {
    id: 'mka-alpha-headphones',
    name: 'Aether Pro Spatial Headset',
    category: 'Spatial Audio',
    basePrice: 1250,
    tiers: [
      { minQuantity: 3, unitPrice: 1150 },
      { minQuantity: 5, unitPrice: 1050 },
    ],
  },
  'mka-chrono-matrix': {
    id: 'mka-chrono-matrix',
    name: 'Chronos Obsidian Kinetic',
    category: 'Horología Digital',
    basePrice: 2890,
    tiers: [
      { minQuantity: 2, unitPrice: 2750 },
      { minQuantity: 4, unitPrice: 2600 },
    ],
  },
  'mka-lens-monolith': {
    id: 'mka-lens-monolith',
    name: 'Vortex Optical Aperture 50',
    category: 'Óptica & Visión',
    basePrice: 3450,
    tiers: [
      { minQuantity: 2, unitPrice: 3300 },
      { minQuantity: 3, unitPrice: 3150 },
    ],
  },
  'mka-deck-controller': {
    id: 'mka-deck-controller',
    name: 'Monolith Synth & Macro Engine',
    category: 'Studio Controller',
    basePrice: 1680,
    tiers: [
      { minQuantity: 3, unitPrice: 1550 },
    ],
  },
  'mka-acoustic-sphere': {
    id: 'mka-acoustic-sphere',
    name: 'Levitas Acoustic Monolith',
    category: 'Sonido Escultórico',
    basePrice: 2150,
    tiers: [
      { minQuantity: 2, unitPrice: 2000 },
    ],
  },
};

/**
 * Default BCV Exchange Rate (VES / USD).
 * Can be configured dynamically or updated via store.
 */
export const DEFAULT_BCV_RATE = 75.40;

/**
 * Minimum deposit percentage required to confirm orders.
 */
export const INITIAL_DEPOSIT_PERCENT = 30;

export interface StoreConfig {
  bcvRate: number;
  initialDepositPercent: number;
  whatsAppPhone: string;
  storeName: string;
  wholesaleMinQuantity: number;
  paymentMethods: string[];
  shippingMethods: string[];
  bannerNotice: string;
}

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  bcvRate: 75.40,
  initialDepositPercent: 30,
  whatsAppPhone: '+584121234567',
  storeName: 'MKA Studio',
  wholesaleMinQuantity: 3,
  paymentMethods: ['Pago Móvil (Tasa BCV)', 'Transferencia Bancaria', 'Zelle / Dólares Efectivo', 'Binance USDT'],
  shippingMethods: ['Entregas Personales en Taller MKA', 'Envíos Nacionales MRW / Zoom / Tealca', 'Delivery Express'],
  bannerNotice: 'Para concretar el pedido y proceder a la elaboración se requiere un 30% de inicial.',
};

/**
 * Calculates the unit price for a product based on requested quantity and volume tiers.
 */
export function calculateTierUnitPrice(
  productId: string,
  quantity: number,
  customBasePrice?: number,
  dynamicCatalog?: Record<string, ProductPricingRule>
): {
  unitPrice: number;
  originalUnitPrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
} {
  const catalog = dynamicCatalog || PRICING_CATALOG;
  const rule = catalog[productId] || PRICING_CATALOG[productId];
  const base = rule ? rule.basePrice : (customBasePrice ?? 10);
  let effectiveUnitPrice = base;

  if (rule?.tiers && rule.tiers.length > 0) {
    // Sort tiers descending to match highest qualifying tier first
    const sortedTiers = [...rule.tiers].sort((a, b) => b.minQuantity - a.minQuantity);
    for (const tier of sortedTiers) {
      if (quantity >= tier.minQuantity) {
        effectiveUnitPrice = tier.unitPrice;
        break;
      }
    }
  }

  const hasDiscount = effectiveUnitPrice < base;
  const discountPercentage = base > 0 && hasDiscount ? Math.round(((base - effectiveUnitPrice) / base) * 100) : 0;

  return {
    unitPrice: effectiveUnitPrice,
    originalUnitPrice: base,
    hasDiscount,
    discountPercentage,
  };
}

/**
 * Curated currency formatting for USD ($) and VES (Bs.) with strict precision.
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatVES(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('VES', 'Bs.');
}

/**
 * URL Encoder for WhatsApp click-to-chat links.
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
