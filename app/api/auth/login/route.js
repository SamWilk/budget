import { NextResponse } from "next/server";
import { getUserByEmail } from "@/app/lib/db";
import { signToken, authCookieOptions } from "@/app/lib/auth";

export async function POST(request) {
  const body = await request.json();
  console.log("[POST] /api/auth/login", { email: body.email });
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json(
      { error: "No account found with that email" },
      { status: 401 },
    );
  }

  const token = await signToken(user.id);
  const response = NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
  response.cookies.set(authCookieOptions(token));
  return response;
}
