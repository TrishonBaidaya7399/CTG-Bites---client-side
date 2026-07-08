import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// GET /api/auth/socket-token — forwards Bearer token, returns a fresh short-lived token for the Socket.io handshake
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(apiUrl("/api/auth/socket-token"), {
    headers: { Authorization: authHeader },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to get socket token" }, { status: res.status });
  }

  return NextResponse.json({ success: true, token: data.token });
}
