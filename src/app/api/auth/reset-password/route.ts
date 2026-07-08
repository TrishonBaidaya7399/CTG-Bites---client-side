import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// POST /api/auth/reset-password — public, { token, password }
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.token || !body?.password) {
    return NextResponse.json({ success: false, error: "Token and new password are required." }, { status: 400 });
  }

  const res = await fetch(apiUrl("/api/auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Could not reset password." }, { status: res.status });
  }

  return NextResponse.json({ success: true, ...data });
}
