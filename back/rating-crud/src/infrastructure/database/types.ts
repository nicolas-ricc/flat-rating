export interface BuildingRow {
  id: string;
  name: string;
  address: string;
  price_range: string | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CommentRow {
  id: string;
  building_id: string;
  rating: number;
  content: string;
  created_at: Date;
}

export interface SummaryRow {
  building_id: string;
  content: string;
  average_rating: string; // DECIMAL comes as string from pg
  comment_count: number;
  last_updated: Date;
}
