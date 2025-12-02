import { GoogleGenAI, Type } from "@google/genai";
import { TrafficData, OptimizationSuggestion } from '../types';

// Safely retrieve API key with fallback to empty string to prevent build errors
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelId = 'gemini-2.5-flash';

export const analyzeTraffic = async (data: TrafficData, scenario: string): Promise<string> => {
  try {
    if (!apiKey) {
      return "System Error: API_KEY not found in environment.";
    }

    const prompt = `
      Analyze the following Indian traffic system data snapshot.
      Scenario Context: ${scenario}
      
      System Overview:
      - Overall Health: ${data.overallHealth}%
      - Active Junctions: ${data.nodes.length}

      High Congestion Junctions:
      ${data.nodes.filter(n => n.congestionLevel > 70).map(n => `- ${n.label}: ${n.congestionLevel}% congestion`).join('\n')}

      Provide a concise executive summary for a Traffic Control Room in India. 
      Consider mix of vehicles (2-wheelers, autos, buses).
      Identify bottlenecks and suggest immediate actions (e.g., deploy traffic police, adjust signal timers).
      Keep it professional, urgent, and limit to 3 short paragraphs.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Traffic Control AI for Indian Smart Cities. You understand the chaos of mixed traffic, monsoon effects, and festival rushes.",
      }
    });

    return response.text || "Unable to generate analysis.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error connecting to AI analysis subsystem.";
  }
};

export const optimizeSignalTiming = async (data: TrafficData): Promise<OptimizationSuggestion[]> => {
  try {
    if (!apiKey) return [];

    const criticalNodes = data.nodes.filter(n => n.congestionLevel > 50);
    
    if (criticalNodes.length === 0) return [];

    const nodesJson = JSON.stringify(criticalNodes.map(n => ({
      id: n.id,
      label: n.label,
      congestion: n.congestionLevel,
      currentGreenLight: n.lightDuration
    })));

    const prompt = `
      Given these congested Indian traffic junctions, suggest optimized green light durations.
      Consider that heavy junctions in India often need 90s-120s green time during peak hours.
      Nodes: ${nodesJson}
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nodeId: { type: Type.STRING },
              currentDuration: { type: Type.NUMBER },
              suggestedDuration: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
            },
            required: ["nodeId", "currentDuration", "suggestedDuration", "reasoning"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as OptimizationSuggestion[];

  } catch (error) {
    console.error("Gemini Optimization Error:", error);
    return [];
  }
};

export const generateIncidentReport = async (nodeLabel: string, type: string) => {
    try {
        if (!apiKey) return "API Key missing.";
        const response = await ai.models.generateContent({
            model: modelId,
            contents: `Generate a formalized incident report for "${type}" at "${nodeLabel}" in India. Mention potential impact on commuters and suggest alternate routes.`,
        });
        return response.text;
    } catch (e) {
        return "Failed to generate report.";
    }
}