import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// GET /api/reports/dashboard — owner/manager/staff
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(apiUrl("/api/reports/dashboard"), {
    headers: { Authorization: authHeader },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to load dashboard report" }, { status: res.status });
  }

  return NextResponse.json({ success: true, ...data });
}
