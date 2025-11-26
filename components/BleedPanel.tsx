
import React from 'react';
import { EngineControls, EngineTelemetry } from '../types';
import { CircularGauge } from './Gauge';

interface BleedPanelProps {
  telemetry: EngineTelemetry;
  controls: EngineControls;
  setControls: React.Dispatch<React.SetStateAction<EngineControls>>;
}

const ScrewHead: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`w-3 h-3 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center shadow-sm ${className}`}>
        <div className="w-full h-[1.5px] bg-slate-900 rotate-45"></div>
        <div className="absolute w-full h-[1.5px] bg-slate-900 -rotate-45"></div>
    </div>
);

const GuardedToggleSwitch: React.FC<{
    label: string,
    active: boolean,
    onClick: () => void,
    onLabel?: string,
    offLabel?: string
}> = ({ label, active, onClick, onLabel="ON", offLabel="OFF" }) => {
    return (
        <div className="flex flex-col items-center gap-1 font-sans">
            <div className="w-3 h-3 rounded-full border-2 border-black/50 bg-slate-900 flex items-center justify-center mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-amber-400 shadow-[0_0_4px_#fbbf24]' : 'bg-slate-700'}`}></div>
            </div>
            <span className="text-[9px] text-slate-400 font-bold">{onLabel}</span>
            <button onClick={onClick} className="w-8 h-12 relative flex items-center justify-center group">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-red-800 border-2 border-red-900 shadow-[inset_0_1px_2px_black] group-active:bg-red-700"></div>
                <div className={`
                    absolute w-2 h-10 bg-gradient-to-b from-slate-200 to-slate-500 rounded-full
                    border border-slate-600 shadow-md transition-transform duration-200
                    origin-center group-active:scale-95
                    ${active ? '-rotate-[30deg]' : 'rotate-[30deg]'}
                `}></div>
            </button>
            <span className="text-[9px] text-slate-400 font-bold mb-1">{offLabel}</span>
            <span className="text-xs text-slate-300 font-bold tracking-wider">{label}</span>
        </div>
    )
};

export const BleedPanel: React.FC<BleedPanelProps> = ({ telemetry, controls, setControls }) => {
  
  const toggleControl = (control: keyof EngineControls) => {
      setControls(prev => ({ ...prev, [control]: !prev[control] }));
  };

  return (
    <div className="bg-slate-700 border-t-2 border-l-2 border-slate-600 border-b-4 border-r-4 border-black/50 p-4 flex flex-col gap-4 relative font-sans select-none">
        <ScrewHead className="absolute top-2 left-2" />
        <ScrewHead className="absolute top-2 right-2" />
        <ScrewHead className="absolute bottom-2 left-2" />
        <ScrewHead className="absolute bottom-2 right-2" />

        <h3 className="text-center text-lg font-black text-slate-300 tracking-widest border-b-2 border-slate-600 pb-2">
            AIR CONDITIONING
        </h3>
        
        <div className="grid grid-cols-3 items-center gap-4 py-4">
             <GuardedToggleSwitch 
                label="PACK 1" 
                active={controls.packL} 
                onClick={() => toggleControl('packL')} 
                onLabel="ON" 
                offLabel="OFF" 
             />
             <GuardedToggleSwitch 
                label="BLEED" 
                active={controls.bleedAir} 
                onClick={() => toggleControl('bleedAir')} 
                onLabel="OPEN" 
                offLabel="CLSD" 
             />
             <GuardedToggleSwitch 
                label="PACK 2" 
                active={controls.packR} 
                onClick={() => toggleControl('packR')} 
                onLabel="ON" 
                offLabel="OFF" 
             />
        </div>

        <div className="flex justify-center items-center py-2">
             <CircularGauge 
                label="DUCT PRESS" 
                value={telemetry.bleedPsi} 
                min={0} max={60} 
                unit="PSI" 
                size="md"
                warningHigh={55}
             />
        </div>
    </div>
  );
};
