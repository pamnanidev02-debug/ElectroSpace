import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface RoomAnalysis {
  style: string;
  palette: string;
  areaSize: string;
  lightProfile: string;
  recommendations: Recommendation[];
}

export interface Recommendation {
  brand: string;
  model: string;
  category: string;
  price: string;
  energyRating: string;
  specs: { label: string; value: string }[];
  matchReason: string;
  imageUrl: string;
  type: 'PREMIUM MATCH' | 'TOP RATED' | 'VALUE PICK';
}

export async function analyzeRoom(preferences: {
  category: string;
  roomSize: string;
  budget: string;
  image?: string; // base64 string
}): Promise<RoomAnalysis> {
  const parts: any[] = [
    { text: `Analyze a room for a ${preferences.category} recommendation. 
    Room size: ${preferences.roomSize}. 
    Budget preference: ${preferences.budget}.
    
    Return a JSON object with:
    - style: A string describing the detected interior style (e.g., "Modern Minimalist").
    - palette: A string describing the wall palette (e.g., "Pure White / Eggshell").
    - areaSize: The room size string.
    - lightProfile: A string describing the lighting (e.g., "High Natural Light").
    - recommendations: An array of 3 products, each with brand, model, category, price, energyRating, specs (array of {label, value}), matchReason (a short quote), imageUrl (use a relevant picsum or placeholder URL), and type (one of 'PREMIUM MATCH', 'TOP RATED', 'VALUE PICK').` }
  ];

  if (preferences.image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: preferences.image.split(',')[1] || preferences.image
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING },
            palette: { type: Type.STRING },
            areaSize: { type: Type.STRING },
            lightProfile: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  brand: { type: Type.STRING },
                  model: { type: Type.STRING },
                  category: { type: Type.STRING },
                  price: { type: Type.STRING },
                  energyRating: { type: Type.STRING },
                  specs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING }
                      }
                    }
                  },
                  matchReason: { type: Type.STRING },
                  imageUrl: { type: Type.STRING },
                  type: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Analysis failed:", error);
    // Fallback data if API fails
    return {
      style: "Modern Minimalist",
      palette: "Pure White / Eggshell",
      areaSize: preferences.roomSize,
      lightProfile: "High Natural Light",
      recommendations: [
        {
          brand: "Daikin",
          model: "FTKM Series Split AC",
          category: "Air Conditioner",
          price: "$849.00",
          energyRating: "5-Star Energy",
          specs: [{ label: "Capacity", value: "1.5 Ton" }, { label: "Smart Tech", value: "Wifi Enabled" }],
          matchReason: "The matte finish and hidden display complement your white minimalist walls perfectly without visual noise.",
          imageUrl: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=800",
          type: "PREMIUM MATCH"
        }
      ]
    };
  }
}
