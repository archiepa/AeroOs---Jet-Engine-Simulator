
import React from 'react';
import { EngineControls, EngineTelemetry } from '../types';
import { CircularGauge } from './Gauge';
import { Wind, Fan } from 'lucide-react';

interface BleedPanelProps {
  telemetry: EngineTelemetry;
  controls: EngineControls;
  setControls: React.Dispatch<React.SetStateAction<EngineControls>>;
}

export const BleedPanel: React.FC<BleedPanelProps> = ({ telemetry, controls, setControls }) => {
  
  const togglePack = (pack: 'packL' | 'packR') => {
      setControls(prev => ({ ...prev, [pack]: !prev[pack] }));
  };

  return (
    <div className="bg-slate-900 border-l border-b border-slate-800 p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1 border-b border-slate-800 pb-2">
            <Wind className="text-cyan-500" size={18} />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pneumatics</h3>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
             <div className="flex flex-col items-center">
                 <span className="text-[9px] text-slate-500 font-bold mb-1">BLEED VALVE</span>
                 <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${controls.bleedAir ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-800 text-slate-500'}`}>
                     {controls.bleedAir ? 'OPEN' : 'CLSD'}
                 </div>
             </div>
             <div className="h-6 w-px bg-slate-800"></div>
             <div className="flex flex-col items-center">
                 <span className="text-[9px] text-slate-500 font-bold mb-1">ISOLATION</span>
                 <div className="text-[10px] font-mono font-bold text-slate-500">AUTO</div>
             </div>
        </div>

        {/* Gauge & Pack Switches */}
        <div className="flex items-center gap-4">
            
            {/* Left Pack Switch */}
            <PackSwitch label="PACK L" active={controls.packL} onClick={() => togglePack('packL')} />

            {/* Center Gauge */}
            <div className="relative">
                <CircularGauge 
                    label="DUCT PRESS" 
                    value={telemetry.bleedPsi} 
                    min={0} max={60} 
                    unit="PSI" 
                    size="sm"
                    warningHigh={55}
                />
            </div>

            {/* Right Pack Switch */}
            <PackSwitch label="PACK R" active={controls.packR} onClick={() => togglePack('packR')} />
        </div>
    </div>
  );
};

const PackSwitch: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
    <div className="flex flex-col items-center gap-2">
        <button 
            onClick={onClick}
            className={`
                w-12 h-16 rounded border flex flex-col items-center justify-between py-2 transition-all
                ${active 
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'
                }
            `}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-cyan-400 shadow-[0_0_5px_cyan]' : 'bg-slate-900'}`}></div>
            <Fan size={16} className={active ? 'animate-spin-slow' : ''} />
            <div className="w-8 h-1 rounded-full bg-slate-900"></div>
        </button>
        <span className="text-[9px] font-bold text-slate-400">{label}</span>
    </div>
);
