export type OrderMode = "online" | "table";
export type OrderType = "table-food" | "parcel" | "delivery";
export type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "delivered" | "cancelled";

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  mode: OrderMode;
  type: OrderType;
  status: OrderStatus;
  tableNumber?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  note?: string;
  total: number;
  estimatedMinutes: number;
  acceptedAt?: string;
  createdAt: string;
}
