import React from 'react';
import { FailureState } from '../types';
import { X, Flame, Droplets, Activity, ZapOff } from 'lucide-react';

interface FailuresMenuProps {
  isOpen: boolean;
  onClose: () => void;
  failures: FailureState;
  setFailures: React.Dispatch<React.SetStateAction<FailureState>>;
}

export const FailuresMenu: React.FC<FailuresMenuProps> = ({ isOpen, onClose, failures, setFailures }) => {
  if (!isOpen) return null;

  const toggle = (key: keyof FailureState) => {
    setFailures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="absolute top-16 right-6 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
      <div className="p-3 bg-red-900/20 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
            <ZapOff size={16} /> Failure Injection
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
        </button>
      </div>
      
      <div className="p-2 space-y-1">
        <FailureItem 
            label="Engine Fire" 
            active={failures.engineFire} 
            icon={<Flame size={16} className={failures.engineFire ? 'text-red-500' : 'text-slate-500'} />}
            onClick={() => toggle('engineFire')}
        />
        <FailureItem 
            label="Oil Pump Fail" 
            active={failures.oilPumpFailure} 
            icon={<Droplets size={16} className={failures.oilPumpFailure ? 'text-amber-500' : 'text-slate-500'} />}
            onClick={() => toggle('oilPumpFailure')}
        />
        <FailureItem 
            label="Fuel Pump Fail" 
            active={failures.fuelPumpFailure} 
            icon={<ZapOff size={16} className={failures.fuelPumpFailure ? 'text-amber-500' : 'text-slate-500'} />}
            onClick={() => toggle('fuelPumpFailure')}
        />
        <FailureItem 
            label="Vib Sensor Fault" 
            active={failures.vibSensorFault} 
            icon={<Activity size={16} className={failures.vibSensorFault ? 'text-amber-500' : 'text-slate-500'} />}
            onClick={() => toggle('vibSensorFault')}
        />
      </div>
    </div>
  );
};

const FailureItem: React.FC<{ label: string, active: boolean, icon: React.ReactNode, onClick: () => void }> = ({ label, active, icon, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between p-3 rounded transition-colors ${active ? 'bg-red-500/10 border border-red-500/30' : 'hover:bg-slate-800 border border-transparent'}`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className={`text-sm font-medium ${active ? 'text-red-200' : 'text-slate-300'}`}>{label}</span>
        </div>
        <div className={`w-3 h-3 rounded-full border ${active ? 'bg-red-500 border-red-400 shadow-[0_0_8px_#ef4444]' : 'bg-slate-800 border-slate-600'}`}></div>
    </button>
);