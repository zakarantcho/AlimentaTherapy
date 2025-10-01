export interface Disease {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export interface Source {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Food {
  name: string;
  summary: string;
  imageUrl?: string;
  details?: string;
  sources?: Source[];
}

export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  benefits: string;
  imageUrl?: string;
  diseaseId: string;
}

export interface SymptomEntry {
  id: string;
  date: string; // ISO string format
  description: string;
  severity: number; // 1-5 scale
}

export interface AdherenceEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  rating: number; // 1-5 scale
  notes: string;
}

export interface Question {
    id: string;
    text: string;
}

export interface PersonalizedPlan {
    analysis: string;
    prescription: string;
    explanation: string;
}

export type View = 'welcome' | 'dashboard' | 'loading';

export interface GeneratedContent {
  foods: Food[];
  recipes: Recipe[];
}

export interface ExternalHealthData {
  date: string; // YYYY-MM-DD format
  metric: string;
  value: number;
}
