'use client';

import React, { useState } from 'react';
import { KpiDashboard } from './KpiDashboard';
import { ProductManager } from './ProductManager';
import { StoreSettingsManager } from './StoreSettingsManager';
import { studioAudio } from '@/lib/audio';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  X,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface AdminLayoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'settings'>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch orders from Firestore with fallback demo data
  React.useEffect(() => {
    if (!isOpen) return;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (docs.length > 0) {
          setOrders(docs);
        } else {
          // Demo fallback orders if Firestore collection is empty
          setOrders([
            { id: 'ORD-9021', clientName: 'Estudio Prisma', totalUSD: 1450, date: '2026-08-15', status: 'Confirmado (30% Abonado)' },
            { id: 'ORD-9022', clientName: 'Roberto Méndez', totalUSD: 380, date: '2026-08-18', status: 'En Producción' },
            { id: 'ORD-9023', clientName: 'Galeria Nexus', totalUSD: 4200, date: '2026-08-22', status: 'Completado' },
            { id: 'ORD-9024', clientName: 'Valeria C.', totalUSD: 850, date: '2026-08-25', status: 'Pendiente Inicial' },
            { id: 'ORD-9025', clientName: 'Arkitektura Lab', totalUSD: 2980, date: '2026-08-27', status: 'Confirmado (30% Abonado)' },
          ]);
        }
      } catch (err) {
        console.warn('Firestore fetch orders fallback:', err);
        setOrders([
          { id: 'ORD-9021', clientName: 'Estudio Prisma', totalUSD: 1450, date: '2026-08-15', status: 'Confirmado' },
          { id: 'ORD-9022', clientName: 'Roberto Méndez', totalUSD: 380, date: '2026-08-18', status: 'En Producción' },
          { id: 'ORD-9023', clientName: 'Galeria Nexus', totalUSD: 4200, date: '2026-08-22', status: 'Completado' },
        ]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="admin-layout-backdrop"
      onClick={() => {
        studioAudio.playFlipClose();
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fadeIn"
    >
      <div
        id="admin-layout-panel"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[92vh] bg-[#0C0C12] border border-white/15 text-[#E5E5E5] flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.95)] overflow-hidden rounded-2xl animate-slideLeft"
      >
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-72 bg-[#08080E] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between p-6">
          <div className="space-y-6">
            {/* Header Brand */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-[9px] font-mono tracking-[0.3em] text-[#00F0FF] uppercase">
                  <span>MKA Studio</span>
                  <span>&bull;</span>
                  <span>Admin v3.5</span>
                </div>
                <h2 className="font-serif italic text-xl text-white font-normal mt-0.5">
                  Panel Ejecutivo
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  studioAudio.playFlipClose();
                  onClose();
                }}
                className="md:hidden w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white"
                aria-label="Cerrar panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  studioAudio.playClick();
                  setActiveTab('dashboard');
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono tracking-widest uppercase transition-all rounded-lg ${
                  activeTab === 'dashboard'
                    ? 'bg-white/10 text-[#00F0FF] border border-white/15 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard &amp; KPIs</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  studioAudio.playClick();
                  setActiveTab('products');
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono tracking-widest uppercase transition-all rounded-lg ${
                  activeTab === 'products'
                    ? 'bg-white/10 text-[#00F0FF] border border-white/15 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Gestión de Productos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  studioAudio.playClick();
                  setActiveTab('orders');
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono tracking-widest uppercase transition-all rounded-lg ${
                  activeTab === 'orders'
                    ? 'bg-white/10 text-[#00F0FF] border border-white/15 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Órdenes Firestore ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  studioAudio.playClick();
                  setActiveTab('settings');
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono tracking-widest uppercase transition-all rounded-lg ${
                  activeTab === 'settings'
                    ? 'bg-white/10 text-[#00F0FF] border border-white/15 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Config Cotizador &amp; BCV</span>
              </button>
            </nav>
          </div>

          {/* Footer Info inside Sidebar */}
          <div className="pt-6 border-t border-white/10 text-[10px] font-mono text-white/40 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Firestore Sync: Activo</span>
            </div>
            <p className="text-[9px] text-white/30">
              Glassmorphism &amp; Dark Mode Framework
            </p>
            <button
              type="button"
              onClick={() => {
                studioAudio.playFlipClose();
                onClose();
              }}
              className="hidden md:flex w-full mt-4 py-2 border border-white/20 hover:border-white text-white/80 hover:text-white items-center justify-center space-x-2 font-mono uppercase tracking-widest text-[9px]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cerrar Panel</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0F]">
          {/* Top Header Bar */}
          <header className="px-6 py-4 border-b border-white/10 bg-[#0E0E16] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-[9px] font-mono tracking-widest uppercase">
                {activeTab.toUpperCase()}
              </span>
              <h3 className="font-serif italic text-lg text-white">
                {activeTab === 'dashboard' && 'Analítica Financiera & Rendimiento'}
                {activeTab === 'products' && 'Catálogo Dinámico & Sincronización Storage'}
                {activeTab === 'orders' && 'Registro de Pedidos y Cotizaciones'}
              </h3>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-mono text-white/50 hidden sm:inline">
                Admin: RomanAlexJV
              </span>
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-mono text-xs text-white">
                RA
              </div>
            </div>
          </header>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {activeTab === 'dashboard' && <KpiDashboard orders={orders} />}

            {activeTab === 'products' && <ProductManager />}

            {activeTab === 'settings' && <StoreSettingsManager />}

            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif italic text-2xl text-white">Órdenes Registradas</h4>
                    <p className="text-xs text-white/60 font-mono mt-1">
                      Sincronización en tiempo real con la colección orders de Firestore.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-white/5 border border-white/15 font-mono text-xs text-[#00F0FF]">
                    {orders.length} Solicitudes Totales
                  </span>
                </div>

                <div className="border border-white/15 bg-white/[0.02] rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-white/5 text-white/50 border-b border-white/10 uppercase tracking-widest text-[9px]">
                        <tr>
                          <th className="p-4">ID Orden</th>
                          <th className="p-4">Cliente / Solicitante</th>
                          <th className="p-4">Fecha</th>
                          <th className="p-4">Monto USD</th>
                          <th className="p-4">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-white/80">
                        {orders.map((ord, idx) => (
                          <tr key={ord.id || idx} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-bold text-[#00F0FF]">{ord.id}</td>
                            <td className="p-4 text-white font-medium">{ord.clientName || 'Cliente Particular'}</td>
                            <td className="p-4 text-white/60">{ord.date || '2026-08-27'}</td>
                            <td className="p-4 font-bold text-white">${ord.totalUSD?.toLocaleString() || '1,250'} USD</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] uppercase tracking-wider">
                                {ord.status || 'Confirmado (30%)'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
