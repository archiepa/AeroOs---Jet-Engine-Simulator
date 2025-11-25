import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EngineTelemetry } from '../types';

interface TelemetryChartProps {
  data: EngineTelemetry[];
  dataKey: keyof EngineTelemetry;
  color: string;
  label: string;
  min?: number;
  max?: number;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ 
  data, 
  dataKey, 
  color, 
  label,
  min,
  max
}) => {
  const domain: [number | string, number | string] = [min ?? 'auto', max ?? 'auto'];

  return (
    <div className="w-full h-48 bg-slate-800/30 rounded-lg border border-slate-700/50 p-2 flex flex-col">
      <div className="flex justify-between items-center px-2 mb-2">
        <span className="text-xs font-bold text-slate-400 uppercase">{label} History</span>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }}></div>
            <span className="text-xs font-mono text-slate-500">LIVE</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
            <defs>
                <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
                dataKey="timestamp" 
                hide={true} 
                domain={['dataMin', 'dataMax']} 
                type="number"
            />
            <YAxis 
                hide={false} 
                tick={{fill: '#64748b', fontSize: 10}} 
                axisLine={false} 
                tickLine={false}
                domain={domain}
                width={35}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0', fontFamily: 'monospace' }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number) => [value.toFixed(1), label]}
            />
            <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                fillOpacity={1} 
                fill={`url(#color${dataKey})`} 
                strokeWidth={2}
                isAnimationActive={false} // Disable animation for smoother realtime updates
            />
            </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};