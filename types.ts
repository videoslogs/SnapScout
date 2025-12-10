export enum LoadingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface RetailerPrice {
  retailer: string;
  price: string;
  currency: string;
  url: string;
  inStock: boolean;
  productImage?: string; // URL for the product image at this retailer
  comparison?: string; // Minimal competitor price context e.g., "vs Sony: £180"
}

export interface RelatedProduct {
  name: string;
  reason: string;
  estimatedPrice: string;
  imageUrl?: string;
  url?: string;
}

export interface ProductSpecs {
  // Flexible key-value pairs for full details
  [key: string]: string | undefined;
}

export type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface AnalysisResult {
  id: string;        // UUID for local storage
  timestamp: number; // For sorting saved items
  productName: string;
  category: string;
  description: string;
  confidenceScore: number; // 0-100
  isRare: boolean;
  rarityTier: RarityTier; // Gamified rarity
  estimatedValueRange: string;
  buyingTip: string; // Quick AI Suggestion
  specs: ProductSpecs;
  pros: string[];
  cons: string[];
  retailers: RetailerPrice[];
  relatedProducts: RelatedProduct[];
}

export interface HistoryDataPoint {
  date: string;
  price: number;
}