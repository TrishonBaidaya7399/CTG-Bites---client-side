export type ReviewStatus = "pending" | "approved" | "hidden";

export interface Review {
  id: string;
  groupId: string;
  orderNumber: string;
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
