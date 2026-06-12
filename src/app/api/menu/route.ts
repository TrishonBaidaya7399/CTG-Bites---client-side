import { NextResponse } from "next/server";
import { menuItems } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const data =
    category && category !== "All"
      ? menuItems.filter((item) => item.category === category)
      : menuItems;

  return NextResponse.json({ success: true, data, count: data.length });
}
