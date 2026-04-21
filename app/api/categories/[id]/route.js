import { NextResponse } from "next/server";
import { getCategoryById, updateCategory, deleteCategory } from "@/app/lib/db";

export async function GET(request, { params }) {
  const { id } = await params;
  console.log(`[GET] /api/categories/${id}`);
  const category = await getCategoryById(Number(id));

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

  const category = await updateCategory(Number(id), body);

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  console.log(`[DELETE] /api/categories/${id}`);
  try {
    const deleted = await deleteCategory(Number(id));
    if (!deleted) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.code === "23503") {
      return NextResponse.json(
        {
          error:
            "Cannot delete a category that is used by existing transactions",
        },
        { status: 409 },
      );
    }
    throw err;
  }
}
