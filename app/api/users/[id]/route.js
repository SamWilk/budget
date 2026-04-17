import { NextResponse } from "next/server";
import {
  getUserById,
  updateUser,
  deleteUser,
  getUserByEmail,
} from "@/app/lib/mock-data";

export async function GET(request, { params }) {
  const { id } = await params;
  console.log(`[GET] /api/users/${id}`);
  const user = getUserById(Number(id));

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  console.log(`[PUT] /api/users/${id}`, body);

  if (body.email) {
    const existing = getUserByEmail(body.email);
    if (existing && existing.id !== Number(id)) {
      return NextResponse.json(
        { error: "A user with that email already exists" },
        { status: 409 },
      );
    }
  }

  const user = updateUser(Number(id), body);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  console.log(`[DELETE] /api/users/${id}`);
  const deleted = deleteUser(Number(id));

  if (!deleted) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
