import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// POST /api/admin/login — proxy to backend staff login (same auth endpoint, role checked client-side)
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
  }

  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Invalid email or password." }, { status: res.status });
  }

  return NextResponse.json({ success: true, ...data });
}
