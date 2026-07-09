export type ReviewStatus = "pending" | "approved" | "hidden";
export type ReviewSource = "order" | "manual";

export interface Review {
  id: string;
  groupId: string;
  source: ReviewSource;
  sourceLabel?: string;
  orderNumber?: string;
  menuItemId?: string;
  itemName: string;
  itemImage: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface ReviewItemRatingInput {
  itemIndex: number;
  rating: number;
}

export interface CreateReviewGroupInput {
  orderId: string;
  customerName?: string;
  customerAvatar?: string;
  comment?: string;
  mode: "together" | "separate";
  items: ReviewItemRatingInput[];
}

export interface CreateManualReviewInput {
  menuItemId?: string;
  itemName: string;
  itemImage: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment?: string;
  sourceLabel?: string;
}
