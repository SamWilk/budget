import { NextResponse } from "next/server";
import { getUsers, createUser, getUserByEmail } from "@/app/lib/mock-data";

export async function GET() {
  console.log("[GET] /api/users");
  const users = getUsers();
  return NextResponse.json(users);
}

export async function POST(request) {
  const body = await request.json();
  console.log("[POST] /api/users", body);
  const { name, email } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "name and email are required" },
      { status: 400 },
    );
  }

  if (getUserByEmail(email)) {
    return NextResponse.json(
      { error: "A user with that email already exists" },
      { status: 409 },
    );
  }

  const user = createUser({ name, email });
  return NextResponse.json(user, { status: 201 });
}
