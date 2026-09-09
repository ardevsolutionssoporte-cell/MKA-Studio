'use client';

import React, { useState, useRef } from 'react';
import { useQuoteStore } from '@/lib/useQuoteStore';
import { formatUSD, formatVES } from '@/lib/quote-utils';
import { studioAudio } from '@/lib/audio';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export const QuoteDrawer: React.FC = () => {
  const isDrawerOpen = useQuoteStore((state) => state.isDrawerOpen);
  const openDrawer = useQuoteStore((state) => state.openDrawer);
  const closeDrawer = useQuoteStore((state) => state.closeDrawer);

  const [activeTab, setActiveTab] = useState<'cart' | 'client'>('cart');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [validationAlert, setValidationAlert] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const items = useQuoteStore((state) => state.items);
  const client = useQuoteStore((state) => state.client);
  const storeConfig = useQuoteStore((state) => state.storeConfig);
  const removeItem = useQuoteStore((state) => state.removeItem);
  const updateQuantity = useQuoteStore((state) => state.updateQuantity);
  const updateItemNotes = useQuoteStore((state) => state.updateItemNotes);
  const clearQuote = useQuoteStore((state) => state.clearQuote);
  const setClientData = useQuoteStore((state) => state.setClientData);
  const getSummary = useQuoteStore((state) => state.getSummary);
  const generateWhatsAppLink = useQuoteStore((state) => state.generateWhatsAppLink);
  const generateWhatsAppMessage = useQuoteStore((state) => state.generateWhatsAppMessage);

  const summary = getSummary();
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  // Validación de datos personales antes de enviar a WhatsApp
  const handleConfirmAndSend = () => {
    studioAudio.playClick();

    if (items.length === 0) {
      setValidationAlert('Tu carrito está vacío. Agrega al menos un producto.');
      return;
    }

    const hasName = client.name && client.name.trim().length >= 2;
    const hasPhone = client.phone && client.phone.trim().length >= 6;

    if (!hasName || !hasPhone) {
      studioAudio.playNotification();
      setValidationAlert('Por favor completa tu Nombre y Teléfono / WhatsApp para formalizar tu cotización.');
      setActiveTab('client');

      // Autofocus al campo faltante
      setTimeout(() => {
        if (!hasName && nameInputRef.current) {
          nameInputRef.current.focus();
        } else if (!hasPhone && phoneInputRef.current) {
          phoneInputRef.current.focus();
        }
      }, 100);

      // Auto ocultar alerta después de 6 segundos
      setTimeout(() => {
        setValidationAlert(null);
      }, 6000);
      return;
    }

    // Datos correctos -> Enviar a WhatsApp
    setValidationAlert(null);
    const url = generateWhatsAppLink();
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyMessage = () => {
    studioAudio.playClick();
    const msg = generateWhatsAppMessage();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(msg);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  return (
    <>
      {/* Botón Flotante de Cotización (Glassmorphic & Rounded #0A0A0A) */}
      <button
        type="button"
        id="btn-floating-quote-cart"
        onClick={() => {
          studioAudio.playClick();
          openDrawer();
        }}
        className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 group cursor-pointer border-0 bg-transparent focus:outline-none"
        aria-label="Abrir cotizador y carrito"
      >
        <div className="relative flex items-center gap-2.5 sm:gap-3 bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 hover:border-white/20 px-3.5 py-2 sm:px-5 sm:py-3 rounded-full text-white shadow-[0_15px_40px_rgba(0,0,0,0.7)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.25)] transition-all duration-300 transform group-hover:scale-105">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-[11px] sm:text-xs font-bold tracking-wide text-white">
              Mi Cotización
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-cyan-300">
              {formatUSD(summary.totalUSD)}
            </span>
          </div>
          <span className="ml-1 bg-cyan-400 text-black font-extrabold text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-sm">
            {totalUnits}
          </span>
        </div>
      </button>

      {/* Modal Overlay con Fondo Difuminado */}
      {isDrawerOpen && (
        <div
          id="quote-modal-backdrop"
          onClick={() => {
            studioAudio.playFlipClose();
            closeDrawer();
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
        >
          {/* Tarjeta Modal Flotante Amplia & Limpia con el fondo exacto #0A0A0A */}
          <div
            id="quote-modal-card"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[92vh] bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 text-slate-100 flex flex-col rounded-3xl shadow-[0_25px_90px_rgba(0,0,0,0.95)] overflow-hidden my-auto animate-scaleUp"
          >
            {/* Cabecera Elegante */}
            <header className="px-6 py-4 sm:py-5 bg-[#0A0A0A] border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 border border-cyan-500/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">{storeConfig.storeName}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-cyan-300 font-mono text-[11px] bg-cyan-500/10 px-2 py-0.5 rounded-full">
                      Tasa BCV: Bs. {summary.bcvRate.toFixed(2)}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Cotización &amp; Proforma
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-close-quote-modal"
                  onClick={() => {
                    studioAudio.playFlipClose();
                    closeDrawer();
                  }}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* ALERTA EMERGENTE DE VALIDACIÓN */}
            {validationAlert && (
              <div className="px-6 pt-4 pb-1 shrink-0 animate-slideDown">
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="font-medium">{validationAlert}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValidationAlert(null)}
                    className="text-amber-300 hover:text-white text-xs p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Selector de Pestañas de 2 Pasos (Tu Pedido vs Tus Datos) Mobile */}
            <div className="px-6 pt-3 pb-2 shrink-0 md:hidden">
              <div className="p-1 bg-[#141414] border border-white/5 rounded-2xl flex items-center gap-1">
                <button
                  type="button"
                  id="tab-cart"
                  onClick={() => {
                    studioAudio.playClick();
                    setActiveTab('cart');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'cart'
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>1. Tu Pedido ({totalUnits})</span>
                </button>

                <button
                  type="button"
                  id="tab-client"
                  onClick={() => {
                    studioAudio.playClick();
                    setActiveTab('client');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'client'
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>2. Datos de Entrega</span>
                </button>
              </div>
            </div>

            {/* CONTENIDO PRINCIPAL: Layout de Doble Columna en Desktop */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
                
                {/* COLUMNA IZQUIERDA (7 Columnas en Desktop): Lista de Productos o Formulario */}
                <div className="md:col-span-7 flex flex-col space-y-4">
                  
                  {/* Selector Desktop de Pestaña */}
                  <div className="hidden md:flex p-1 bg-[#141414] border border-white/5 rounded-2xl items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        studioAudio.playClick();
                        setActiveTab('cart');
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'cart'
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>1. Tu Pedido ({totalUnits} piezas)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        studioAudio.playClick();
                        setActiveTab('client');
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'client'
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>2. Datos de Entrega</span>
                      {(!client.name || !client.phone) && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </button>
                  </div>

                  {/* VISTA 1: LISTA DE PRODUCTOS SELECCIONADOS */}
                  {activeTab === 'cart' && (
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                      {items.length === 0 ? (
                        <div className="text-center py-12 px-4 rounded-2xl bg-[#121212] border border-white/5 my-auto">
                          <ShoppingCart className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
                          <h3 className="text-base font-bold text-white mb-1">
                            Aún no has agregado productos
                          </h3>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                            Explora el catálogo 3D en la pantalla y haz clic en &quot;Añadir a Cotización&quot; en cualquier pieza.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              studioAudio.playFlipClose();
                              closeDrawer();
                            }}
                            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-full transition-all"
                          >
                            Explorar Catálogo 3D
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                            <span>Artículos en la cotización ({items.length})</span>
                            <button
                              type="button"
                              onClick={() => {
                                studioAudio.playClick();
                                if (window.confirm('¿Deseas vaciar la cotización?')) {
                                  clearQuote();
                                }
                              }}
                              className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Vaciar</span>
                            </button>
                          </div>

                          {/* CARDS DE PRODUCTOS ESPACIOSAS & LEGIBLES */}
                          <div className="space-y-3">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="p-4 sm:p-5 rounded-2xl bg-[#141414] hover:bg-[#181818] border border-white/5 transition-all space-y-3 shadow-md"
                              >
                                {/* Encabezado del Producto */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[11px] font-medium text-cyan-400 block uppercase tracking-wider">
                                      {item.category || 'MKA Studio'}
                                    </span>
                                    <h4 className="text-base font-bold text-white leading-snug mt-0.5">
                                      {item.name}
                                    </h4>
                                    {item.finish && (
                                      <span className="text-xs text-slate-400 block mt-0.5">
                                        Acabado: {item.finish}
                                      </span>
                                    )}
                                  </div>

                                  {/* Subtotal Destacado */}
                                  <div className="text-right shrink-0">
                                    <span className="text-lg sm:text-xl font-bold font-mono text-white block">
                                      {formatUSD(item.subtotal)}
                                    </span>
                                    <span className="text-[11px] font-mono text-cyan-300/80">
                                      ≈ {formatVES(item.subtotal * summary.bcvRate)}
                                    </span>
                                  </div>
                                </div>

                                {/* Pastilla de Descuento por Mayoreo */}
                                {item.hasVolumeDiscount ? (
                                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-medium flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>
                                      ¡Precio mayoreo (-{item.discountPercentage}%): <strong className="text-white font-semibold">{formatUSD(item.unitPrice)} c/u</strong> (Antes: {formatUSD(item.originalUnitPrice)})
                                    </span>
                                  </div>
                                ) : (
                                  item.originalUnitPrice <= 10 && item.quantity < 3 && (
                                    <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 text-xs flex items-center gap-1.5">
                                      <span>💡 Tip: A partir de 3 unidades aplica descuento por mayoreo.</span>
                                    </div>
                                  )
                                )}

                                {/* Controles de Cantidad y Botón Eliminar */}
                                <div className="flex items-center justify-between pt-1">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-black/60 rounded-full p-1 border border-white/5 shadow-inner">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          studioAudio.playClick();
                                          if (item.quantity > 1) {
                                            updateQuantity(item.id, item.quantity - 1);
                                          } else {
                                            removeItem(item.id);
                                          }
                                        }}
                                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                                        aria-label="Disminuir"
                                      >
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>

                                      <span className="w-10 text-center font-bold text-white text-sm">
                                        {item.quantity}
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          studioAudio.playClick();
                                          updateQuantity(item.id, item.quantity + 1);
                                        }}
                                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                                        aria-label="Aumentar"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    <span className="text-xs text-slate-400 font-mono">
                                      {formatUSD(item.unitPrice)} c/u
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      studioAudio.playClick();
                                      removeItem(item.id);
                                    }}
                                    className="w-8 h-8 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                                    title="Eliminar producto"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Campo Opcional de Personalización */}
                                <input
                                  type="text"
                                  value={item.notes || ''}
                                  onChange={(e) => updateItemNotes(item.id, e.target.value)}
                                  placeholder="Detalles de personalización (ej: Mi logo o nombre a estampar)"
                                  className="w-full text-xs bg-black/40 border border-white/5 rounded-xl px-3.5 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/20 transition-all"
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* VISTA 2: FORMULARIO DE DATOS DEL CLIENTE */}
                  {activeTab === 'client' && (
                    <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                      <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>
                          Ingresa tus datos de contacto para armar tu cotización oficial y coordinar la entrega.
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Tu Nombre o Empresa *
                          </label>
                          <input
                            ref={nameInputRef}
                            type="text"
                            value={client.name}
                            onChange={(e) => setClientData({ name: e.target.value })}
                            placeholder="Ej: Alejandro Gómez"
                            className={`w-full bg-[#141414] focus:bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                              validationAlert && !client.name ? 'ring-2 ring-amber-400/80 bg-amber-500/10' : ''
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Tu Número de WhatsApp *
                          </label>
                          <input
                            ref={phoneInputRef}
                            type="tel"
                            value={client.phone}
                            onChange={(e) => setClientData({ phone: e.target.value })}
                            placeholder="Ej: 0412 1234567 o +58 414..."
                            className={`w-full bg-[#141414] focus:bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none font-mono transition-all ${
                              validationAlert && !client.phone ? 'ring-2 ring-amber-400/80 bg-amber-500/10' : ''
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Ciudad o Dirección de Entrega</span>
                          </label>
                          <input
                            type="text"
                            value={client.cityOrAddress || ''}
                            onChange={(e) => setClientData({ cityOrAddress: e.target.value })}
                            placeholder="Ej: Caracas / San Antonio de los Altos (o envío MRW)"
                            className="w-full bg-[#141414] focus:bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Método de Pago</span>
                            </label>
                            <select
                              value={client.paymentMethod || 'Pago Móvil (Tasa BCV)'}
                              onChange={(e) => setClientData({ paymentMethod: e.target.value })}
                              className="w-full bg-[#141414] focus:bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                            >
                              <option value="Pago Móvil (Tasa BCV)" className="bg-[#0A0A0A]">Pago Móvil (Tasa BCV)</option>
                              <option value="Transferencia Bancaria en Bs." className="bg-[#0A0A0A]">Transferencia Bancaria en Bs.</option>
                              <option value="Zelle / Dólares Efectivo" className="bg-[#0A0A0A]">Zelle / Dólares Efectivo</option>
                              <option value="Binance USDT" className="bg-[#0A0A0A]">Binance USDT</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Forma de Entrega</span>
                            </label>
                            <select
                              value={client.shippingMethod || 'Entrega en Taller / Delivery'}
                              onChange={(e) => setClientData({ shippingMethod: e.target.value })}
                              className="w-full bg-[#141414] focus:bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                            >
                              <option value="Entrega en Taller / Delivery" className="bg-[#0A0A0A]">Entrega en Taller / Delivery</option>
                              <option value="Envío Nacional MRW" className="bg-[#0A0A0A]">Envío Nacional MRW</option>
                              <option value="Envío Nacional Zoom" className="bg-[#0A0A0A]">Envío Nacional Zoom</option>
                              <option value="Envío Nacional Tealca" className="bg-[#0A0A0A]">Envío Nacional Tealca</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Notas o Instrucciones Especiales
                          </label>
                          <textarea
                            rows={2}
                            value={client.generalNotes || ''}
                            onChange={(e) => setClientData({ generalNotes: e.target.value })}
                            placeholder="Ej: Fecha límite requerida, detalles de diseño..."
                            className="w-full bg-[#141414] focus:bg-[#181818] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* COLUMNA DERECHA (5 Columnas en Desktop): Resumen Financiero & Acciones */}
                <div className="md:col-span-5 flex flex-col justify-between bg-[#111111] border border-white/5 p-4 sm:p-5 rounded-3xl space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                      Resumen del Pedido
                    </h3>

                    {/* Desglose de Totales */}
                    <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-3">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Total de unidades:</span>
                        <span className="font-bold text-white font-mono">{totalUnits} piezas</span>
                      </div>

                      {summary.savingsUSD > 0 && (
                        <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                          <span>Ahorro por mayoreo:</span>
                          <span>-{formatUSD(summary.savingsUSD)}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-white/5 flex justify-between items-baseline">
                        <div>
                          <span className="text-[11px] text-slate-400 block">Monto Total</span>
                          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                            {formatUSD(summary.totalUSD)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm sm:text-base font-bold text-cyan-300 font-mono block">
                            {formatVES(summary.totalVES)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Tasa BCV: {summary.bcvRate.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Anticipo Inicial 30% */}
                    <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>Anticipo {summary.depositPercentage}% (Para elaborar):</span>
                        </div>
                        <span className="font-mono text-white text-sm">
                          {formatUSD(summary.initialDepositUSD)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-300 pl-5.5">
                        <span>En Bolívares:</span>
                        <span className="font-mono text-cyan-200">{formatVES(summary.initialDepositVES)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 pl-5.5 pt-1 border-t border-white/5">
                        <span>Saldo restante (70% contra entrega):</span>
                        <span className="font-mono text-slate-300">{formatUSD(summary.remainingBalanceUSD)}</span>
                      </div>
                    </div>

                    {/* Resumen rápido de datos del cliente */}
                    <div className="px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/5 text-xs text-slate-300 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">
                          {client.name ? `${client.name} (${client.phone || 'Sin tel'})` : 'Sin datos personales'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          studioAudio.playClick();
                          setActiveTab(activeTab === 'client' ? 'cart' : 'client');
                        }}
                        className="text-cyan-300 hover:text-white text-xs font-semibold ml-2 shrink-0"
                      >
                        {activeTab === 'client' ? 'Ver Pedido' : 'Editar'}
                      </button>
                    </div>
                  </div>

                  {/* BOTONES DE ACCIÓN */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      id="btn-confirm-whatsapp-quote"
                      onClick={handleConfirmAndSend}
                      disabled={items.length === 0}
                      className="w-full py-3.5 sm:py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition-all transform active:scale-[0.98] cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5 fill-black" />
                      <span>CONFIRMAR PEDIDO POR WHATSAPP</span>
                    </button>

                    <button
                      type="button"
                      id="btn-copy-quote-summary"
                      onClick={handleCopyMessage}
                      disabled={items.length === 0}
                      className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {copiedNotification ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">¡Resumen Copiado al Portapapeles!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Resumen de Cotización</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
