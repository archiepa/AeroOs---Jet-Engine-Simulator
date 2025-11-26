


export interface EngineTelemetry {
  n1: number; // Fan speed %
  n2: number; // Core speed %
  egt: number; // Exhaust Gas Temperature (C)
  ff: number; // Fuel Flow (kg/h)
  oilP: number; // Oil Pressure (psi)
  oilT: number; // Oil Temperature (C)
  vib: number; // Vibration (ips)
  bleedPsi: number; // Bleed Air Pressure (psi)
  timestamp: number;
}

export enum EngineState {
  OFF = 'OFF',
  STARTING = 'STARTING',
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  SHUTDOWN = 'SHUTDOWN',
  FIRE = 'FIRE',
  SEIZED = 'SEIZED'
}

export interface EngineControls {
  masterSwitch: boolean;
  fuelPump: boolean;
  ignition: boolean;
  starter: boolean;
  throttle: number; // 0-100
  bleedAir: boolean; // Master Bleed Valve
  packL: boolean;
  packR: boolean;
}

export interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
}

export interface FailureState {
    engineFire: boolean;
    oilPumpFailure: boolean;
    fuelPumpFailure: boolean;
    vibSensorFault: boolean;
}

export interface FailureConfig {
    id: keyof FailureState;
    label: string;
    delay: number; // seconds
    shortcut: string;
}

export interface FireSystemState {
    loopA: 'NORMAL' | 'FAULT' | 'FIRE';
    loopB: 'NORMAL' | 'FAULT' | 'FIRE';
    handlePulled: boolean;
    bottle1: 'CHARGED' | 'DISCHARGED';
    bottle2: 'CHARGED' | 'DISCHARGED';
    masterArmed: boolean;
}