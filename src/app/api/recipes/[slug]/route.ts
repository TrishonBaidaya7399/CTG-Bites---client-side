import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const res = await fetch(apiUrl(`/api/recipes/${encodeURIComponent(slug)}`), { next: { revalidate: 300 } });
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: body?.error ?? "Recipe not found" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: body.recipe });
}
