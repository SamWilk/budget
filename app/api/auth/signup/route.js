import { NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/app/lib/db";
import { signToken, authCookieOptions } from "@/app/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("[POST] /api/auth/signup", { email: body.email });
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "name and email are required" },
        { status: 400 },
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists" },
        { status: 409 },
      );
    }

    const user = await createUser({ name, email });
    const token = await signToken(user.id);

    const response = NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 201 },
    );
    response.cookies.set(authCookieOptions(token));
    return response;
  } catch (err) {
    console.error("[POST] /api/auth/signup error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
