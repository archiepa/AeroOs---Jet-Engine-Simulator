import React, { useState, useEffect } from 'react';
import { useEngineSimulation } from './hooks/useEngineSimulation';
import { CircularGauge, BarGauge, GaugeBug } from './components/Gauge';
import { ControlPanel } from './components/Controls';
import { TelemetryChart } from './components/TelemetryChart';
import { FirePanel } from './components/FirePanel';
import { FailuresMenu } from './components/FailuresMenu';
import { analyzeEngineStatus } from './services/geminiService';
import { EngineTelemetry } from './types';
import { Activity, Radio, Cpu, ShieldCheck, AlertOctagon } from 'lucide-react';

const MAX_HISTORY = 50;

// Bug Configurations
const N1_BUGS: GaugeBug[] = [
    { value: 95, color: '#4ade80' }, // Takeoff Power
    { value: 100, color: '#ef4444' } // Redline
];
const N2_BUGS: GaugeBug[] = [
    { value: 60, color: '#facc15' }, // Idle
    { value: 100, color: '#ef4444' }
];
const EGT_BUGS: GaugeBug[] = [
    { value: 750, color: '#facc15' }, // Start Limit
    { value: 950, color: '#ef4444' } // Max Continuous
];

const App: React.FC = () => {
  const { 
      state, 
      controls, 
      setControls, 
      telemetry, 
      failures,
      setFailures,
      fireSystem,
      dischargeBottle,
      toggleFireHandle
  } = useEngineSimulation();
  
  const [history, setHistory] = useState<EngineTelemetry[]>([]);
  const [aiStatus, setAiStatus] = useState<string>("SYSTEM INITIALIZED. STANDBY FOR TELEMETRY.");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showFailures, setShowFailures] = useState(false);

  // Update history buffer
  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev, telemetry];
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return newHistory;
    });
  }, [telemetry]);

  // AI Analysis Interval
  useEffect(() => {
    const interval = setInterval(async () => {
      if ((state === 'OFF' || state === 'SEIZED') && !failures.engineFire) return;
      
      setIsAiThinking(true);
      const report = await analyzeEngineStatus(telemetry, state, controls);
      setAiStatus(report);
      setIsAiThinking(false);

    }, 8000); // Check every 8 seconds to not spam API

    return () => clearInterval(interval);
  }, [state, controls, failures]); 

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Top Bar / Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-30 relative">
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_#22d3ee]">
                <Cpu className="text-black" size={20} />
            </div>
            <div>
                <h1 className="text-lg font-bold tracking-widest text-white">AeroOS <span className="text-cyan-500 text-xs align-top">v2.5</span></h1>
                <p className="text-[10px] text-slate-500 uppercase font-mono">Turbofan Control Unit • Serial #884-XJ</p>
            </div>
        </div>

        <div className="flex items-center gap-6">
            <button 
                onClick={() => setShowFailures(!showFailures)}
                className={`flex items-center gap-2 px-3 py-1 rounded border transition-all ${failures.engineFire ? 'bg-red-500/20 border-red-500 text-red-200 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'}`}
            >
                <AlertOctagon size={16} />
                <span className="text-xs font-bold uppercase">FAILURES</span>
            </button>

            <div className="h-8 w-px bg-slate-800"></div>

            <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500 font-bold uppercase">System State</span>
                <span className={`text-sm font-mono font-bold ${
                    state === 'RUNNING' ? 'text-green-400' : 
                    state === 'SHUTDOWN' ? 'text-red-400' : 
                    state === 'STARTING' ? 'text-blue-400' : 
                    state === 'FIRE' ? 'text-red-600 animate-pulse' :
                    state === 'SEIZED' ? 'text-slate-500 bg-slate-900 px-2 border border-slate-700' : 
                    'text-amber-400'
                }`}>
                    {state}
                </span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2">
                <Radio className={`${isAiThinking ? 'animate-pulse text-cyan-400' : 'text-slate-600'}`} size={18} />
                <span className="text-xs font-mono text-slate-400">AI LINK {isAiThinking ? 'ACTIVE' : 'IDLE'}</span>
            </div>
        </div>

        {/* Failures Overlay */}
        <FailuresMenu 
            isOpen={showFailures} 
            onClose={() => setShowFailures(false)} 
            failures={failures}
            setFailures={setFailures}
        />
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left: Primary Flight Display (Gauges) */}
        <div className="w-1/3 min-w-[320px] bg-slate-900/50 p-6 flex flex-col gap-6 border-r border-slate-800 overflow-y-auto custom-scrollbar">
            <div className="mb-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={14} /> Primary Engine Indication
                </h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex justify-center">
                        <CircularGauge 
                            label="N1 Fan Speed" 
                            value={telemetry.n1} 
                            min={0} max={110} 
                            unit="%" 
                            size="lg"
                            warningHigh={98}
                            criticalHigh={102}
                            bugs={N1_BUGS}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <CircularGauge 
                            label="EGT" 
                            value={telemetry.egt} 
                            min={0} max={1000} 
                            unit="°C" 
                            size="md"
                            warningHigh={850}
                            criticalHigh={950}
                            bugs={EGT_BUGS}
                        />
                        <CircularGauge 
                            label="N2 Core" 
                            value={telemetry.n2} 
                            min={0} max={110} 
                            unit="%" 
                            size="md"
                            warningHigh={98}
                            criticalHigh={102}
                            bugs={N2_BUGS}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
                 <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Secondary Indication</h2>
                 <BarGauge label="Fuel Flow" value={telemetry.ff} min={0} max={5000} unit="kg/h" />
                 <BarGauge label="Oil Pressure" value={telemetry.oilP} min={0} max={100} unit="psi" warningHigh={90} criticalHigh={5} />
                 <BarGauge label="Oil Temp" value={telemetry.oilT} min={0} max={150} unit="°C" warningHigh={130} />
                 <BarGauge label="Vibration" value={telemetry.vib} min={0} max={5} unit="ips" warningHigh={3} criticalHigh={4} />
            </div>
        </div>

        {/* Center: Analytics & Graphs */}
        <div className="flex-1 bg-slate-950 p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
                <TelemetryChart 
                  data={history} 
                  dataKey="n1" 
                  color="#22d3ee" 
                  label="N1 Performance" 
                  min={0}
                  max={110}
                />
                <TelemetryChart 
                  data={history} 
                  dataKey="egt" 
                  color="#f59e0b" 
                  label="Exhaust Gas Temp" 
                  min={0}
                  max={1000}
                />
                <TelemetryChart 
                  data={history} 
                  dataKey="ff" 
                  color="#10b981" 
                  label="Fuel Consumption" 
                  min={0}
                  max={6000}
                />
                <TelemetryChart 
                  data={history} 
                  dataKey="vib" 
                  color="#a855f7" 
                  label="Vibration Analysis" 
                  min={0}
                  max={5}
                />
            </div>
        </div>

        {/* Right: AI Copilot & Fire System */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
            {/* AI Status Panel */}
            <div className="p-4 border-b border-slate-800 bg-slate-800/30">
                <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="text-cyan-400" size={16} />
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">EMS AI Diagnostic</span>
                </div>
                <div className="bg-slate-950 rounded p-3 border border-slate-700 font-mono text-xs leading-relaxed text-slate-300 shadow-inner min-h-[100px]">
                    {isAiThinking ? (
                        <span className="animate-pulse text-cyan-500">Processing telemetry stream...</span>
                    ) : (
                        aiStatus
                    )}
                </div>
            </div>

            {/* Fire Management System (Replaces Event Log) */}
            <FirePanel 
                fireSystem={fireSystem} 
                onPullHandle={toggleFireHandle}
                onDischarge={dischargeBottle}
            />
        </div>

      </main>

      {/* Bottom: Controls */}
      <ControlPanel controls={controls} setControls={setControls} />
      
    </div>
  );
};

export default App;