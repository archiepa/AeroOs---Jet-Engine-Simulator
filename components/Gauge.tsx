import React from 'react';

export interface GaugeBug {
  value: number;
  color: string;
}

interface GaugeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  warningLow?: number;
  warningHigh?: number;
  criticalHigh?: number;
  bugs?: GaugeBug[];
  size?: 'sm' | 'md' | 'lg';
}

export const CircularGauge: React.FC<GaugeProps> = ({ 
  label, value, min, max, unit, warningHigh, criticalHigh, bugs, size = 'md' 
}) => {
  // Normalize value to 0-1
  const normalized = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const rotation = normalized * 270 - 135; // -135 to +135 degrees

  let color = 'text-cyan-400';
  let strokeColor = '#22d3ee'; // cyan-400

  if (criticalHigh && value >= criticalHigh) {
    color = 'text-red-500';
    strokeColor = '#ef4444';
  } else if (warningHigh && value >= warningHigh) {
    color = 'text-amber-400';
    strokeColor = '#fbbf24';
  }

  const radius = size === 'lg' ? 60 : size === 'md' ? 45 : 30;
  const strokeWidth = size === 'lg' ? 12 : 8;
  const dim = size === 'lg' ? 160 : size === 'md' ? 120 : 80;
  const center = dim / 2;

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg">
      <div className="relative" style={{ width: dim, height: dim }}>
        {/* Background Arc */}
        <svg className="w-full h-full transform rotate-90">
             <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                className="text-slate-700 opacity-30"
                strokeDasharray={`${2 * Math.PI * radius * 0.75} ${2 * Math.PI * radius * 0.25}`}
                strokeDashoffset={0}
             />
        </svg>
        
        {/* Bugs (Markers) */}
        {bugs?.map((bug, i) => {
            const bugNorm = Math.min(Math.max((bug.value - min) / (max - min), 0), 1);
            const bugRot = bugNorm * 270 - 135;
            return (
                <div 
                    key={i}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                    style={{ transform: `rotate(${bugRot}deg)` }}
                >
                    {/* The Bug Marker (Trapezoid/Triangle on outer rim) */}
                    <div 
                        className="absolute top-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent shadow-sm"
                        style={{ borderTopColor: bug.color, filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))' }}
                    ></div>
                </div>
            )
        })}

        {/* Value Needle */}
        <div 
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center transition-transform duration-300 ease-out z-0"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
             <div className="w-1 h-1/2 bg-transparent relative">
                <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-4 ${color.replace('text-', 'bg-')} rounded-full shadow-[0_0_10px_currentColor]`}></div>
             </div>
        </div>

        {/* Digital Readout centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <span className={`font-mono font-bold ${size === 'lg' ? 'text-3xl' : 'text-xl'} ${color} drop-shadow-md`}>
            {value.toFixed(0)}
          </span>
          <span className="text-xs text-slate-400 uppercase">{unit}</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">{label}</span>
    </div>
  );
};

export const BarGauge: React.FC<GaugeProps> = ({ 
    label, value, min, max, unit, warningHigh, criticalHigh 
}) => {
    const range = max - min;
    const percent = Math.min(Math.max(((value - min) / range) * 100, 0), 100);
    
    let barColor = 'bg-cyan-500';
    if (criticalHigh && value >= criticalHigh) barColor = 'bg-red-500 shadow-[0_0_10px_#ef4444]';
    else if (warningHigh && value >= warningHigh) barColor = 'bg-amber-500 shadow-[0_0_8px_#fbbf24]';

    return (
        <div className="flex flex-col w-full bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400 font-bold">{label}</span>
                <span className="text-xs font-mono text-white">{value.toFixed(1)} <span className="text-slate-500">{unit}</span></span>
            </div>
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${barColor} transition-all duration-300 ease-out`} 
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}