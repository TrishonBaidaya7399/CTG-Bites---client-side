import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function GET() {
  const res = await fetch(apiUrl("/api/recipes"), { next: { revalidate: 300 } });
  const body = await res.json();

  if (!res.ok) {
    return NextResponse.json({ success: false, error: body?.error ?? "Failed to load recipes" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: body.recipes });
}
