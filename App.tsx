
import React, { useState, useEffect } from 'react';
import { useEngineSimulation } from './hooks/useEngineSimulation';
import { CircularGauge, GaugeBug } from './components/Gauge';
import { ControlPanel } from './components/Controls';
import { TelemetryChart, ChartSeries, ChartAxis } from './components/TelemetryChart';
import { FirePanel } from './components/FirePanel';
import { FailuresMenu } from './components/FailuresMenu';
import { EngineSchematic } from './components/EngineSchematic';
import { BleedPanel } from './components/BleedPanel';
import { EngineTelemetry } from './types';
import { Activity, Cpu, AlertOctagon } from 'lucide-react';

const MAX_HISTORY = 100;

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

// Chart Configuration
const CHART_SERIES: ChartSeries[] = [
    { dataKey: 'n1', name: 'N1 Fan', color: '#22d3ee', unit: '%', yAxisId: 'pct' },
    { dataKey: 'n2', name: 'N2 Core', color: '#3b82f6', unit: '%', yAxisId: 'pct' },
    { dataKey: 'egt', name: 'EGT', color: '#f59e0b', unit: '°C', yAxisId: 'temp' },
    { dataKey: 'ff', name: 'Fuel Flow', color: '#10b981', unit: 'kg/h', yAxisId: 'flow' },
    { dataKey: 'vib', name: 'Vib', color: '#a855f7', unit: 'ips', yAxisId: 'vib' }
];

const CHART_AXES: ChartAxis[] = [
    { id: 'pct', domain: [0, 110], orientation: 'left' },
    { id: 'temp', domain: [0, 1200], orientation: 'right' },
    { id: 'flow', domain: [0, 6000], orientation: 'right', hide: true }, // Hidden axis for scaling
    { id: 'vib', domain: [0, 10], orientation: 'left', hide: true }      // Hidden axis for scaling
];

const App: React.FC = () => {
  const { 
      state, 
      controls, 
      setControls, 
      telemetry, 
      failures,
      failureConfigs,
      toggleFailure,
      updateFailureConfig,
      fireSystem,
      dischargeBottle,
      toggleFireHandle
  } = useEngineSimulation();
  
  const [history, setHistory] = useState<EngineTelemetry[]>([]);
  const [showFailures, setShowFailures] = useState(false);

  // Update history buffer
  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev, telemetry];
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return newHistory;
    });
  }, [telemetry]);

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
        </div>

        {/* Failures Overlay - Conditionally Rendered */}
        {showFailures && (
            <FailuresMenu 
                onClose={() => setShowFailures(false)} 
                failures={failures}
                failureConfigs={failureConfigs}
                toggleFailure={toggleFailure}
                updateFailureConfig={updateFailureConfig}
            />
        )}
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left: Primary Flight Display (Gauges) */}
        <div className="w-1/3 min-w-[320px] bg-slate-900/50 p-6 flex flex-col gap-6 border-r border-slate-800 overflow-y-auto custom-scrollbar">
            <div className="mb-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={14} /> Primary Engine Indication
                </h2>
                <div className="flex flex-col gap-6">
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
                 <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 border-t border-slate-800 pt-4">Secondary Indication</h2>
                 
                 {/* Secondary Gauge Grid */}
                 <div className="grid grid-cols-2 gap-4">
                    <CircularGauge 
                        label="Fuel Flow" 
                        value={telemetry.ff} 
                        min={0} max={5000} 
                        unit="kg/h" 
                        size="sm"
                    />
                    <CircularGauge 
                        label="Vibration" 
                        value={telemetry.vib} 
                        min={0} max={5} 
                        unit="ips" 
                        size="sm"
                        warningHigh={3} 
                        criticalHigh={4} 
                    />
                    <CircularGauge 
                        label="Oil Press" 
                        value={telemetry.oilP} 
                        min={0} max={100} 
                        unit="psi" 
                        size="sm"
                        criticalLow={10}
                        warningLow={25}
                        warningHigh={90}
                    />
                    <CircularGauge 
                        label="Oil Temp" 
                        value={telemetry.oilT} 
                        min={0} max={150} 
                        unit="°C" 
                        size="sm"
                        warningHigh={130} 
                    />
                 </div>
            </div>
        </div>

        {/* Center: Analytics & Charts */}
        <div className="flex-1 bg-slate-950 p-6 flex flex-col gap-6 overflow-hidden">
            <div className="flex-1 min-h-0">
                <TelemetryChart 
                    data={history}
                    series={CHART_SERIES}
                    axes={CHART_AXES}
                />
            </div>
            
            <div className="shrink-0">
                 <EngineSchematic 
                    n1={telemetry.n1}
                    n2={telemetry.n2}
                    egt={telemetry.egt}
                    state={state}
                    failures={failures}
                 />
            </div>
        </div>

        {/* Right: Systems (Pneumatics & Fire) */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
            {/* Bleed Air & Packs Panel */}
            <BleedPanel 
                telemetry={telemetry}
                controls={controls}
                setControls={setControls}
            />

            {/* Fire Management System */}
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
