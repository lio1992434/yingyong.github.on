import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

// Helper to get API key safely
const getApiKey = () => process.env.API_KEY || '';

export const generateRecipeFromIdea = async (idea: string): Promise<Partial<Recipe> | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("No API Key found");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a detailed recipe in Simplified Chinese (简体中文) based on this idea: "${idea}". 
                 Ensure it has a catchy title, appropriate tags, list of ingredients, and clear steps.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  unit: { type: Type.STRING }
                }
              }
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  instruction: { type: Type.STRING }
                }
              }
            }
          },
          required: ["title", "ingredients", "steps"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Partial<Recipe>;
    }
  } catch (error) {
    console.error("Gemini Generation Error:", error);
  }
  return null;
};