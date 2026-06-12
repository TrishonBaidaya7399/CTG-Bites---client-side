import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let cached = (global as unknown as { mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null } }).mongoose ?? { conn: null, promise: null };
(global as unknown as { mongoose: typeof cached }).mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then((m) => m.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
