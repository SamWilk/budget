import { NextResponse } from "next/server";
import {
  getUserById,
  updateUser,
  deleteUser,
  getUserByEmail,
} from "@/app/lib/db";

export async function GET(request, { params }) {
  const { id } = await params;
  console.log(`[GET] /api/users/${id}`);
  const user = await getUserById(Number(id));

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
    const existing = await getUserByEmail(body.email);
    if (existing && existing.id !== Number(id)) {
      return NextResponse.json(
        { error: "A user with that email already exists" },
        { status: 409 },
      );
    }
  }

  const user = await updateUser(Number(id), body);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  console.log(`[DELETE] /api/users/${id}`);
  const deleted = await deleteUser(Number(id));

  if (!deleted) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
