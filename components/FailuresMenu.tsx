
import React, { useState, useEffect } from 'react';
import { FailureState, FailureConfig } from '../types';
import { X, ZapOff, Clock, Keyboard, AlertTriangle } from 'lucide-react';

interface FailuresMenuProps {
  onClose: () => void;
  failures: FailureState;
  failureConfigs: FailureConfig[];
  toggleFailure: (id: keyof FailureState) => void;
  updateFailureConfig: (id: string, updates: Partial<FailureConfig>) => void;
}

export const FailuresMenu: React.FC<FailuresMenuProps> = ({ 
    onClose, 
    failures, 
    failureConfigs,
    toggleFailure,
    updateFailureConfig 
}) => {
  
  return (
    <div className="absolute top-16 right-6 w-[450px] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
      <div className="p-3 bg-red-900/20 border-b border-slate-700 flex justify-between items-center shrink-0">
        <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
            <ZapOff size={16} /> Failure Injection Panel
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
        </button>
      </div>
      
      <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            <div className="col-span-5">Failure Mode</div>
            <div className="col-span-3 text-center">Timer (s)</div>
            <div className="col-span-3 text-center">Keybind</div>
            <div className="col-span-1"></div>
        </div>

        {failureConfigs.map(config => (
            <FailureRow 
                key={config.id}
                config={config}
                isActive={failures[config.id]}
                onToggle={() => toggleFailure(config.id)}
                onUpdate={updateFailureConfig}
            />
        ))}
      </div>
      
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center gap-2">
          <AlertTriangle size={12} className="text-amber-500" />
          <span>WARNING: FAILURES MAY CAUSE PERMANENT ENGINE DAMAGE.</span>
      </div>
    </div>
  );
};

interface FailureRowProps {
    config: FailureConfig;
    isActive: boolean;
    onToggle: () => void;
    onUpdate: (id: string, updates: Partial<FailureConfig>) => void;
}

const FailureRow: React.FC<FailureRowProps> = ({ config, isActive, onToggle, onUpdate }) => {
    const [recording, setRecording] = useState(false);

    useEffect(() => {
        if (!recording) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            // Allow Escape to clear
            if (e.key === 'Escape') {
                onUpdate(config.id, { shortcut: '' });
            } else {
                // Use e.code or e.key. e.key is better for display (e.g. "a", "A", "Enter")
                // Restrict to single characters or basic keys if needed
                let key = e.key;
                if (key === ' ') key = 'Space';
                onUpdate(config.id, { shortcut: key });
            }
            setRecording(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [recording, config.id, onUpdate]);

    return (
        <div className={`grid grid-cols-12 gap-3 items-center p-3 rounded-lg border transition-all ${
            isActive 
                ? 'bg-red-500/10 border-red-500/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]' 
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
        }`}>
            {/* Label */}
            <div className="col-span-5 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]' : 'bg-slate-600'}`}></div>
                <span className={`text-sm font-medium ${isActive ? 'text-red-200' : 'text-slate-300'}`}>{config.label}</span>
            </div>

            {/* Delay Input */}
            <div className="col-span-3 flex items-center justify-center">
                <div className="relative flex items-center">
                    <Clock size={12} className="absolute left-2 text-slate-500" />
                    <input 
                        type="number" 
                        min="0"
                        max="300"
                        value={config.delay}
                        onChange={(e) => onUpdate(config.id, { delay: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 pl-6 text-center text-xs font-mono text-cyan-400 focus:border-cyan-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Shortcut Input */}
            <div className="col-span-3 flex justify-center">
                <button 
                    onClick={() => setRecording(true)}
                    className={`
                        h-7 min-w-[60px] px-2 rounded border text-xs font-mono flex items-center justify-center gap-1 transition-all
                        ${recording 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse' 
                            : config.shortcut 
                                ? 'bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-500'
                                : 'bg-slate-900 border-dashed border-slate-700 text-slate-600 hover:text-slate-400'}
                    `}
                >
                    {recording ? (
                        <span>PRESS KEY</span>
                    ) : config.shortcut ? (
                        <>
                            <Keyboard size={10} className="opacity-50" />
                            <span className="font-bold">{config.shortcut.toUpperCase()}</span>
                        </>
                    ) : (
                        <span>NONE</span>
                    )}
                </button>
            </div>

            {/* Toggle Button */}
            <div className="col-span-1 flex justify-end">
                <button 
                    onClick={onToggle}
                    className={`
                        w-10 h-6 rounded-full p-1 transition-colors relative
                        ${isActive ? 'bg-red-500' : 'bg-slate-700'}
                    `}
                >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
            </div>
        </div>
    );
};
