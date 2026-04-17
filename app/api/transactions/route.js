import { NextResponse } from "next/server";
import {
  getTransactions,
  createTransaction,
  clearTransactions,
} from "@/app/lib/mock-data";
import { getAuthUser } from "@/app/lib/auth";

export async function GET() {
  console.log("[GET] /api/transactions");
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const transactions = getTransactions(user.id);
  return NextResponse.json(transactions);
}

export async function POST(request) {
  const body = await request.json();
  console.log("[POST] /api/transactions", body);
  const { name, amount, categoryId, date } = body;

  if (!name || amount === undefined || !categoryId) {
    return NextResponse.json(
      { error: "name, amount, and categoryId are required" },
      { status: 400 },
    );
  }

  if (typeof amount !== "number" || amount === 0) {
    return NextResponse.json(
      { error: "amount must be a non-zero number" },
      { status: 400 },
    );
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const transaction = createTransaction({
    name,
    amount,
    categoryId: Number(categoryId),
    date: date || new Date().toISOString().split("T")[0],
    userId: user.id,
  });

  return NextResponse.json(transaction, { status: 201 });
}

export async function DELETE() {
  console.log("[DELETE] /api/transactions (clear all)");
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  clearTransactions(user.id);
  return NextResponse.json({ success: true });
}
