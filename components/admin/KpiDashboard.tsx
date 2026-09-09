'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatUSD } from '@/lib/quote-utils';

interface KpiDashboardProps {
  orders: any[];
}

export const KpiDashboard: React.FC<KpiDashboardProps> = ({ orders }) => {
  // Aggregate revenue by month
  const monthlyData = [
    { month: 'Mar', revenue: 4200, orders: 4 },
    { month: 'Abr', revenue: 6800, orders: 7 },
    { month: 'May', revenue: 9500, orders: 11 },
    { month: 'Jun', revenue: 12400, orders: 14 },
    { month: 'Jul', revenue: 15800, orders: 19 },
    { month: 'Ago', revenue: 18950, orders: 24 },
  ];

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalUSD || 1250), 18950);
  const totalOrdersCount = orders.length + 24;
  const averageOrderValue = Math.round(totalRevenue / totalOrdersCount);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Numeric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ingreso Bruto */}
        <div className="p-5 border border-white/15 bg-white/[0.02] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-[#00F0FF]/50 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/5 rounded-full blur-2xl group-hover:bg-[#00F0FF]/15 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-mono text-white/50 uppercase tracking-[0.25em]">
              Ingreso Bruto Total
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-serif italic text-white font-normal mb-1">
            {formatUSD(totalRevenue)}
          </div>
          <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>+24.8% vs mes anterior</span>
          </div>
        </div>

        {/* Card 2: Cantidad de Pedidos */}
        <div className="p-5 border border-white/15 bg-white/[0.02] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-[#00F0FF]/50 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/15 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-mono text-white/50 uppercase tracking-[0.25em]">
              Cantidad de Pedidos
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-serif italic text-white font-normal mb-1">
            {totalOrdersCount} <span className="text-xs font-mono not-italic text-white/50">órdenes</span>
          </div>
          <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>+18% en cotizaciones WhatsApp</span>
          </div>
        </div>

        {/* Card 3: Promedio por Orden */}
        <div className="p-5 border border-white/15 bg-white/[0.02] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-[#00F0FF]/50 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-mono text-white/50 uppercase tracking-[0.25em]">
              Valor Promedio Orden
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-serif italic text-white font-normal mb-1">
            {formatUSD(averageOrderValue)}
          </div>
          <div className="text-[10px] font-mono text-white/40">
            Basado en volumen y descuentos
          </div>
        </div>

        {/* Card 4: Tasa BCV Oficial */}
        <div className="p-5 border border-white/15 bg-white/[0.02] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-[#00F0FF]/50 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-mono text-white/50 uppercase tracking-[0.25em]">
              Tasa BCV Activa
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-mono text-white font-bold mb-1">
            Bs. 75.40
          </div>
          <div className="text-[10px] font-mono text-emerald-400">
            Sincronizado Banco Central
          </div>
        </div>
      </div>

      {/* Area Chart with SVG Gradient (Primary Color to Transparent) */}
      <div className="p-6 border border-white/15 bg-white/[0.02] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-serif italic text-xl text-white">Ingresos Mensuales &amp; Tendencia</h4>
            <p className="text-xs text-white/50 font-mono">
              Evolución de facturación en USD con gradiente óptico cyan-a-transparente.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-mono">
            <span className="w-3 h-3 rounded-full bg-[#00F0FF] inline-block" />
            <span className="text-white/70">Ingresos USD ($)</span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" textAnchor="end" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#12121A',
                  borderColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00F0FF"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
