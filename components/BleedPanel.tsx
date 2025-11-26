
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

const ToggleSwitch: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
}> = ({ label, active, onClick }) => {
    return (
        <div className="flex items-center justify-between w-full px-4">
            <span className="text-sm font-bold text-slate-300 tracking-wider uppercase">{label}</span>
            <button
                onClick={onClick}
                className={`w-14 h-7 rounded-full p-1 transition-colors relative shadow-inner ${active ? 'bg-emerald-600' : 'bg-slate-800 border border-slate-900'}`}
            >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${active ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </button>
        </div>
    );
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
        
        <div className="flex flex-col items-center gap-4 py-4">
             <ToggleSwitch 
                label="ENG BLEED" 
                active={controls.bleedAir} 
                onClick={() => toggleControl('bleedAir')} 
             />
             <div className="h-px w-4/5 bg-slate-600/50 my-2"></div>
             <ToggleSwitch 
                label="PACK 1" 
                active={controls.packL} 
                onClick={() => toggleControl('packL')} 
             />
             <ToggleSwitch 
                label="PACK 2" 
                active={controls.packR} 
                onClick={() => toggleControl('packR')} 
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
