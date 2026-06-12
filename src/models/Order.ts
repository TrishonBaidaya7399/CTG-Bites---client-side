import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  customerName: string;
  customerEmail: string;
  items: IOrderItem[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "delivered" | "cancelled";
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    customerName:  { type: String, required: true },
    customerEmail: { type: String, required: true },
    items: [
      {
        menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem" },
        name:       String,
        price:      Number,
        quantity:   { type: Number, min: 1 },
      },
    ],
    total:  { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
