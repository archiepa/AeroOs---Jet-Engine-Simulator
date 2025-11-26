
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

const ScrewHead: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`w-2 h-2 rounded-full bg-zinc-600 border border-zinc-700 flex items-center justify-center shadow-sm ${className}`}>
        <div className="w-full h-[1px] bg-zinc-800 rotate-45"></div>
        <div className="absolute w-full h-[1px] bg-zinc-800 -rotate-45"></div>
    </div>
);

export const CircularGauge: React.FC<GaugeProps> = ({ 
  label, value, min, max, unit, warningHigh, criticalHigh, bugs, size = 'md' 
}) => {
  // Normalize value to 0-1
  const normalized = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const rotation = normalized * 270 - 135; // -135 to +135 degrees

  // Size Configuration
  const dim = size === 'lg' ? 180 : size === 'md' ? 140 : 100;
  const radius = dim / 2 - (size === 'lg' ? 15 : size === 'md' ? 12 : 10);
  const center = dim / 2;
  
  // Font sizes
  const valueTextSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm';
  const labelTextSize = size === 'lg' ? 'text-xs' : 'text-[10px]';

  // Tick Generation
  const majorTicks = 11; // 0 to 10 intervals
  const minorTicksPerMajor = 4;
  
  const renderTicks = () => {
    const ticks = [];
    const totalTicks = (majorTicks - 1) * (minorTicksPerMajor + 1) + 1;
    
    for (let i = 0; i < totalTicks; i++) {
        const percent = i / (totalTicks - 1);
        const angle = (percent * 270 - 135) * (Math.PI / 180);
        const isMajor = i % (minorTicksPerMajor + 1) === 0;
        
        const innerR = radius - (isMajor ? (size==='sm' ? 8 : 12) : (size==='sm' ? 4 : 6));
        const outerR = radius - 2;

        const x1 = center + innerR * Math.cos(angle);
        const y1 = center + innerR * Math.sin(angle);
        const x2 = center + outerR * Math.cos(angle);
        const y2 = center + outerR * Math.sin(angle);

        ticks.push(
            <line 
                key={i} 
                x1={x1} y1={y1} x2={x2} y2={y2} 
                stroke={isMajor ? '#e4e4e7' : '#71717a'} 
                strokeWidth={isMajor ? 2 : 1}
            />
        );
    }
    return ticks;
  };

  // Color Zones (Arcs)
  const renderArc = (startVal: number, endVal: number, color: string) => {
      const startPct = (startVal - min) / (max - min);
      const endPct = (endVal - min) / (max - min);
      
      // Convert to SVG Arc definition
      // 270 degrees total range. Start is -135.
      const startAngle = (startPct * 270 - 135 - 90) * (Math.PI / 180); // -90 adjustment for SVG coords
      const endAngle = (endPct * 270 - 135 - 90) * (Math.PI / 180);
      
      const r = radius - (size === 'sm' ? 6 : 8);
      
      const x1 = center + r * Math.cos(startAngle);
      const y1 = center + r * Math.sin(startAngle);
      const x2 = center + r * Math.cos(endAngle);
      const y2 = center + r * Math.sin(endAngle);
      
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
      
      return (
          <path 
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth={size === 'sm' ? 3 : 5}
            strokeLinecap="butt"
          />
      );
  };

  return (
    <div className="flex flex-col items-center">
        {/* Retro Housing */}
        <div 
            className="relative bg-zinc-800 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] border-t border-l border-zinc-700 border-b-4 border-r-4 border-b-black border-r-black flex items-center justify-center"
            style={{ width: dim, height: dim }}
        >
            {/* Screws */}
            <ScrewHead className="absolute top-1 left-1" />
            <ScrewHead className="absolute top-1 right-1" />
            <ScrewHead className="absolute bottom-1 left-1" />
            <ScrewHead className="absolute bottom-1 right-1" />

            {/* Gauge Face (Inset) */}
            <div className="rounded-full bg-black shadow-[inset_0_4px_10px_rgba(0,0,0,1)] border-2 border-zinc-700 relative overflow-hidden" style={{ width: dim - 10, height: dim - 10 }}>
                
                <svg className="w-full h-full">
                    {/* Ticks */}
                    {renderTicks()}

                    {/* Color Bands */}
                    {warningHigh && renderArc(warningHigh, criticalHigh || max, '#f59e0b')}
                    {criticalHigh && renderArc(criticalHigh, max, '#ef4444')}
                </svg>

                {/* Bugs */}
                {bugs?.map((bug, i) => {
                    const bugNorm = Math.min(Math.max((bug.value - min) / (max - min), 0), 1);
                    const bugRot = bugNorm * 270 - 135;
                    return (
                        <div 
                            key={i}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            style={{ transform: `rotate(${bugRot}deg)` }}
                        >
                            <div 
                                className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent shadow-sm z-10"
                                style={{ 
                                    top: '0px',
                                    borderTopColor: bug.color, 
                                }}
                            ></div>
                        </div>
                    )
                })}

                {/* Digital Readout (LCD style fallback inside analog) */}
                <div className="absolute top-[65%] left-1/2 -translate-x-1/2 flex flex-col items-center z-0">
                    <div className="bg-[#1a1a1a] border border-zinc-700 px-1 rounded shadow-inner">
                         <span className={`font-mono font-bold ${valueTextSize} text-[#ff9900] tabular-nums tracking-tighter`}>
                            {value.toFixed(0)}
                        </span>
                    </div>
                    {size !== 'sm' && <span className="text-[9px] text-zinc-500 font-bold mt-0.5">{unit}</span>}
                </div>

                {/* Label */}
                <div className="absolute top-[25%] left-1/2 -translate-x-1/2 text-center">
                    <span className={`${labelTextSize} font-bold text-zinc-400 tracking-widest`}>{label}</span>
                </div>

                {/* Needle */}
                <div 
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center transition-transform duration-300 ease-out z-20"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                     {/* Needle SVG */}
                     <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-md">
                        {/* The needle pointer */}
                        <polygon points="50,10 46,50 54,50" fill="white" />
                        {/* Counterweight */}
                        <rect x="48" y="50" width="4" height="15" fill="#white" />
                     </svg>
                </div>

                {/* Center Cap */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#111] rounded-full border-2 border-zinc-600 shadow-md z-30"></div>
                
                {/* Glare Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-full pointer-events-none"></div>
            </div>
        </div>
    </div>
  );
};

export const BarGauge: React.FC<GaugeProps> = ({ 
    label, value, min, max, unit, warningHigh, criticalHigh 
}) => {
    const range = max - min;
    const percent = Math.min(Math.max(((value - min) / range) * 100, 0), 100);
    
    // Retro colors
    let barColor = 'bg-white';
    if (criticalHigh && value >= criticalHigh) barColor = 'bg-red-500';
    else if (warningHigh && value >= warningHigh) barColor = 'bg-amber-500';

    return (
        <div className="relative bg-zinc-800 p-2 rounded border-t border-l border-zinc-700 border-b-4 border-r-4 border-black">
             <ScrewHead className="absolute top-1 left-1 w-1.5 h-1.5" />
             <ScrewHead className="absolute top-1 right-1 w-1.5 h-1.5" />
             <ScrewHead className="absolute bottom-1 left-1 w-1.5 h-1.5" />
             <ScrewHead className="absolute bottom-1 right-1 w-1.5 h-1.5" />

            <div className="flex justify-between mb-1 px-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{label}</span>
                <span className="text-[10px] font-mono text-[#ff9900] font-bold">{value.toFixed(1)}</span>
            </div>
            
            <div className="h-3 w-full bg-black shadow-[inset_0_1px_3px_rgba(0,0,0,1)] rounded-sm border border-zinc-700 relative overflow-hidden">
                {/* Scale Ticks */}
                <div className="absolute inset-0 w-full h-full flex justify-between px-0.5">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-full w-[1px] bg-zinc-800"></div>
                    ))}
                </div>

                <div 
                    className={`h-full ${barColor} transition-all duration-300 ease-out relative`} 
                    style={{ width: `${percent}%` }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-black/50"></div>
                </div>
            </div>
        </div>
    );
}
