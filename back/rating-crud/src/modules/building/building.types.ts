export interface Building {
  id: string;
  name: string;
  address: string;
  priceRange: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BuildingWithSummary extends Building {
  summary: {
    content: string;
    averageRating: number;
    commentCount: number;
    lastUpdated: string;
  } | null;
}

export interface CreateBuildingInput {
  name: string;
  address: string;
  priceRange?: string;
  description?: string;
}

export interface SearchBuildingsQuery {
  search?: string;
  limit?: number;
  offset?: number;
}
