
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
      if (val >= crit) return { label: 'CRITICAL', color: 'text-red-500', dot: 'bg-red-500' };
      if (val >= warn) return { label: 'WARNING', color: 'text-amber-500', dot: 'bg-amber-500' };
      return { label: 'NORMAL', color: 'text-emerald-500', dot: 'bg-emerald-500' };
  };

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
           <svg viewBox="0 0 800 300" className="w-full h-full max-w-3xl drop-shadow-2xl">
              <defs>
                 <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#475569" />
                     <stop offset="50%" stopColor="#94a3b8" />
                     <stop offset="100%" stopColor="#475569" />
                 </linearGradient>
              </defs>

              {/* Casing / Nacelle */}
              <path d="M 50,50 Q 200,40 400,50 T 750,80 L 750,20 L 50,20 Z" fill="url(#metal)" stroke="#334155" />
              <path d="M 50,250 Q 200,260 400,250 T 750,220 L 750,280 L 50,280 Z" fill="url(#metal)" stroke="#334155" />

              {/* Core Flow Path */}
              <path d="M 150,80 L 650,100 L 650,200 L 150,220 Z" fill="#1e293b" opacity="0.5" />

              {/* Combustion Chamber */}
              <rect x="400" y="110" width="100" height="80" className={`${combustorColor} transition-all duration-500`} style={{ opacity: combustorOpacity }} rx="10" />

              {/* Shafts */}
              <rect x="200" y="145" width="450" height="10" fill="#334155" />
              <rect x="100" y="148" width="600" height="4" fill="#94a3b8" />

              {/* N2 Compressor Stages */}
              <g>
                  {[220, 240, 260, 280, 300, 320, 340].map((x, i) => (
                      <line key={`comp-${i}`} x1={x} y1="100" x2={x} y2="200" stroke={compStatus.label === 'CRITICAL' ? '#ef4444' : '#3b82f6'} strokeWidth="4" />
                  ))}
                  {[550, 580, 610].map((x, i) => (
                      <line key={`turb-${i}`} x1={x} y1="110" x2={x} y2="190" stroke={turbStatus.label === 'CRITICAL' ? '#ef4444' : '#a855f7'} strokeWidth="4" />
                  ))}
              </g>

              {/* N1 Fan */}
              <g>
                  <line x1="120" y1="55" x2="120" y2="245" stroke={fanStatus.label === 'CRITICAL' ? '#ef4444' : '#22d3ee'} strokeWidth="12" strokeLinecap="round" />
                  <line x1="680" y1="100" x2="680" y2="200" stroke={turbStatus.label === 'CRITICAL' ? '#ef4444' : '#22d3ee'} strokeWidth="6" />
              </g>

              {/* Exhaust Plume */}
              {(egt > 400 || state === EngineState.FIRE) && (
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
