import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

const getGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING, description: "The specific name of the product identified." },
    category: { type: Type.STRING, description: "Broad category (e.g., Electronics, Footwear)." },
    description: { type: Type.STRING, description: "A detailed 2-3 sentence description of the product, its use, and key appeal." },
    confidenceScore: { type: Type.NUMBER, description: "Confidence score between 0 and 100." },
    isRare: { type: Type.BOOLEAN, description: "True if the item is considered a collectible, vintage, or limited edition." },
    rarityTier: { 
      type: Type.STRING, 
      enum: ["Common", "Uncommon", "Rare", "Epic", "Legendary"],
      description: "Assign a rarity tier based on how hard it is to find or how desirable it is. Common = widely available, Legendary = highly sought after/vintage/limited." 
    },
    estimatedValueRange: { type: Type.STRING, description: "Estimated market value range in GBP (e.g., '£50 - £80')." },
    buyingTip: { type: Type.STRING, description: "A short, 1-sentence quick AI suggestion for the buyer (e.g., 'Best value found on eBay' or 'Wait for sale')." },
    specs: {
      type: Type.OBJECT,
      properties: {
        material: { type: Type.STRING },
        dimensions: { type: Type.STRING },
        weight: { type: Type.STRING },
        releaseYear: { type: Type.STRING },
        manufacturer: { type: Type.STRING },
        modelNumber: { type: Type.STRING },
        color: { type: Type.STRING },
        connectivity: { type: Type.STRING },
        powerSource: { type: Type.STRING },
        origin: { type: Type.STRING },
      },
      description: "Comprehensive technical specifications. Include ANY available details: Manufacturer, Model, Year, Material, Dimensions, Weight, Color, Connectivity, etc."
    },
    pros: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-4 key advantages (Buffs)."
    },
    cons: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 2-3 potential drawbacks (Debuffs)."
    },
    retailers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          retailer: { type: Type.STRING, description: "Name of the retailer (e.g. Amazon, Argos, CEX, Cash Converters, Local Tech Shops)." },
          price: { type: Type.STRING },
          currency: { type: Type.STRING, description: "Must be 'GBP' or '£'." },
          inStock: { type: Type.BOOLEAN },
          url: { type: Type.STRING, description: "A functional SEARCH URL for this product at the retailer (e.g., 'https://www.amazon.co.uk/s?k=Product+Name'). Do NOT guess specific product IDs." },
          productImage: { type: Type.STRING, description: "A valid direct URL to an image of the product. If unknown, leave empty." },
          comparison: { type: Type.STRING, description: "Briefly mention 1 major competitor brand & price for context. E.g. 'vs Sony: £150' or 'vs Nike: £80'. Keep it minimal." }
        }
      },
      description: "List 4-5 estimated prices from MAJOR UK RETAILERS (Amazon, eBay, Argos, Currys) AND LOCAL HIGH STREET SHOPS (CEX, Cash Converters, Independent Shops). Avoid wholesale."
    },
    relatedProducts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          reason: { type: Type.STRING },
          estimatedPrice: { type: Type.STRING }
        }
      },
      description: "List of 4 similar or alternative products available in the UK."
    }
  },
  required: ["productName", "description", "retailers", "relatedProducts", "specs", "rarityTier", "buyingTip"]
};

// Generate a simple unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const analyzeImage = async (base64Image: string, mimeType: string = "image/jpeg", isBarcode: boolean = false): Promise<AnalysisResult> => {
  const ai = getGenAI();
  const modelId = "gemini-2.5-flash";

  try {
    const prompt = isBarcode 
      ? `You are a barcode scanner and product expert. 
         1. Read the barcode in the image if present. 
         2. Identify the EXACT product associated with this barcode or the product in the image.
         3. Provide details for a UK-based CONSUMER (not wholesale).
         
         Gamification Mode: On.
         - Assign a Rarity Tier.
         - Prices in GBP (£) from major UK retailers AND Local Shops (CEX, Cash Converters).
         - IMPORTANT: For the 'url' field, provide a SEARCH URL (e.g., 'https://www.amazon.co.uk/s?k=Product+Name') to ensure the link works.
         - Provide a quick buying tip.
         - Provide FULL specs (attributes) where possible.`
      : `Identify this EXACT item for a UK-based shopper.
            
         Gamification Mode: On.
         1. Assign a Rarity Tier.
         2. Identify exact model/year.
         3. Prices in GBP (£) from MAJOR UK RETAILERS (Amazon, eBay, Argos) AND LOCAL HIGH STREET SHOPS (e.g., CEX, Cash Converters, Local Tech Shops).
         4. Include Local Shop prices to compare with big retailers.
         5. IMPORTANT: For the 'url' field, use SEARCH QUERY URLs (e.g. Amazon Search, Google Shopping Search) to ensure links are never broken.
         6. Provide 3 Pros (Buffs) and 3 Cons (Debuffs).
         7. Provide a quick buying tip.
         8. Provide COMPREHENSIVE Attributes/Specs (fill as many fields as relevant).
         9. In retailer offers, include a minimal comparison price for a main competitor brand.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        temperature: 0.3, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");
    
    const data = JSON.parse(text);
    return {
        ...data,
        id: generateId(),
        timestamp: Date.now()
    } as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const analyzeText = async (query: string): Promise<AnalysisResult> => {
    const ai = getGenAI();
    const modelId = "gemini-2.5-flash";
  
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: {
          parts: [
            {
              text: `Identify the product from query: "${query}" for a UK shopper.
              
              Gamification Mode: On.
              1. Assign a Rarity Tier.
              2. Prices in GBP (£) from MAJOR UK RETAILERS (Amazon, eBay, Argos) AND LOCAL SHOPS (CEX, Cash Converters).
              3. Include Local Shop prices.
              4. IMPORTANT: For the 'url' field, provide SEARCH URLs (e.g. 'https://www.amazon.co.uk/s?k=...') to guarantee working links.
              5. Provide a quick buying tip.
              6. Fill all technical specs.
              `
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_SCHEMA,
        }
      });
  
      const text = response.text;
      if (!text) throw new Error("No data returned from Gemini");
      
      const data = JSON.parse(text);
      return {
          ...data,
          id: generateId(),
          timestamp: Date.now()
      } as AnalysisResult;
    } catch (error) {
      console.error("Gemini Text Analysis Error:", error);
      throw error;
    }
  };