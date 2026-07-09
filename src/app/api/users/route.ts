import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// GET /api/users — owner/manager only, lists staff-type accounts
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(apiUrl("/api/users"), {
    headers: { Authorization: authHeader },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to load staff" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: data.users ?? [] });
}

// POST /api/users — owner/manager only, { name, email, password, role, phone? }
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(apiUrl("/api/users"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to create staff member" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: data.user ?? data });
}
