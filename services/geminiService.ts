
import { GoogleGenAI, Type } from "@google/genai";
import { EngineTelemetry, EngineState, SystemAlert } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeEngineStatus = async (
  telemetry: EngineTelemetry,
  state: EngineState,
  controls: any
): Promise<string> => {
  if (!apiKey) return "AI DIAGNOSTICS OFFLINE: NO API KEY";

  const prompt = `
    Role: You are the Engine Management System (EMS) AI for a high-bypass turbofan jet engine.
    Task: Analyze the current telemetry snapshot and provide a concise status report (max 2 sentences).
    Tone: Technical, precise, military/aerospace style.

    Current State: ${state}
    Controls: Master=${controls.masterSwitch}, Fuel=${controls.fuelPump}, Ignition=${controls.ignition}, Throttle=${controls.throttle.toFixed(1)}%
    
    Telemetry:
    - N1 (Fan): ${telemetry.n1.toFixed(1)}%
    - N2 (Core): ${telemetry.n2.toFixed(1)}%
    - EGT: ${telemetry.egt.toFixed(0)} C (Redline: 950 C)
    - Fuel Flow: ${telemetry.ff.toFixed(0)} kg/h
    - Oil Pressure: ${telemetry.oilP.toFixed(0)} psi
    - Vibration: ${telemetry.vib.toFixed(2)} ips

    Identify any anomalies (High EGT, Low Oil Press, Vibration) or confirm nominal operation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    // FIX: Per @google/genai guidelines, response.text can be undefined and should be checked.
    if (!response.text) {
      throw new Error("Received empty text response from Gemini.");
    }
    return response.text.trim();
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return "EMS LINK FAILURE: UNABLE TO PROCESS TELEMETRY.";
  }
};

export const getDiagnosticCode = async (errorDescription: string): Promise<SystemAlert> => {
    if (!apiKey) return {
        id: Date.now().toString(),
        level: 'warning',
        message: 'AI DIAGNOSTICS UNAVAILABLE',
        timestamp: Date.now()
    };

    try {
        const prompt = `
            Generate a short system alert for a jet engine based on this observation: "${errorDescription}".
            The alert should have a severity level and a short technical message.
        `;
        
        // FIX: Per @google/genai guidelines, use responseSchema for structured JSON output.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        level: {
                            type: Type.STRING,
                            description: "Severity level of the alert, one of 'info', 'warning', or 'critical'."
                        },
                        message: {
                            type: Type.STRING,
                            description: "A short, uppercase, technical alert message."
                        }
                    },
                    required: ["level", "message"]
                }
            }
        });
        
        // FIX: Per @google/genai guidelines, response.text can be undefined and should be checked.
        if (!response.text) {
            throw new Error("Received empty JSON response from Gemini.");
        }
        const data = JSON.parse(response.text);
        return {
            id: Date.now().toString(),
            level: data.level,
            message: data.message,
            timestamp: Date.now()
        };
    } catch (e) {
        console.error("Gemini diagnostic code generation failed", e);
        return {
            id: Date.now().toString(),
            level: 'info',
            message: 'SYSTEM CHECK COMPLETE',
            timestamp: Date.now()
        };
    }
}