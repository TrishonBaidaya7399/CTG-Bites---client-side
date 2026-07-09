import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// GET /api/roles/permission-keys — owner only, the fixed catalog of capability keys + editable roles
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(apiUrl("/api/roles/permission-keys"), {
    headers: { Authorization: authHeader },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to load permission keys" }, { status: res.status });
  }

  return NextResponse.json({ success: true, keys: data.keys ?? [], roles: data.roles ?? [] });
}
