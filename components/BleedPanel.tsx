import React from 'react';
import { EngineControls, EngineTelemetry } from '../types';
import { CircularGauge, GaugeBug } from './Gauge';

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

// High-fidelity aircraft toggle switch component
const AircraftToggleSwitch: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => {
  return (
    <div className="flex flex-col items-center gap-2 font-sans select-none text-center">
      {/* Switch housing */}
      <div 
        onClick={onClick}
        className="w-12 h-20 bg-slate-800 rounded-md border-t-2 border-slate-700 border-b-4 border-r-4 border-black/50 p-1 flex items-center justify-center cursor-pointer relative"
      >
        {/* Track for the switch */}
        <div className="w-4 h-16 bg-black/50 rounded-full shadow-inner"></div>

        {/* The lever */}
        <div 
          className={`
            absolute w-8 h-10 bg-gradient-to-b from-slate-200 to-slate-400 rounded-sm 
            border-t border-slate-100 border-b-2 border-slate-500 
            shadow-lg transition-transform duration-200 ease-in-out
          `}
          style={{ transform: active ? 'translateY(-12px)' : 'translateY(12px)' }}
        >
        </div>
      </div>
      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1 w-20 text-center">{label}</span>
    </div>
  );
};


export const BleedPanel: React.FC<BleedPanelProps> = ({ telemetry, controls, setControls }) => {
  
  const toggleControl = (control: keyof EngineControls) => {
      setControls(prev => ({ ...prev, [control]: !prev[control] }));
  };

  return (
    <div className="bg-slate-600 border-t-2 border-l-2 border-slate-500 border-b-4 border-r-4 border-black/50 p-4 flex flex-col gap-4 relative font-sans select-none">
        <ScrewHead className="absolute top-2 left-2" />
        <ScrewHead className="absolute top-2 right-2" />
        <ScrewHead className="absolute bottom-2 left-2" />
        <ScrewHead className="absolute bottom-2 right-2" />

        <h3 className="text-center text-lg font-black text-slate-300 tracking-widest border-b-2 border-slate-500 pb-2">
            AIR CONDITIONING
        </h3>
        
        <div className="flex items-start justify-around gap-4 py-4">
             <AircraftToggleSwitch 
                label="ENG BLEED" 
                active={controls.bleedAir} 
                onClick={() => toggleControl('bleedAir')} 
             />
             <AircraftToggleSwitch 
                label="PACK 1" 
                active={controls.packL} 
                onClick={() => toggleControl('packL')} 
             />
             <AircraftToggleSwitch 
                label="PACK 2" 
                active={controls.packR} 
                onClick={() => toggleControl('packR')} 
             />
        </div>

        <div className="flex justify-center items-center py-2 border-t-2 border-slate-500/50 pt-4">
             <CircularGauge 
                label="DUCT PRESS" 
                value={telemetry.bleedPsi} 
                min={0} max={60} 
                unit="PSI" 
                size="md"
                warningHigh={55}
                bugs={[{ value: 25, color: '#22d3ee' }, { value: 38, color: '#ec4899' }]}
             />
        </div>
    </div>
  );
};
