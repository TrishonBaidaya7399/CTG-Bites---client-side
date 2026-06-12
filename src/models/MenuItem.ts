import mongoose, { Schema, Document } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  image: string;
  isVeg: boolean;
  isSpicy: boolean;
  createdAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name:        { type: String, required: true },
    category:    { type: String, required: true, enum: ["Mezzban", "Bhuna", "Bhorta", "Sides", "Drinks", "Mishti"] },
    price:       { type: Number, required: true },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    reviews:     { type: Number, default: 0 },
    badge:       { type: String },
    description: { type: String, required: true },
    image:       { type: String, required: true },
    isVeg:       { type: Boolean, default: false },
    isSpicy:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MenuItem =
  mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
