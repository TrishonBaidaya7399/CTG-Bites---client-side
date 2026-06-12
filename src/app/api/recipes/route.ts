import { NextResponse } from "next/server";
import { recipes } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ success: true, data: recipes });
}
