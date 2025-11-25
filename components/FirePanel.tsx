import React from 'react';
import { FireSystemState } from '../types';
import { AlertTriangle, Power } from 'lucide-react';

interface FirePanelProps {
  fireSystem: FireSystemState;
  onPullHandle: () => void;
  onDischarge: (bottle: 'bottle1' | 'bottle2') => void;
}

export const FirePanel: React.FC<FirePanelProps> = ({ fireSystem, onPullHandle, onDischarge }) => {
  const isFire = fireSystem.loopA === 'FIRE' || fireSystem.loopB === 'FIRE';

  return (
    <div className="flex-1 bg-neutral-900 border-l border-neutral-800 flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-800">
        <AlertTriangle className="text-red-500" size={18} />
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Fire Protection</h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between py-2">
        
        {/* Fire Loop Indicators */}
        <div className="flex gap-4 w-full justify-center">
            <LoopIndicator label="LOOP A" status={fireSystem.loopA} />
            <LoopIndicator label="LOOP B" status={fireSystem.loopB} />
        </div>

        {/* Master Warning Light */}
        <div className={`
            w-full h-16 rounded border-2 flex items-center justify-center transition-all duration-200
            ${isFire ? 'bg-red-600 border-red-500 animate-pulse shadow-[0_0_30px_#dc2626]' : 'bg-neutral-950 border-neutral-800'}
        `}>
            <span className={`font-black text-2xl tracking-[0.2em] ${isFire ? 'text-white' : 'text-neutral-800'}`}>
                ENGINE FIRE
            </span>
        </div>

        {/* Fire Handle */}
        <div className="relative w-full h-48 bg-neutral-800/50 rounded-lg border border-neutral-700 p-4 flex flex-col items-center justify-center">
            <div className="absolute inset-0 pattern-grid opacity-10"></div>
            
            <span className="absolute top-2 left-0 w-full text-center text-[10px] text-neutral-500 font-mono">EMERGENCY SHUTOFF & ARM</span>
            
            <button 
                onClick={onPullHandle}
                className={`
                    relative w-32 h-32 rounded-lg border-4 shadow-xl transition-all duration-300 transform flex flex-col items-center justify-center gap-2 group
                    ${fireSystem.handlePulled 
                        ? 'bg-red-600 border-red-400 translate-y-[-20px] shadow-[0_10px_0_#7f1d1d]' 
                        : 'bg-neutral-800 border-neutral-600 translate-y-0 shadow-[0_2px_0_#404040]'}
                `}
            >
                {/* T-Handle Graphic */}
                <div className={`w-24 h-4 rounded-full ${fireSystem.handlePulled ? 'bg-red-300' : 'bg-neutral-400'} shadow-sm`}></div>
                <div className={`w-6 h-12 rounded ${fireSystem.handlePulled ? 'bg-red-300' : 'bg-neutral-400'} shadow-sm`}></div>
                
                {isFire && (
                    <div className="absolute inset-0 bg-red-500/50 animate-pulse rounded"></div>
                )}
            </button>
            
            <div className="mt-4 text-xs font-bold text-neutral-400">
                {fireSystem.handlePulled ? 'ARMED' : 'NORMAL'}
            </div>
        </div>

        {/* Squib/Bottle Controls */}
        <div className="w-full grid grid-cols-2 gap-4">
            <SquibButton 
                label="BOTTLE 1" 
                status={fireSystem.bottle1} 
                armed={fireSystem.handlePulled} 
                onClick={() => onDischarge('bottle1')} 
            />
            <SquibButton 
                label="BOTTLE 2" 
                status={fireSystem.bottle2} 
                armed={fireSystem.handlePulled} 
                onClick={() => onDischarge('bottle2')} 
            />
        </div>

      </div>
    </div>
  );
};

const LoopIndicator: React.FC<{ label: string, status: string }> = ({ label, status }) => (
    <div className="flex flex-col items-center gap-1">
        <div className={`w-3 h-3 rounded-full ${status === 'FIRE' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : status === 'FAULT' ? 'bg-amber-500' : 'bg-green-900'}`}></div>
        <span className="text-[10px] text-neutral-500 font-mono">{label}</span>
    </div>
);

const SquibButton: React.FC<{ label: string, status: string, armed: boolean, onClick: () => void }> = ({ label, status, armed, onClick }) => {
    const discharged = status === 'DISCHARGED';
    
    return (
        <button
            onClick={onClick}
            disabled={!armed || discharged}
            className={`
                h-16 rounded border flex flex-col items-center justify-center transition-all relative overflow-hidden
                ${discharged 
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed' 
                    : armed 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                        : 'bg-neutral-900 border-neutral-700 text-neutral-600 cursor-not-allowed opacity-50'}
            `}
        >
            <span className="text-xs font-bold tracking-widest">{label}</span>
            <span className="text-[10px] mt-1 font-mono">
                {discharged ? 'EMPTY' : 'DISCH'}
            </span>
            {discharged && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-px bg-neutral-700 rotate-45"></div>
                    <div className="w-full h-px bg-neutral-700 -rotate-45"></div>
                </div>
            )}
        </button>
    )
}