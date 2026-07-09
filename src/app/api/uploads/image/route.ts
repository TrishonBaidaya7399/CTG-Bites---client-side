import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// POST /api/uploads/image — owner/manager only. Proxies multipart form-data
// (field "image" + "folder") straight through to the backend, which
// compresses via sharp and uploads to Cloudinary.
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();

  const res = await fetch(apiUrl("/api/uploads/image"), {
    method: "POST",
    headers: { Authorization: authHeader },
    body: formData,
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to upload image" }, { status: res.status });
  }

  return NextResponse.json({ success: true, url: data.url, publicId: data.publicId });
}
