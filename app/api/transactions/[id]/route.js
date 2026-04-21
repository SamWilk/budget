import { NextResponse } from "next/server";
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "@/app/lib/db";
import { getAuthUser } from "@/app/lib/auth";

export async function GET(request, { params }) {
  const { id } = await params;
  console.log(`[GET] /api/transactions/${id}`);
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const transaction = await getTransactionById(Number(id), user.id);

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(transaction);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  console.log(`[PUT] /api/transactions/${id}`, body);

  if (
    body.amount !== undefined &&
    (typeof body.amount !== "number" || body.amount === 0)
  ) {
    return NextResponse.json(
      { error: "amount must be a non-zero number" },
      { status: 400 },
    );
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const transaction = await updateTransaction(Number(id), body, user.id);

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(transaction);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  console.log(`[DELETE] /api/transactions/${id}`);
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const deleted = await deleteTransaction(Number(id), user.id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
