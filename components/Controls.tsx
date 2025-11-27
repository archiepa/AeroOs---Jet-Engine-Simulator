import React from 'react';
import { Power, Flame, Zap, Wind, RotateCw } from 'lucide-react';
import { EngineControls } from '../types';

interface ControlsProps {
  controls: EngineControls;
  setControls: React.Dispatch<React.SetStateAction<EngineControls>>;
}

export const ControlPanel: React.FC<ControlsProps> = ({ controls, setControls }) => {
  
  const toggle = (key: keyof EngineControls) => {
    setControls(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThrottle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setControls(prev => ({ ...prev, throttle: parseFloat(e.target.value) }));
  };

  return (
    <div className="bg-slate-900 border-t border-slate-700 p-6 flex flex-col md:flex-row items-center gap-8 shadow-2xl z-20">
      
      {/* Throttle Quadrant */}
      <div className="flex flex-col items-center w-full md:w-1/3 space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Throttle Thrust</label>
        <div className="relative w-full h-12 flex items-center bg-slate-800 rounded-lg border border-slate-600 px-4 shadow-inner">
            <div className="absolute left-4 right-4 h-2 bg-slate-700 rounded-full"></div>
            <input 
                type="range" 
                min="0" 
                max="100" 
                step="0.1" 
                value={controls.throttle}
                onChange={handleThrottle}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Visual Slider Thumb */}
            <div 
                className="absolute h-8 w-12 bg-gradient-to-b from-slate-200 to-slate-400 rounded shadow-xl border border-slate-500 flex items-center justify-center pointer-events-none transition-all duration-75 ease-linear"
                style={{ left: `calc(${controls.throttle}% - 24px)` }}
            >
                <div className="w-8 h-1 bg-slate-300 rounded-full"></div>
            </div>
        </div>
        <div className="flex justify-between w-full text-xs font-mono text-slate-500">
            <span>IDLE</span>
            <span>CRZ</span>
            <span>CLB</span>
            <span>TOGA</span>
        </div>
      </div>

      {/* Switch Panel */}
      <div className="grid grid-cols-5 gap-4 w-full md:w-2/3">
        
        <Switch 
            label="Master" 
            active={controls.masterSwitch} 
            onClick={() => toggle('masterSwitch')} 
            icon={<Power size={20} />}
            color="red"
        />
        
        <Switch 
            label="Starter" 
            active={controls.starter} 
            onClick={() => toggle('starter')} 
            icon={<RotateCw size={20} />}
            color="green"
        />

        <Switch 
            label="Ignition" 
            active={controls.ignition} 
            onClick={() => toggle('ignition')} 
            icon={<Flame size={20} />}
            color="amber"
        />

        <Switch 
            label="Fuel Pumps" 
            active={controls.fuelPump} 
            onClick={() => toggle('fuelPump')} 
            icon={<Zap size={20} />}
        />

        <Switch 
            label="Bleed Air" 
            active={controls.bleedAir} 
            onClick={() => toggle('bleedAir')} 
            icon={<Wind size={20} />}
        />

      </div>
    </div>
  );
};

const Switch: React.FC<{ 
    label: string, 
    active: boolean, 
    onClick: () => void, 
    icon: React.ReactNode,
    color?: 'cyan' | 'red' | 'green' | 'amber',
    momentary?: boolean 
}> = ({ label, active, onClick, icon, color = 'cyan' }) => {
    
    let activeClass = 'bg-cyan-500 text-black shadow-[0_0_15px_#22d3ee]';
    if (color === 'red') activeClass = 'bg-red-500 text-white shadow-[0_0_15px_#ef4444]';
    if (color === 'green') activeClass = 'bg-emerald-500 text-white shadow-[0_0_15px_#10b981]';
    if (color === 'amber') activeClass = 'bg-amber-500 text-black shadow-[0_0_15px_#fbbf24]';
    
    const inactiveClass = 'bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-500';

    return (
        <div className="flex flex-col items-center gap-2">
            <button 
                onClick={onClick}
                className={`
                    w-full h-16 rounded-lg flex flex-col items-center justify-center transition-all duration-200
                    ${active ? activeClass : inactiveClass}
                    active:scale-95
                `}
            >
                {icon}
                <div className={`w-8 h-1 mt-2 rounded-full ${active ? 'bg-white/50' : 'bg-slate-900'}`}></div>
            </button>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        </div>
    );
};