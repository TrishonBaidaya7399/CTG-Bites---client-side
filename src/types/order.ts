export type OrderMode = "online" | "table";
export type OrderType = "table-food" | "parcel" | "delivery";
export type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "delivered" | "cancelled";

export interface OrderItemAppetizer {
  appetizerId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  appetizers?: OrderItemAppetizer[];
}

// Client-side "order draft" line used by OnlineOrderClient/TableOrderClient before
// submission — distinct from OrderItem (the server-confirmed shape) since it also
// tracks a stable lineKey so two bundles of the same dish with different appetizer
// selections don't get merged into one quantity-adjustable line.
export interface LocalOrderAppetizer {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export interface LocalOrderLine {
  lineKey: string;
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  appetizers: LocalOrderAppetizer[];
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
