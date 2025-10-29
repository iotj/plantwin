export interface PlantAnalysis {
  plantName: string;
  commonKoreanName?: string;
  scientificName?: string;
  healthStatus: string;
  hydrationInfo?: string;
  sunlightInfo?: string;
  soilPhInfo?: string;
  isColorChangingFlower: boolean;
  diagnosis: string;
  recommendations: string[];
  harvestInfoSummary?: string;
  harvestInfo?: string;
  repottingInfoSummary?: string;
  repottingInfo?: string;
  pruningInfoSummary?: string;
  pruningInfo?: string;
  pestDiseaseInfoSummary?: string;
  pestDiseaseInfo?: string;
  hydrationInfoDetail?: string;
  sunlightInfoDetail?: string;
  colorChangeGuide?: {
    toBlue: string;
    toPink: string;
  };
  potentialFlowerColors?: string[];
  flowerLanguage?: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // ISO string
  imageBase64: string;
  mimeType: string;
  analysis: PlantAnalysis;
}

export interface Plant {
  id: string;
  name: string;
  entries: DiaryEntry[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
