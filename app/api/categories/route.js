import { NextResponse } from "next/server";
import { getCategories, createCategory } from "@/app/lib/mock-data";

export async function GET() {
  console.log("[GET] /api/categories");
  const categories = getCategories();
  return NextResponse.json(categories);
}

export async function POST(request) {
  const body = await request.json();
  console.log("[POST] /api/categories", body);
  const { name, type } = body;

  if (!name || !type) {
    return NextResponse.json(
      { error: "name and type are required" },
      { status: 400 },
    );
  }

  if (type !== "income" && type !== "expense") {
    return NextResponse.json(
      { error: "type must be 'income' or 'expense'" },
      { status: 400 },
    );
  }

  const category = createCategory({ name, type });
  return NextResponse.json(category, { status: 201 });
}
