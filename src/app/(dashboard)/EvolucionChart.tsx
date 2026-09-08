"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function EvolucionChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map(i => i.balance));
  const min = Math.min(...data.map(i => i.balance));

  let offset = 0;
  if (max <= 0) {
    offset = 0;
  } else if (min >= 0) {
    offset = 1;
  } else {
    offset = max / (max - min);
  }

  return (
    <div style={{ width: '100%', minWidth: 0, height: 220, marginTop: '1.5rem', overflow: 'hidden' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset={offset} stopColor="#3b82f6" stopOpacity={1} />
              <stop offset={offset} stopColor="#ef4444" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="splitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset={offset} stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset={offset} stopColor="#ef4444" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="var(--text-muted)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            padding={{ left: 10, right: 10 }} 
          />
          <YAxis 
            stroke="var(--text-muted)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => value >= 1000 ? `$${(value/1000).toFixed(0)}k` : `$${value}`}
            width={45}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
            formatter={(value: any) => [
              new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value)), 
              'Saldo Disponible'
            ]}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="url(#splitColor)" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#splitFill)" 
            activeDot={{ r: 6, fill: '#3b82f6', stroke: 'var(--bg-secondary)', strokeWidth: 2 }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
