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
} from 'recharts';
import { formatUSD, formatVES } from '@/lib/quote-utils';
import { useQuoteStore } from '@/lib/useQuoteStore';

interface KpiChartProps {
  data?: Array<{ month: string; revenue: number; orders: number; deposit: number }>;
}

const defaultFinancialData = [
  { month: 'Ene', revenue: 3200, orders: 3, deposit: 960 },
  { month: 'Feb', revenue: 4800, orders: 5, deposit: 1440 },
  { month: 'Mar', revenue: 6400, orders: 7, deposit: 1920 },
  { month: 'Abr', revenue: 8900, orders: 10, deposit: 2670 },
  { month: 'May', revenue: 11500, orders: 13, deposit: 3450 },
  { month: 'Jun', revenue: 14200, orders: 17, deposit: 4260 },
  { month: 'Jul', revenue: 17800, orders: 21, deposit: 5340 },
  { month: 'Ago', revenue: 21400, orders: 26, deposit: 6420 },
  { month: 'Sep (Est)', revenue: 25800, orders: 32, deposit: 7740 },
];

export const KpiChart: React.FC<KpiChartProps> = ({ data = defaultFinancialData }) => {
  const storeConfig = useQuoteStore((state) => state.storeConfig);
  const bcvRate = storeConfig.bcvRate || 75.40;

  return (
    <div className="w-full h-80 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 25, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorRevenueGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.5} />
              <stop offset="90%" stopColor="#00F0FF" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorDepositGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="90%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          
          <XAxis 
            dataKey="month" 
            stroke="rgba(255,255,255,0.4)" 
            tick={{ fontSize: 11, fontFamily: 'monospace', fill: 'rgba(255,255,255,0.6)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          
          <YAxis 
            stroke="rgba(255,255,255,0.4)" 
            tick={{ fontSize: 11, fontFamily: 'monospace', fill: 'rgba(255,255,255,0.6)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
          />
          
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const rev = payload[0].value as number;
                const dep = payload[1]?.value as number;
                return (
                  <div className="bg-[#0C0F17]/95 border border-cyan-500/30 rounded-xl p-3 shadow-2xl backdrop-blur-xl font-mono text-xs space-y-1.5 min-w-[200px]">
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider border-b border-white/10 pb-1 flex justify-between">
                      <span>Período: {label}</span>
                      <span className="text-white/60">Tasa: Bs. {bcvRate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span>Volumen Total:</span>
                      </span>
                      <strong className="text-white tabular-nums">{formatUSD(rev)}</strong>
                    </div>
                    <div className="flex justify-between items-center text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>30% Anticipo:</span>
                      </span>
                      <strong className="tabular-nums">{formatUSD(dep || rev * 0.3)}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 border-t border-white/10 pt-1 text-right tabular-nums">
                      Equivalente: {formatVES(rev * bcvRate)}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#00F0FF"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorRevenueGlow)"
            name="Ingresos Totales"
          />

          <Area
            type="monotone"
            dataKey="deposit"
            stroke="#10B981"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#colorDepositGlow)"
            name="Anticipos Recibidos"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
