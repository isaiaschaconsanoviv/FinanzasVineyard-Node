"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ExchangeRateChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%', minWidth: 0, height: 180, marginTop: '1.5rem', overflow: 'hidden' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            stroke="var(--text-muted)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            padding={{ left: 30, right: 30 }} 
          />
          <YAxis 
            stroke="var(--text-muted)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            domain={['dataMin - 0.2', 'dataMax + 0.2']} 
            tickFormatter={(value) => value.toFixed(1)}
            width={35}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
            itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'MXN']}
          />
          <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
