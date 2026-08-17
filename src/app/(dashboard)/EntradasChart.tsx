"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function EntradasChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%', minWidth: 0, height: 180, marginTop: '1.5rem', overflow: 'hidden' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
            formatter={(value: any) => [new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value)), 'Ingreso']}
            labelFormatter={(label) => `Día ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#10b981" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorIngreso)" 
            activeDot={{ r: 6, fill: '#10b981', stroke: 'var(--bg-secondary)', strokeWidth: 2 }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
