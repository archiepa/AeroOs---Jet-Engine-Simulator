
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
  // Animation speeds based on RPM
  // CSS animation duration is inverse to speed. 0 speed = infinite duration.
  const fanSpeed = n1 > 1 ? (60 / Math.max(n1, 1)) * 0.5 : 0;
  const coreSpeed = n2 > 1 ? (60 / Math.max(n2, 1)) * 0.2 : 0;

  const fanStyle = fanSpeed > 0 ? { animation: `spin ${fanSpeed}s linear infinite` } : {};
  const coreStyle = coreSpeed > 0 ? { animation: `spin ${coreSpeed}s linear infinite` } : {};

  // Combustion Chamber Color
  // Normal range 400-800 (Orange/Yellow). Fire > 1000 (Red/White).
  let combustorColor = 'fill-slate-800';
  let combustorOpacity = 0.5;
  
  if (state === EngineState.FIRE || failures.engineFire) {
      combustorColor = 'fill-red-600 animate-pulse';
      combustorOpacity = 0.9;
  } else if (egt > 300) {
      // Normalize EGT 300-900 to 0-1 opacity
      const intensity = Math.min(Math.max((egt - 300) / 600, 0), 1);
      combustorColor = 'fill-amber-500';
      combustorOpacity = 0.3 + (intensity * 0.6);
  }

  return (
    <div className="w-full h-64 bg-slate-900 rounded-lg border border-slate-700 relative overflow-hidden flex flex-col items-center justify-center p-4">
       <span className="absolute top-2 left-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
           Engine Schematic View
       </span>
       
       {/* Labels */}
       <div className="absolute bottom-2 left-4 flex gap-4 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div>FAN (N1)</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>COMPRESSOR (N2)</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>COMBUSTOR</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>TURBINE</div>
       </div>

       <svg viewBox="0 0 800 300" className="w-full h-full max-w-2xl drop-shadow-2xl">
          <defs>
             <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#475569" />
                 <stop offset="50%" stopColor="#94a3b8" />
                 <stop offset="100%" stopColor="#475569" />
             </linearGradient>
          </defs>

          {/* Casing / Nacelle (Top) */}
          <path d="M 50,50 Q 200,40 400,50 T 750,80 L 750,20 L 50,20 Z" fill="url(#metal)" stroke="#334155" />
          
          {/* Casing / Nacelle (Bottom) */}
          <path d="M 50,250 Q 200,260 400,250 T 750,220 L 750,280 L 50,280 Z" fill="url(#metal)" stroke="#334155" />

          {/* Core Flow Path (Static) */}
          <path d="M 150,80 L 650,100 L 650,200 L 150,220 Z" fill="#1e293b" opacity="0.5" />

          {/* Combustion Chamber (Glow Layer) */}
          <rect x="400" y="110" width="100" height="80" className={`${combustorColor} transition-all duration-500`} style={{ opacity: combustorOpacity }} rx="10" />

          {/* Shaft (N2) */}
          <rect x="200" y="145" width="450" height="10" fill="#334155" />
          
          {/* Shaft (N1) - Inner */}
          <rect x="100" y="148" width="600" height="4" fill="#94a3b8" />

          {/* N2 Compressor Stages */}
          <g style={{ transformOrigin: '400px 150px', ...coreStyle }}>
              {/* Compressor Discs */}
              {[220, 240, 260, 280, 300, 320, 340].map((x, i) => (
                  <line key={`comp-${i}`} x1={x} y1="100" x2={x} y2="200" stroke="#3b82f6" strokeWidth="4" />
              ))}
              {/* Turbine Discs */}
              {[550, 580, 610].map((x, i) => (
                  <line key={`turb-${i}`} x1={x} y1="110" x2={x} y2="190" stroke="#a855f7" strokeWidth="4" />
              ))}
          </g>

          {/* N1 Fan & Low Pressure Turbine */}
          <g style={{ transformOrigin: '400px 150px', ...fanStyle }}>
              {/* The Big Fan */}
              <line x1="120" y1="55" x2="120" y2="245" stroke="#22d3ee" strokeWidth="12" strokeLinecap="round" />
              {/* LP Turbine */}
              <line x1="680" y1="100" x2="680" y2="200" stroke="#22d3ee" strokeWidth="6" />
          </g>

          {/* Exhaust Plume (Visible if Running/Fire) */}
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
          
          {/* Structural Struts */}
          <line x1="150" y1="50" x2="150" y2="80" stroke="#475569" strokeWidth="4" />
          <line x1="150" y1="220" x2="150" y2="250" stroke="#475569" strokeWidth="4" />

       </svg>
       
       <style>{`
         @keyframes spin {
           from { transform: rotate(0deg); }
           to { transform: rotate(360deg); }
         }
       `}</style>
    </div>
  );
};
