'use client';

import React, { useState, useEffect } from 'react';
import { useQuoteStore } from '@/lib/useQuoteStore';
import { StoreConfig, DEFAULT_STORE_CONFIG, formatUSD, formatVES } from '@/lib/quote-utils';
import { studioAudio } from '@/lib/audio';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Settings,
  DollarSign,
  Percent,
  Phone,
  Save,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Truck,
  CreditCard,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const StoreSettingsManager: React.FC = () => {
  const storeConfig = useQuoteStore((state) => state.storeConfig);
  const updateStoreConfig = useQuoteStore((state) => state.updateStoreConfig);
  const pricingCatalog = useQuoteStore((state) => state.pricingCatalog);
  const updatePricingRule = useQuoteStore((state) => state.updatePricingRule);

  const [formData, setFormData] = useState<StoreConfig>({ ...storeConfig });
  const [mugBasePrice, setMugBasePrice] = useState<number>(
    pricingCatalog['tazas-tradicionales']?.basePrice || 6
  );
  const [mugTierPrice, setMugTierPrice] = useState<number>(
    pricingCatalog['tazas-tradicionales']?.tiers?.[0]?.unitPrice || 5
  );
  const [thermoBasePrice, setThermoBasePrice] = useState<number>(
    pricingCatalog['termos-botella-600ml']?.basePrice || 9
  );
  const [thermoTierPrice, setThermoTierPrice] = useState<number>(
    pricingCatalog['termos-botella-600ml']?.tiers?.[0]?.unitPrice || 8
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with Firestore on mount
  useEffect(() => {
    const fetchRemoteSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'store_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as StoreConfig;
          setFormData((prev) => ({ ...prev, ...remoteData }));
          updateStoreConfig(remoteData);
        }
      } catch (err) {
        console.warn('Could not fetch remote store_config, using local default:', err);
      }
    };
    fetchRemoteSettings();
  }, [updateStoreConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    studioAudio.playClick();

    try {
      // 1. Update local Zustand store
      updateStoreConfig(formData);

      // 2. Update pricing rules in Zustand store
      updatePricingRule('tazas-tradicionales', {
        basePrice: mugBasePrice,
        tiers: [{ minQuantity: 3, unitPrice: mugTierPrice }],
      });

      updatePricingRule('termos-botella-600ml', {
        basePrice: thermoBasePrice,
        tiers: [{ minQuantity: 3, unitPrice: thermoTierPrice }],
      });

      // 3. Persist to Firestore
      const docRef = doc(db, 'settings', 'store_config');
      await setDoc(docRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setSaveSuccess(true);
      studioAudio.playFlipOpen();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving store config to Firestore:', err);
      // Still notify success for local changes
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[#0e1624] border border-cyan-500/20 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-cyan-400 uppercase mb-1">
            <span>MKA Studio Configurator</span>
            <span>•</span>
            <span>Reglas de Negocio</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            <span>Configuración de Cotizaciones &amp; Pagos</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Ajusta la tasa BCV oficial, el porcentaje de anticipo requerido para fabricar, tu número de WhatsApp y las tarifas de mayoreo.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>¡Configuración Guardada con Éxito!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOQUE 1: FINANZAS & REGLAS DE PAGO */}
        <div className="p-5 rounded-2xl bg-[#0e1624] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span>Finanzas, Moneda &amp; Regla de Anticipo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tasa Oficial BCV (Bs. / USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-cyan-400 font-mono">Bs.</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={formData.bcvRate}
                  onChange={(e) => setFormData({ ...formData, bcvRate: parseFloat(e.target.value) || 75.40 })}
                  className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-lg pl-10 pr-3.5 py-2 text-sm text-white font-mono focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Convierte los presupuestos a bolívares en tiempo real.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Porcentaje de Anticipo / Inicial (%) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-cyan-400 font-mono">%</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.initialDepositPercent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initialDepositPercent: Math.min(100, Math.max(0, parseInt(e.target.value) || 30)),
                    })
                  }
                  className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-lg pl-9 pr-3.5 py-2 text-sm text-white font-mono focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Regla MKA: 30% inicial para iniciar elaboración, 70% restante al recibir.
              </span>
            </div>
          </div>

          {/* WhatsApp Directo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Número de WhatsApp de MKA Studio (con código de país) *</span>
            </label>
            <input
              type="text"
              required
              value={formData.whatsAppPhone}
              onChange={(e) => setFormData({ ...formData, whatsAppPhone: e.target.value })}
              placeholder="+584121234567"
              className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              A este número llegarán todos los pedidos formateados con 1 clic del cliente.
            </span>
          </div>

          {/* Nombre de la Tienda */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre de la Marca / Tienda
            </label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none"
            />
          </div>
        </div>

        {/* BLOQUE 2: REGLAS DE MAYOREO & PRODUCTOS CLAVE */}
        <div className="p-5 rounded-2xl bg-[#0e1624] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Reglas de Descuento por Volumen (Mayoreo)</span>
          </div>

          <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 space-y-1">
            <strong>Lógica de Negocio MKA Studio:</strong>
            <p className="text-[11px] text-slate-300">
              Cuando el cliente elige 3 o más unidades de un producto, el sistema aplica automáticamente el precio de mayoreo y destaca el ahorro en su cotización.
            </p>
          </div>

          {/* Tazas Tradicionales */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
            <span className="text-xs font-bold text-white block">Tazas Tradicionales Personalizadas</span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Precio Normal (1-2 unds):</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-slate-400">$</span>
                  <input
                    type="number"
                    value={mugBasePrice}
                    onChange={(e) => setMugBasePrice(parseFloat(e.target.value) || 6)}
                    className="w-full bg-black/60 border border-white/15 rounded pl-6 pr-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-emerald-400 block mb-1">Precio Mayoreo (≥3 unds):</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-emerald-400">$</span>
                  <input
                    type="number"
                    value={mugTierPrice}
                    onChange={(e) => setMugTierPrice(parseFloat(e.target.value) || 5)}
                    className="w-full bg-black/60 border border-emerald-500/30 rounded pl-6 pr-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Termos Botella 600ml */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
            <span className="text-xs font-bold text-white block">Termos Tipo Botella 600ml</span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Precio Normal (1-2 unds):</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-slate-400">$</span>
                  <input
                    type="number"
                    value={thermoBasePrice}
                    onChange={(e) => setThermoBasePrice(parseFloat(e.target.value) || 9)}
                    className="w-full bg-black/60 border border-white/15 rounded pl-6 pr-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-emerald-400 block mb-1">Precio Mayoreo (≥3 unds):</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-emerald-400">$</span>
                  <input
                    type="number"
                    value={thermoTierPrice}
                    onChange={(e) => setThermoTierPrice(parseFloat(e.target.value) || 8)}
                    className="w-full bg-black/60 border border-emerald-500/30 rounded pl-6 pr-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTÓN DE GUARDADO PRINCIPAL */}
        <div className="lg:col-span-2 flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold text-sm tracking-wide flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all transform active:scale-95 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Guardando cambios...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>GUARDAR CONFIGURACIÓN DE COTIZADOR</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
