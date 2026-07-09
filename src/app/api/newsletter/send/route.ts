import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// POST /api/newsletter/send — staff-only, manual email to selected subscribers
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const res = await fetch(apiUrl("/api/newsletter/send"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to send email" }, { status: res.status });
  }

  return NextResponse.json({ success: true, sent: data.sent ?? 0 });
}
