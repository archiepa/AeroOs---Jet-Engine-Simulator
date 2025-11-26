
import React, { useState } from 'react';
import { FireSystemState } from '../types';

interface FirePanelProps {
  fireSystem: FireSystemState;
  onPullHandle: () => void;
  onDischarge: (bottle: 'bottle1' | 'bottle2') => void;
}

const ScrewHead: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`w-2 h-2 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center shadow-sm ${className}`}>
        <div className="w-full h-[1px] bg-slate-900 rotate-45"></div>
        <div className="absolute w-full h-[1px] bg-slate-900 -rotate-45"></div>
    </div>
);

export const FirePanel: React.FC<FirePanelProps> = ({ fireSystem, onPullHandle, onDischarge }) => {
  const [isTesting, setIsTesting] = useState(false);
  const isFire = fireSystem.loopA === 'FIRE' || fireSystem.loopB === 'FIRE';

  const handleTestMouseDown = () => setIsTesting(true);
  const handleTestMouseUp = () => setIsTesting(false);

  return (
    <div className="flex-1 bg-slate-700 border-t-2 border-l-2 border-slate-600 border-b-4 border-r-4 border-black/50 p-4 select-none font-sans flex flex-col items-center justify-center relative">
        <ScrewHead className="absolute top-2 left-2" />
        <ScrewHead className="absolute top-2 right-2" />
        <ScrewHead className="absolute bottom-2 left-2" />
        <ScrewHead className="absolute bottom-2 right-2" />
        
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            <span className="font-bold text-slate-400 text-sm tracking-[0.2em]">F</span>
            <span className="font-bold text-slate-400 text-sm tracking-[0.2em]">I</span>
            <span className="font-bold text-slate-400 text-sm tracking-[0.2em]">R</span>
            <span className="font-bold text-slate-400 text-sm tracking-[0.2em]">E</span>
        </div>
        
        {/* Main Vertical Group */}
        <div className="flex flex-col items-center justify-center gap-6 w-full">
            
            {/* Top Group: Handle */}
            <div className="flex flex-col items-center gap-4">
                <span className="text-2xl font-black text-slate-300 tracking-widest">ENG 1</span>

                {/* Guarded Fire Handle */}
                <div className="relative">
                    <button 
                        onClick={onPullHandle}
                        className={`
                            relative w-32 h-20 rounded-sm border-2 transition-all duration-200
                            flex items-center justify-center
                            ${(isFire || isTesting)
                                ? 'bg-red-600 border-red-400 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.7),inset_0_0_10px_rgba(255,150,150,0.5)]' 
                                : 'bg-red-900 border-black/50 shadow-[inset_0_2px_4px_black]'
                            }
                            ${fireSystem.handlePulled ? 'translate-y-2' : ''}
                        `}
                    >
                         <span className={`
                            font-bold text-2xl tracking-widest transition-all
                            ${(isFire || isTesting)
                                ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,1)]' 
                                : 'text-red-400/50'}
                         `}>
                             FIRE
                         </span>
                    </button>
                    {/* Guard */}
                    <div className={`
                        absolute -bottom-1 left-1/2 -translate-x-1/2 w-36 h-20 
                        border-4 border-red-500 bg-red-500/10 rounded-sm
                        transition-transform duration-300 origin-top
                        pointer-events-none
                        ${fireSystem.handlePulled ? 'rotate-x-[-120deg] opacity-0' : 'rotate-x-0 opacity-100'}
                    `}>
                        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-1 bg-red-400 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Group: Agents and Test */}
            <div className="flex flex-col items-center gap-4">
                {/* Agent Buttons */}
                <div className="flex items-center gap-4">
                     <AgentButton 
                        label="AGENT 1" 
                        status={fireSystem.bottle1} 
                        armed={fireSystem.handlePulled} 
                        onClick={() => onDischarge('bottle1')} 
                        isTesting={isTesting}
                    />
                    <AgentButton 
                        label="AGENT 2" 
                        status={fireSystem.bottle2} 
                        armed={fireSystem.handlePulled} 
                        onClick={() => onDischarge('bottle2')} 
                        isTesting={isTesting}
                    />
                </div>

                {/* Test Switch */}
                <div className="flex flex-col items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full border border-black/50 transition-colors ${isTesting ? 'bg-red-500' : 'bg-red-900'}`}></div>
                    <button 
                        className="w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-600 active:bg-slate-800 transition-transform active:scale-90"
                        onMouseDown={handleTestMouseDown}
                        onMouseUp={handleTestMouseUp}
                        onMouseLeave={handleTestMouseUp}
                    ></button>
                    <span className="text-[10px] font-bold text-slate-400">TEST</span>
                </div>
            </div>
        </div>
    </div>
  );
};


const AgentButton: React.FC<{ 
    label: string, 
    status: string, 
    armed: boolean, 
    onClick: () => void,
    isTesting: boolean 
}> = ({ label, status, armed, onClick, isTesting }) => {
    const discharged = status === 'DISCHARGED';
    
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400">{label}</span>
            <button
                onClick={onClick}
                disabled={!armed || discharged}
                className={`
                    w-20 h-20 bg-slate-800 border-2 border-black/50 rounded-sm
                    flex flex-col items-center justify-between p-1 transition-all
                    shadow-[inset_0_2px_4px_black]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    active:bg-slate-900 active:shadow-none
                `}
            >
                {/* SQUIB Light (White) */}
                <div className="w-full h-1/2 bg-slate-900/50 rounded-sm flex items-center justify-center">
                    <span className={`
                        font-bold tracking-widest text-sm transition-all duration-300
                        ${(armed && !discharged) || isTesting
                            ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' 
                            : 'text-slate-600'}
                    `}>
                        SQUIB
                    </span>
                </div>

                {/* DISCH Light (Amber) */}
                <div className="w-full h-1/2 bg-slate-900/50 rounded-sm flex items-center justify-center">
                    <span className={`
                        font-bold tracking-widest text-sm transition-all duration-300
                        ${discharged || isTesting
                            ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]' 
                            : 'text-slate-600'}
                    `}>
                        DISCH
                    </span>
                </div>
            </button>
        </div>
    )
}
