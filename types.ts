export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Step {
  instruction: string;
  image?: string; // Base64 string for local storage simplicity
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: Step[];
  createdAt: number;
  updatedAt: number;
  coverImage?: string;
}

export type ViewState = 'LIST' | 'DETAIL' | 'EDIT' | 'CREATE';
