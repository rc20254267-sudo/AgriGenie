/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  location: string;
  language: "en" | "te" | "hi";
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  area: number; // in acres
  soilType: string;
  cropType: string;
  plantingDate: string;
}

export interface CropManagement {
  id: string;
  farmId: string;
  cropName: string;
  growthStage: "Seedling" | "Vegetative" | "Flowering" | "Maturity" | "Harvested";
  expectedHarvestDate: string;
  fertilizerSchedule: string;
  pesticideSchedule: string;
}

export interface Expense {
  id: string;
  farmId: string;
  seedCost: number;
  fertilizerCost: number;
  laborCost: number;
  equipmentCost: number;
  timestamp: string;
}

export interface DiseaseRecord {
  id: string;
  crop: string;
  imageUrl: string;
  diseaseName: string;
  confidenceScore: number;
  cause: string;
  symptoms: string[];
  severity: "Low" | "Medium" | "High";
  prevention: string[];
  organicTreatment: string;
  chemicalTreatment: string;
  recommendedFertilizer: string;
  recoveryTime: string;
  thingsToAvoid: string[];
  timestamp: string;
}

export interface IrrigationRecommendation {
  id: string;
  farmId: string;
  crop: string;
  shouldIrrigate: boolean;
  waterQuantity: string; // e.g., "12,000 Liters / Acre"
  bestTime: string; // e.g., "6:00 AM - 8:00 AM"
  duration: string; // e.g., "2.5 Hours"
  reason: string;
  timestamp: string;
}

export interface YieldPrediction {
  id: string;
  farmId: string;
  crop: string;
  area: number;
  rainfall: number; // mm
  temperature: number; // °C
  humidity: number; // %
  fertilizerUsed: string;
  previousYield: number; // kg
  estimatedYield: number; // kg
  harvestDate: string;
  expectedProfit: number; // INR
  confidence: number; // %
  aiInsights: {
    why: string;
    improvements: string[];
    bestPractices: string[];
  };
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "rain" | "disease" | "harvest" | "irrigation" | "fertilizer";
  isRead: boolean;
  timestamp: string;
}

export interface FarmReport {
  id: string;
  farmName: string;
  date: string;
  summary: string;
  metrics: {
    totalArea: number;
    activeCrops: number;
    totalExpenses: number;
    estimatedYield: number;
    expectedProfit: number;
  };
  aiSuggestions: string[];
}
