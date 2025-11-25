
import { useState, useEffect, useRef } from 'react';
import { EngineTelemetry, EngineControls, EngineState, FailureState, FireSystemState, FailureConfig } from '../types';

const SIM_RATE = 20; // ms

const DEFAULT_FAILURES: FailureConfig[] = [
    { id: 'engineFire', label: 'Engine Fire', delay: 0, shortcut: '' },
    { id: 'oilPumpFailure', label: 'Oil Pump Fail', delay: 0, shortcut: '' },
    { id: 'fuelPumpFailure', label: 'Fuel Pump Fail', delay: 0, shortcut: '' },
    { id: 'vibSensorFault', label: 'Vib Sensor Fault', delay: 0, shortcut: '' }
];

export const useEngineSimulation = () => {
  const [state, setState] = useState<EngineState>(EngineState.OFF);
  
  const [controls, setControls] = useState<EngineControls>({
    masterSwitch: false,
    fuelPump: false,
    ignition: false,
    starter: false,
    throttle: 0,
    bleedAir: true,
  });

  const [failures, setFailures] = useState<FailureState>({
    engineFire: false,
    oilPumpFailure: false,
    fuelPumpFailure: false,
    vibSensorFault: false
  });

  const [failureConfigs, setFailureConfigs] = useState<FailureConfig[]>(DEFAULT_FAILURES);
  // Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to support environments without Node types
  const pendingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const [fireSystem, setFireSystem] = useState<FireSystemState>({
    loopA: 'NORMAL',
    loopB: 'NORMAL',
    handlePulled: false,
    bottle1: 'CHARGED',
    bottle2: 'CHARGED'
  });

  const [telemetry, setTelemetry] = useState<EngineTelemetry>({
    n1: 0,
    n2: 0,
    egt: 20,
    ff: 0,
    oilP: 0,
    oilT: 20,
    vib: 0,
    timestamp: Date.now(),
  });

  // Use refs for physics loop to avoid closure staleness
  const physicsState = useRef({
    n1: 0,
    n2: 0,
    egt: 20,
    oilT: 20,
    oilFailureTimer: 0
  });

  // Handle Failure Toggling with Delay
  const toggleFailure = (id: keyof FailureState) => {
      const config = failureConfigs.find(c => c.id === id);
      const isActive = failures[id];

      // Clear any pending timeout for this failure
      if (pendingTimeouts.current.has(id)) {
          clearTimeout(pendingTimeouts.current.get(id)!);
          pendingTimeouts.current.delete(id);
      }

      if (isActive) {
          // If active, turn off immediately
          setFailures(prev => ({ ...prev, [id]: false }));
      } else {
          // If inactive, check for delay
          if (config && config.delay > 0) {
              const timeout = setTimeout(() => {
                  setFailures(prev => ({ ...prev, [id]: true }));
                  pendingTimeouts.current.delete(id);
              }, config.delay * 1000);
              pendingTimeouts.current.set(id, timeout);
          } else {
              setFailures(prev => ({ ...prev, [id]: true }));
          }
      }
  };

  const updateFailureConfig = (id: string, updates: Partial<FailureConfig>) => {
      setFailureConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Keyboard Shortcuts
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          // Ignore if typing in an input
          if ((e.target as HTMLElement).tagName === 'INPUT') return;

          const config = failureConfigs.find(c => c.shortcut.toLowerCase() === e.key.toLowerCase());
          if (config) {
              toggleFailure(config.id);
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [failureConfigs, failures]); // Dependencies ensure we have latest state if needed, though toggleFailure uses function updates

  // Handle Fire Suppression Actions
  const dischargeBottle = (bottle: 'bottle1' | 'bottle2') => {
      setFireSystem(prev => {
          if (prev[bottle] === 'DISCHARGED') return prev;
          
          // Extinguish fire probability
          if (failures.engineFire) {
             // 90% chance to extinguish
             if (Math.random() > 0.1) {
                 setTimeout(() => {
                     setFailures(f => ({ ...f, engineFire: false }));
                 }, 1000);
             }
          }

          return { ...prev, [bottle]: 'DISCHARGED' };
      });
  };

  const toggleFireHandle = () => {
      setFireSystem(prev => ({ ...prev, handlePulled: !prev.handlePulled }));
  };

  useEffect(() => {
    // Sync Fire Loops with actual Fire Failure
    setFireSystem(prev => ({
        ...prev,
        loopA: failures.engineFire ? 'FIRE' : 'NORMAL',
        loopB: failures.engineFire ? 'FIRE' : 'NORMAL'
    }));
  }, [failures.engineFire]);

  useEffect(() => {
    const timer = setInterval(() => {
      const ps = physicsState.current;
      let targetN2 = 0;
      
      const powerAvailable = controls.masterSwitch;
      // Fire Handle cuts fuel physically
      const fuelFlowing = controls.fuelPump && powerAvailable && !failures.fuelPumpFailure && !fireSystem.handlePulled;
      const ignitionActive = controls.ignition && powerAvailable;
      const starterActive = controls.starter && powerAvailable;

      // --- Failure Cascades ---
      
      // Oil Pump Failure Logic
      if (failures.oilPumpFailure && state !== EngineState.OFF && state !== EngineState.SEIZED && ps.n2 > 5) {
          ps.oilFailureTimer += SIM_RATE;

          // Immediate effect: Fire caused by oil leak/overheat
          if (!failures.engineFire) {
              setFailures(f => ({ ...f, engineFire: true }));
          }

          // 5 Second limit: Catastrophic Seizure
          if (ps.oilFailureTimer > 5000) {
              setState(EngineState.SEIZED);
          }
      } else if (!failures.oilPumpFailure) {
          ps.oilFailureTimer = 0;
      }

      // --- State Machine ---
      switch (state) {
        case EngineState.OFF:
          // Starter can drive N2 up to 25% (Max Motoring)
          if (starterActive) {
            targetN2 = 25;
            // Light-off criteria: >15% N2, Fuel, Ignition
            if (fuelFlowing && ignitionActive && ps.n2 > 15) {
              setState(EngineState.STARTING);
            }
          } else {
            targetN2 = 0;
          }
          break;

        case EngineState.STARTING:
          // Engine accelerating to IDLE
          targetN2 = 58; // Self-sustaining target
          
          // Starter assist helps it get there faster
          if (starterActive) targetN2 = 60;

          // If fuel is cut during start, abort
          if (!fuelFlowing) {
             setState(EngineState.SHUTDOWN);
          } else if (ps.n2 > 55) {
             // Stable idle
             setState(EngineState.IDLE);
          }
          break;

        case EngineState.IDLE:
        case EngineState.RUNNING:
        case EngineState.FIRE:
          if (!fuelFlowing) {
            setState(EngineState.SHUTDOWN);
          } else {
            // Idle ~60%, Max ~100%
            // Map throttle 0-100 to N2 60-100
            const throttleTarget = 60 + (controls.throttle / 100) * 40;
            targetN2 = Math.max(60, throttleTarget);
            
            // Check if specifically fire state needs to persist or if it's just a running state with fire
            if (failures.engineFire) {
                setState(EngineState.FIRE);
            } else if (controls.throttle > 5) {
                setState(EngineState.RUNNING);
            } else {
                setState(EngineState.IDLE);
            }
          }
          break;

        case EngineState.SHUTDOWN:
          targetN2 = 0;
          if (starterActive) targetN2 = 25; // Can still crank
          if (ps.n2 < 2 && !starterActive) setState(EngineState.OFF);
          
          // Relight logic (Hot start possibility if fuel reintroduced quickly)
          if (fuelFlowing && ignitionActive && ps.n2 > 15) {
             setState(EngineState.STARTING);
          }
          break;
        
        case EngineState.SEIZED:
          targetN2 = 0;
          // Engine is destroyed. Cannot restart.
          break;
      }

      // --- Physics Integration ---
      
      // N2 (Core Speed) Inertia
      const n2Delta = targetN2 - ps.n2;
      let accelRate = 0.1; // Default inertia
      
      if (starterActive && state === EngineState.OFF) accelRate = 0.05; // Starter torque is lower
      if (state === EngineState.STARTING) accelRate = 0.08; // Combustion torque
      if (state === EngineState.RUNNING) accelRate = 0.2; // High power response
      
      // Spool down is slower
      if (n2Delta < 0) accelRate = 0.05;
      
      // Instant stop for seizure
      if (state === EngineState.SEIZED) accelRate = 1.0; 

      ps.n2 += n2Delta * accelRate;

      // N1 (Fan Speed) - Driven by N2 airflow
      let targetN1 = ps.n2 > 20 ? (ps.n2 - 10) * 1.05 : 0; // Simplified bypass ratio curve
      // Cap N1 relative to N2 physics
      let limitedN1 = Math.min(targetN1, ps.n2 * 1.1); 
      
      if (state === EngineState.SEIZED) limitedN1 = 0; // Fan stops too

      ps.n1 += (limitedN1 - ps.n1) * 0.08;

      // EGT (Exhaust Gas Temp)
      let targetEgt = 20; // Ambient
      
      if (state !== EngineState.OFF && state !== EngineState.SEIZED && fuelFlowing) {
          // Base operating temp
          targetEgt = 400 + (ps.n2 - 60) * 12;
          
          // Start spike
          if (state === EngineState.STARTING) {
             // Peak EGT during start before airflow stabilizes
             if (ps.n2 < 40) targetEgt = 750;
             else targetEgt = 550;
          }
          
          // Overspeed / Over-fueling heat
          if (controls.throttle > 95) targetEgt += 50;
      }

      // FIRE LOGIC
      if (failures.engineFire) {
          targetEgt = 1250 + (Math.random() * 50); // Massive uncontrollable fire
      }
      
      // Cooling factor
      if (!fuelFlowing && !failures.engineFire) {
         targetEgt = 20 + (ps.n2 * 2); // Friction heat/residual
      }

      // Seized engine stays hot for a bit but no combustion
      if (state === EngineState.SEIZED) {
          targetEgt = failures.engineFire ? 1200 : 200; 
      }

      ps.egt += (targetEgt - ps.egt) * 0.04;

      // Fuel Flow
      let ff = 0;
      if (fuelFlowing && state !== EngineState.SEIZED) {
         // Fuel flow correlates strongly with N2
         ff = 300 + Math.pow((ps.n2 - 15) / 85, 2.5) * 4500;
         if (state === EngineState.STARTING) ff = 400; // Starting flow
      }

      // Oil Pressure
      let targetOilP = Math.min(90, ps.n2 * 1.1);
      if (failures.oilPumpFailure || state === EngineState.SEIZED) targetOilP = 0; // Failure
      
      const oilP = targetOilP + (Math.random() * 2 - 1); 

      // Oil Temp
      let targetOilT = 20 + ps.n2 * 0.9;
      if (failures.engineFire) targetOilT += 50; // Fire heats everything
      if (state === EngineState.SEIZED) targetOilT = 200; // Friction spike then cool
      
      ps.oilT += (targetOilT - ps.oilT) * 0.005; // Very slow thermal mass

      // Vibration
      // Vibration peaks at specific resonance frequencies usually, here linear + noise
      let baseVib = (ps.n1 / 100) * 0.8;
      let vibNoise = Math.random() * 0.1;
      // High vibration if starting cold
      if (state === EngineState.STARTING && ps.oilT < 30) vibNoise += 0.5;
      
      if (failures.vibSensorFault) {
          baseVib = 4.5 + Math.random(); // Max out sensor
      }
      
      // Massive vibration right before/during seizure if moving
      if (state === EngineState.SEIZED) {
          baseVib = 0;
          vibNoise = 0;
      }

      const vib = baseVib + vibNoise;

      // Update React State
      setTelemetry({
        n1: Math.max(0, ps.n1),
        n2: Math.max(0, ps.n2),
        egt: Math.max(20, ps.egt),
        ff: Math.max(0, ff),
        oilP: Math.max(0, oilP),
        oilT: ps.oilT,
        vib: Math.max(0, vib),
        timestamp: Date.now(),
      });

    }, SIM_RATE);

    return () => clearInterval(timer);
  }, [controls, state, failures, fireSystem]);

  return { 
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
  };
};
