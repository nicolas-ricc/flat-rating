export interface Summary {
  buildingId: string;
  content: string;
  averageRating: number;
  commentCount: number;
  lastUpdated: string;
}

export interface UpdateSummaryInput {
  content: string;
  averageRating: number;
  commentCount: number;
}
