
import React from 'react';
import { FireSystemState } from '../types';
import { AlertTriangle } from 'lucide-react';

interface FirePanelProps {
  fireSystem: FireSystemState;
  onPullHandle: () => void;
  onDischarge: (bottle: 'bottle1' | 'bottle2') => void;
}

export const FirePanel: React.FC<FirePanelProps> = ({ fireSystem, onPullHandle, onDischarge }) => {
  const isFire = fireSystem.loopA === 'FIRE' || fireSystem.loopB === 'FIRE';

  return (
    <div className="flex-1 bg-neutral-900 border-l border-neutral-800 flex flex-col p-4 select-none font-sans">
      <div className="flex items-center gap-2 mb-8 pb-2 border-b border-neutral-800">
        <AlertTriangle className="text-red-500" size={18} />
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Fire Protection</h3>
      </div>

      <div className="flex-1 flex flex-col items-center gap-8">
        
        {/* Fire Loop Indicators */}
        <div className="flex gap-12 w-full justify-center">
            <LoopIndicator label="LOOP A" status={fireSystem.loopA} />
            <LoopIndicator label="LOOP B" status={fireSystem.loopB} />
        </div>

        {/* A320 Style Fire Push Button */}
        <div className="relative flex flex-col items-center">
            <div className="text-[10px] text-neutral-600 font-mono mb-2 uppercase tracking-widest">Engine 1 Fire Push</div>
            
            <div className="relative w-36 h-36 bg-[#1a1a1a] rounded-sm border border-neutral-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] flex items-center justify-center p-1">
                {/* The Button */}
                <button 
                    onClick={onPullHandle}
                    className={`
                        relative w-full h-full transition-all duration-300 transform border-2
                        flex flex-col items-center justify-center
                        ${fireSystem.handlePulled 
                            ? 'bg-[#2a2a2a] border-neutral-500 scale-105 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] translate-y-[-8px] z-10' 
                            : 'bg-[#151515] border-neutral-800 scale-100 shadow-none'
                        }
                    `}
                >
                    {/* The Red Cover Layer */}
                    <div className={`
                        absolute inset-0 flex flex-col items-center justify-center gap-0.5
                        transition-colors duration-200
                        ${isFire 
                            ? 'bg-red-600 animate-pulse shadow-[inset_0_0_30px_#991b1b]' 
                            : 'bg-transparent'
                        }
                    `}>
                        {/* Upper Legend */}
                        <div className="w-full flex justify-center pt-2">
                             <span className={`text-2xl font-bold tracking-widest ${isFire ? 'text-white drop-shadow-md' : 'text-[#330000]'}`}>ENG 1</span>
                        </div>
                        
                        {/* Lower Legend */}
                        <div className="w-full flex justify-center pb-2">
                             <span className={`text-2xl font-bold tracking-widest ${isFire ? 'text-white drop-shadow-md' : 'text-[#330000]'}`}>FIRE</span>
                        </div>

                        {/* Push Hint */}
                        <div className={`
                            absolute bottom-2 text-[8px] font-mono border px-1 rounded-sm
                            ${isFire ? 'border-white/50 text-white' : 'border-[#330000] text-[#330000]'}
                        `}>
                            PUSH
                        </div>
                    </div>

                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                    
                    {/* Side depth effect when popped out */}
                    {fireSystem.handlePulled && (
                        <>
                            <div className="absolute -right-[2px] top-0 h-full w-[2px] bg-[#0f0f0f] origin-left skew-y-[45deg]"></div>
                            <div className="absolute -bottom-[2px] left-0 w-full h-[2px] bg-[#0f0f0f] origin-top skew-x-[45deg]"></div>
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Agent / Squib Controls */}
        <div className="w-full px-4">
            <div className="flex gap-4 justify-center">
                <SquibButton 
                    label="AGENT 1" 
                    status={fireSystem.bottle1} 
                    armed={fireSystem.handlePulled} 
                    onClick={() => onDischarge('bottle1')} 
                />
                <SquibButton 
                    label="AGENT 2" 
                    status={fireSystem.bottle2} 
                    armed={fireSystem.handlePulled} 
                    onClick={() => onDischarge('bottle2')} 
                />
            </div>
        </div>

      </div>
    </div>
  );
};

const LoopIndicator: React.FC<{ label: string, status: string }> = ({ label, status }) => (
    <div className="flex flex-col items-center gap-1.5">
        <span className="text-[9px] text-neutral-500 font-mono tracking-wider">{label}</span>
        <div className={`w-3 h-3 rounded-full border border-black/50 ${status === 'FIRE' ? 'bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse' : status === 'FAULT' ? 'bg-amber-600' : 'bg-[#0f172a]'}`}></div>
    </div>
);

const SquibButton: React.FC<{ label: string, status: string, armed: boolean, onClick: () => void }> = ({ label, status, armed, onClick }) => {
    const discharged = status === 'DISCHARGED';
    
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-neutral-600 font-mono tracking-wider">{label}</span>
            <button
                onClick={onClick}
                disabled={!armed || discharged}
                className={`
                    w-20 h-20 bg-[#151515] border-2 border-neutral-800 rounded-sm shadow-inner
                    flex flex-col items-center justify-between py-3 px-1 transition-all
                    active:bg-black active:border-neutral-700 active:shadow-none
                `}
            >
                {/* SQUIB Light (White) - Only visible when ARMED and NOT DISCHARGED */}
                <div className={`
                    w-full text-center font-bold tracking-widest text-sm transition-all duration-300
                    ${armed && !discharged 
                        ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' 
                        : 'text-[#333]'}
                `}>
                    SQUIB
                </div>

                {/* DISCH Light (Amber) - Only visible when DISCHARGED */}
                <div className={`
                    w-full text-center font-bold tracking-widest text-sm transition-all duration-300
                    ${discharged 
                        ? 'text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]' 
                        : 'text-[#333]'}
                `}>
                    DISCH
                </div>
            </button>
        </div>
    )
}
