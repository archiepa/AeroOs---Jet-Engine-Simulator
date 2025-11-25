
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EngineTelemetry } from '../types';

export interface ChartSeries {
  dataKey: keyof EngineTelemetry;
  name: string;
  color: string;
  unit: string;
  yAxisId: string;
}

export interface ChartAxis {
  id: string;
  domain: [number, number];
  orientation: 'left' | 'right';
  label?: string;
  hide?: boolean;
}

interface TelemetryChartProps {
  data: EngineTelemetry[];
  series: ChartSeries[];
  axes: ChartAxis[];
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ 
  data, 
  series,
  axes
}) => {
  return (
    <div className="w-full h-full bg-slate-900/50 rounded-lg border border-slate-700/50 p-4 flex flex-col backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></span>
            Combined Telemetry Stream
        </h3>
      </div>
      
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
            
            <XAxis 
                dataKey="timestamp" 
                hide={true} 
                type="number" 
                domain={['dataMin', 'dataMax']} 
            />

            {axes.map((axis) => (
                <YAxis 
                    key={axis.id}
                    yAxisId={axis.id}
                    orientation={axis.orientation}
                    domain={axis.domain}
                    hide={axis.hide}
                    tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} 
                    axisLine={false} 
                    tickLine={false}
                    width={40}
                />
            ))}

            <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ fontFamily: 'monospace', fontSize: '12px', padding: '2px 0' }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number, name: string, props: any) => {
                    const unit = props.payload ? series.find(s => s.name === name)?.unit : '';
                    return [`${value.toFixed(1)} ${unit}`, name];
                }}
            />
            
            <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase', paddingBottom: '10px' }}
            />

            {series.map((s) => (
                <Line
                    key={s.dataKey}
                    yAxisId={s.yAxisId}
                    type="monotone"
                    dataKey={s.dataKey}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    isAnimationActive={false}
                />
            ))}
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
