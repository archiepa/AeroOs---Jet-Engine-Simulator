
import React from 'react';
import { EngineControls, FuelSystemState } from '../types';
import { VerticalBarGauge } from './Gauge';

interface FuelPanelProps {
  fuelSystem: FuelSystemState;
  controls: EngineControls;
  setControls: React.Dispatch<React.SetStateAction<EngineControls>>;
}

const ScrewHead: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`w-3 h-3 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center shadow-sm ${className}`}>
        <div className="w-full h-[1.5px] bg-slate-900 rotate-45"></div>
        <div className="absolute w-full h-[1.5px] bg-slate-900 -rotate-45"></div>
    </div>
);

// Small Tap Switch for Pumps/Valves
const TapSwitch: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  orientation?: 'vertical' | 'horizontal';
}> = ({ label, active, onClick, orientation = 'vertical' }) => {
  return (
    <div className="flex flex-col items-center gap-2 font-sans select-none">
       <div 
         onClick={onClick}
         className="cursor-pointer relative flex items-center justify-center"
       >
          {/* Base Ring */}
          <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 shadow-md"></div>
          
          {/* Tap Handle */}
          <div 
            className={`
                absolute bg-slate-300 border border-slate-500 rounded-sm shadow-lg
                transition-transform duration-200 ease-in-out
                ${orientation === 'vertical' ? 'w-2 h-10' : 'w-10 h-2'}
            `}
            style={{ 
                transform: active 
                    ? (orientation === 'vertical' ? 'rotate(0deg)' : 'rotate(90deg)') 
                    : (orientation === 'vertical' ? 'rotate(-90deg)' : 'rotate(0deg)') 
            }}
          >
             {/* Grip Lines */}
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2px]">
                 <div className="w-full h-[1px] bg-slate-400"></div>
                 <div className="w-full h-[1px] bg-slate-400"></div>
             </div>
          </div>
       </div>
       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center w-16 leading-tight">{label}</span>
    </div>
  );
};

// Covered/Guarded Switch for Dump
const GuardedDumpSwitch: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
}> = ({ label, active, onClick }) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-10 h-14" onClick={onClick}>
                {/* Base */}
                <div className="w-full h-full bg-slate-900 rounded border border-slate-700 shadow-inner cursor-pointer"></div>
                
                {/* Switch Lever */}
                <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-6 bg-white rounded-sm shadow-md transition-all duration-200 pointer-events-none ${active ? 'top-1 bg-red-500' : 'bottom-1 bg-slate-200'}`}></div>
                
                {/* Guard Cover */}
                <div className={`
                    absolute inset-0 w-full h-full transition-transform duration-300 origin-top pointer-events-none border-2 border-red-600 bg-red-900/20 rounded-sm flex flex-col justify-end items-center pb-1
                    ${active ? 'rotate-x-[-110deg]' : 'rotate-x-0'}
                `}>
                     <div className="w-full h-[1px] bg-red-600/50 mb-1"></div>
                     <div className="w-full h-[1px] bg-red-600/50 mb-1"></div>
                </div>
            </div>
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">{label}</span>
        </div>
    );
};

export const FuelPanel: React.FC<FuelPanelProps> = ({ fuelSystem, controls, setControls }) => {
  
  const toggle = (key: keyof EngineControls) => {
      setControls(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-slate-700 border-t-2 border-l-2 border-slate-600 border-b-4 border-r-4 border-black/50 p-4 flex flex-col gap-4 relative font-sans select-none shadow-xl mt-4">
        <ScrewHead className="absolute top-2 left-2" />
        <ScrewHead className="absolute top-2 right-2" />
        <ScrewHead className="absolute bottom-2 left-2" />
        <ScrewHead className="absolute bottom-2 right-2" />

        <div className="border-b-2 border-slate-600 pb-1 mb-2">
             <h3 className="text-center text-sm font-black text-slate-300 tracking-[0.2em]">FUEL MANAGEMENT</h3>
        </div>

        {/* Main Content Row */}
        <div className="flex justify-between items-start">
            
            {/* Left System */}
            <div className="flex flex-col items-center gap-3">
                <VerticalBarGauge 
                    label="L MAIN" 
                    value={fuelSystem.tankL} 
                    min={0} max={fuelSystem.capacityL} 
                    unit="KG" 
                    warningLow={500} 
                    criticalLow={200} 
                />
                <TapSwitch 
                    label="L PUMP" 
                    active={controls.tankPumpL} 
                    onClick={() => toggle('tankPumpL')} 
                />
            </div>

            {/* Center / Crossfeed & Dumps */}
            <div className="flex flex-col items-center justify-between h-full pt-4 gap-6">
                
                {/* Crossfeed */}
                <div className="flex flex-col items-center bg-slate-800/50 p-2 rounded border border-slate-600">
                    <span className="text-[9px] text-slate-400 font-bold mb-2">X-FEED</span>
                    <TapSwitch 
                        label="" 
                        active={controls.crossfeed} 
                        onClick={() => toggle('crossfeed')} 
                        orientation="horizontal"
                    />
                </div>

                {/* Dumps */}
                <div className="flex gap-2">
                    <GuardedDumpSwitch 
                        label="DUMP L" 
                        active={controls.dumpL} 
                        onClick={() => toggle('dumpL')} 
                    />
                    <GuardedDumpSwitch 
                        label="DUMP B" 
                        active={controls.dumpR} 
                        onClick={() => toggle('dumpR')} 
                    />
                </div>
            </div>

            {/* Right System (Now Backup) */}
            <div className="flex flex-col items-center gap-3">
                <VerticalBarGauge 
                    label="BACKUP" 
                    value={fuelSystem.tankR} 
                    min={0} max={fuelSystem.capacityR} 
                    unit="KG" 
                    warningLow={50} 
                    criticalLow={10} 
                />
                <TapSwitch 
                    label="B PUMP" 
                    active={controls.tankPumpR} 
                    onClick={() => toggle('tankPumpR')} 
                />
            </div>

        </div>
    </div>
  );
};
