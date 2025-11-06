import { GoogleGenAI } from "@google/genai";

export const generateImage = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please select an API key.");
  }
  // Create a new GoogleGenAI instance for each call to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const enhancedPrompt = `${prompt}, cinematic film still`;
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/png',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    }

    throw new Error("No image was generated.");
  } catch (error: any) {
    console.error("Error generating image:", error);
    // Propagate a user-friendly error message
    if (error.message?.includes('API key not valid')) {
        throw new Error("The selected API key is not valid. Please select a different key.");
    }
    if (error.message?.includes('Requested entity was not found')) {
        throw new Error(error.message); // This will be caught in App.tsx to reset key state
    }
    throw new Error("Failed to generate image due to an API error.");
  }
};