export interface PlantAnalysis {
  plantName: string;
  healthStatus: string;
  hydrationInfo?: string;
  sunlightInfo?: string;
  soilPhInfo?: string;
  isColorChangingFlower: boolean;
  diagnosis: string;
  recommendations: string[];
  harvestInfo?: string;
  repottingInfo?: string;
  pruningInfo?: string;
  colorChangeGuide?: {
    toBlue: string;
    toPink: string;
  };
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