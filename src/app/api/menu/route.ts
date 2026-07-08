import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const url = new URL(apiUrl("/api/menu"));
  if (category && category !== "All") url.searchParams.set("category", category);

  const res = await fetch(url, { next: { revalidate: 120 } });
  const body = await res.json();

  if (!res.ok) {
    return NextResponse.json({ success: false, error: body?.error ?? "Failed to load menu" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: body.items, count: body.items.length });
}
