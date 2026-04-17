import { NextResponse } from "next/server";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/app/lib/mock-data";

export async function GET(request, { params }) {
  const { id } = await params;
  console.log(`[GET] /api/categories/${id}`);
  const category = getCategoryById(Number(id));

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  console.log(`[PUT] /api/categories/${id}`, body);

  if (body.type && body.type !== "income" && body.type !== "expense") {
    return NextResponse.json(
      { error: "type must be 'income' or 'expense'" },
      { status: 400 },
    );
  }

  const category = updateCategory(Number(id), body);

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  console.log(`[DELETE] /api/categories/${id}`);
  const deleted = deleteCategory(Number(id));

  if (!deleted) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
