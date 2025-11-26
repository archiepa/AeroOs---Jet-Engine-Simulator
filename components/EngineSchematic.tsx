
import React from 'react';
import { EngineState, FailureState } from '../types';

interface EngineSchematicProps {
  n1: number;
  n2: number;
  egt: number;
  state: EngineState;
  failures: FailureState;
}

export const EngineSchematic: React.FC<EngineSchematicProps> = ({ n1, n2, egt, state, failures }) => {
  // Component Status Logic
  const getStatus = (val: number, warn: number, crit: number, isFire: boolean = false) => {
      if (isFire) return { label: 'FIRE', color: 'text-red-500 animate-pulse', dot: 'bg-red-500' };
      if (state === EngineState.SEIZED) return { label: 'FAILURE', color: 'text-red-700 font-black', dot: 'bg-red-900' };
      if (val >= crit) return { label: 'CRITICAL', color: 'text-red-500', dot: 'bg-red-500' };
      if (val >= warn) return { label: 'WARNING', color: 'text-amber-500', dot: 'bg-amber-500' };
      return { label: 'NORMAL', color: 'text-emerald-500', dot: 'bg-emerald-500' };
  };

  const isSeized = state === EngineState.SEIZED;

  const fanStatus = getStatus(n1, 98, 102);
  const compStatus = getStatus(n2, 98, 102);
  const combStatus = getStatus(egt, 850, 950, state === EngineState.FIRE || failures.engineFire);
  const turbStatus = getStatus(egt, 900, 980); // Turbine sensitive to heat

  // Combustion Chamber Visuals
  let combustorColor = 'fill-slate-800';
  let combustorOpacity = 0.5;
  
  if (state === EngineState.FIRE || failures.engineFire) {
      combustorColor = 'fill-red-600 animate-pulse';
      combustorOpacity = 0.9;
  } else if (egt > 300) {
      const intensity = Math.min(Math.max((egt - 300) / 600, 0), 1);
      combustorColor = 'fill-amber-500';
      combustorOpacity = 0.3 + (intensity * 0.6);
  }
  
  if (isSeized) {
      combustorColor = 'fill-slate-900';
      combustorOpacity = 0.8;
  }

  return (
    <div className="w-full h-80 bg-slate-900/50 rounded-lg border border-slate-700/50 flex flex-col relative overflow-hidden backdrop-blur-sm">
       <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Real-time System Schematic
            </h3>
            <div className="flex gap-4">
                <StatusBadge label="FAN" status={fanStatus} />
                <StatusBadge label="COMPRESSOR" status={compStatus} />
                <StatusBadge label="COMBUSTOR" status={combStatus} />
                <StatusBadge label="TURBINE" status={turbStatus} />
            </div>
       </div>

       <div className="flex-1 relative flex items-center justify-center p-4">
           {isSeized && (
               <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                   <div className="bg-red-950/90 border-2 border-red-600 p-4 rounded-lg flex flex-col items-center animate-pulse">
                       <span className="text-2xl font-black text-red-500 tracking-[0.2em] mb-1">CATASTROPHIC FAILURE</span>
                       <span className="text-xs font-mono text-red-300">CORE SEIZURE DETECTED • STRUCTURAL INTEGRITY LOSS</span>
                   </div>
               </div>
           )}

           <svg viewBox="0 0 800 300" className={`w-full h-full max-w-3xl drop-shadow-2xl transition-all duration-1000 ${isSeized ? 'grayscale brightness-50 contrast-125' : ''}`}>
              <defs>
                 <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#94a3b8" />
                     <stop offset="50%" stopColor="#f1f5f9" />
                     <stop offset="100%" stopColor="#64748b" />
                 </linearGradient>
              </defs>

              {/* Casing / Nacelle */}
              <path d="M 50,50 Q 200,40 400,50 T 750,80 L 750,20 L 50,20 Z" fill="url(#metal)" stroke="#334155" />
              <path d="M 50,250 Q 200,260 400,250 T 750,220 L 750,280 L 50,280 Z" fill="url(#metal)" stroke="#334155" />

              {/* Core Flow Path */}
              <path d="M 150,80 L 650,100 L 650,200 L 150,220 Z" fill="#1e293b" opacity="0.5" />

              {/* Combustion Chamber */}
              <rect x="400" y="110" width="100" height="80" className={`${combustorColor} transition-all duration-500`} style={{ opacity: combustorOpacity }} rx="10" />

              {/* Shafts - Broken if Seized */}
              {isSeized ? (
                <g>
                   {/* Broken Low Pressure Shaft (jagged path) */}
                   <path d="M 100 148 L 250 146 L 300 150 L 450 147 L 650 151 L 648 155 L 450 151 L 302 154 L 250 150 L 102 152 Z" fill="#94a3b8" />
                   {/* Broken High Pressure Shaft (jagged path) */}
                   <path d="M 200 145 L 350 142 L 500 146 L 650 144 L 648 155 L 500 154 L 352 150 L 202 153 Z" fill="#334155" />
                </g>
              ) : (
                <g>
                    <rect x="200" y="145" width="450" height="10" fill="#334155" />
                    <rect x="100" y="148" width="600" height="4" fill="#94a3b8" />
                </g>
              )}

              {/* N2 Compressor & Turbine Stages */}
              <g opacity={isSeized ? 0.6 : 1}>
                  {[220, 240, 260, 280, 300, 320, 340].map((x, i) => (
                      <path 
                        key={`comp-${i}`} 
                        d={`M ${x-2} 100 L ${x+2} 102 L ${x-1} 200 L ${x-5} 198 Z`}
                        stroke={compStatus.label === 'CRITICAL' ? '#b91c1c' : '#3b82f6'} 
                        fill={compStatus.label === 'CRITICAL' ? '#ef4444' : '#3b82f6'} 
                        transform={isSeized ? `rotate(${Math.random() * 20 - 10}, ${x}, 150)` : ""}
                      />
                  ))}
                  {[550, 580, 610].map((x, i) => (
                      <path 
                        key={`turb-${i}`} 
                        d={`M ${x-2} 110 L ${x+2} 108 L ${x+1} 190 L ${x-3} 192 Z`}
                        stroke={turbStatus.label === 'CRITICAL' ? '#b91c1c' : '#a855f7'} 
                        fill={turbStatus.label === 'CRITICAL' ? '#ef4444' : '#a855f7'}
                        transform={isSeized ? `rotate(${Math.random() * 20 - 10}, ${x}, 150)` : ""}
                      />
                  ))}
              </g>

              {/* N1 Fan & Low-Pressure Turbine */}
              <g opacity={isSeized ? 0.6 : 1}>
                  <path 
                    d="M 115 55 C 120 100, 120 200, 115 245 L 125 245 C 130 200, 130 100, 125 55 Z"
                    stroke={fanStatus.label === 'CRITICAL' ? '#b91c1c' : '#22d3ee'} 
                    fill={fanStatus.label === 'CRITICAL' ? '#ef4444' : '#22d3ee'}
                    transform={isSeized ? "rotate(15, 120, 150)" : ""}
                  />
                  <path 
                    d="M 678 100 C 680 133, 680 167, 678 200 L 682 200 C 684 167, 684 133, 682 100 Z"
                    stroke={turbStatus.label === 'CRITICAL' ? '#b91c1c' : '#22d3ee'} 
                    fill={turbStatus.label === 'CRITICAL' ? '#ef4444' : '#22d3ee'}
                    transform={isSeized ? "rotate(-10, 680, 150)" : ""}
                  />
              </g>

              {/* Exhaust Plume */}
              {(egt > 400 || state === EngineState.FIRE) && !isSeized && (
                  <path 
                    d="M 700,120 L 780,100 L 780,200 L 700,180 Z" 
                    fill="url(#exhaust)" 
                    className="animate-pulse opacity-50"
                  />
              )}
              
              <defs>
                  <linearGradient id="exhaust" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
              </defs>
              
              {/* Struts */}
              <line x1="150" y1="50" x2="150" y2="80" stroke="#475569" strokeWidth="4" />
              <line x1="150" y1="220" x2="150" y2="250" stroke="#475569" strokeWidth="4" />
           </svg>
       </div>
    </div>
  );
};

const StatusBadge: React.FC<{ label: string, status: { label: string, color: string, dot: string } }> = ({ label, status }) => (
    <div className="flex flex-col items-end">
        <span className="text-[10px] text-slate-500 font-bold">{label}</span>
        <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></div>
            <span className={`text-[10px] font-mono font-bold ${status.color}`}>{status.label}</span>
        </div>
    </div>
);
