import { NextResponse } from "next/server";
import { COOKIE_DELETE } from "@/app/lib/auth";

export async function POST() {
  console.log("[POST] /api/auth/logout");
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_DELETE);
  return response;
}
