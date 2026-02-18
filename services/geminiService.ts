
import { GoogleGenAI, Type } from "@google/genai";
import { GreetingResponse, ReflectionResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateRamadanGreeting = async (name: string, relation: string): Promise<GreetingResponse> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a beautiful, personalized Ramadan Mubarak greeting for ${name}, who is my ${relation}. Keep it warm, spiritual, and poetic. Include a short blessing.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          message: { type: Type.STRING },
          verse: { type: Type.STRING, description: "A relevant short Quranic verse or traditional saying" },
          blessing: { type: Type.STRING }
        },
        required: ["message", "blessing"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateDailyReflection = async (dayOfRamadan: number): Promise<ReflectionResponse> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a spiritual reflection for Day ${dayOfRamadan} of Ramadan. Focus on a virtue like patience, gratitude, or charity.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thought: { type: Type.STRING, description: "The core spiritual reflection" },
          action: { type: Type.STRING, description: "A practical small good deed for today" },
          context: { type: Type.STRING, description: "Why this virtue is important in Ramadan" }
        },
        required: ["thought", "action", "context"]
      }
    }
  });

  return JSON.parse(response.text);
};
