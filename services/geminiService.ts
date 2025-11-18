import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Analyzes a screen capture frame to identify errors or describe the UI.
 * This simulates an "Intelligent Assistant" for the remote operator.
 */
export const analyzeScreenFrame = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "Error: API Key is missing. Please configure process.env.API_KEY.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Using gemini-2.5-flash for fast multimodal understanding
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to analyze screen. The simulator might be rate limited or the key is invalid.";
  }
};

/**
 * Provides suggested actions based on logs.
 */
export const suggestActionsFromLogs = async (logs: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) return "No API Key";

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Here are the recent accessibility logs from an Android device: \n${logs}\n Suggest what the user is trying to do in one sentence.`,
    });
    return response.text || "";
  } catch (e) {
    return "";
  }
}
