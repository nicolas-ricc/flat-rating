export interface Comment {
  id: string;
  buildingId: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface CreateCommentInput {
  rating: number;
  content: string;
}

export interface ListCommentsQuery {
  limit?: number;
  offset?: number;
}
