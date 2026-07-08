import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// GET /api/categories?kind=menu|appetizer — public
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");

  const url = new URL(apiUrl("/api/categories"));
  if (kind) url.searchParams.set("kind", kind);

  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to load categories" }, { status: res.status });
  }

  return NextResponse.json({ success: true, categories: data.categories ?? [] });
}

// POST /api/categories — owner/manager only, { name, kind }
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(apiUrl("/api/categories"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to create category" }, { status: res.status });
  }

  return NextResponse.json({ success: true, category: data.category ?? data });
}
