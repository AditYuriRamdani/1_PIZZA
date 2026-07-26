import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        order: {
          include: {
            table: true,
          },
        },
        kasir: true,
      },
      orderBy: { paid_at: "desc" },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET Transactions Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data transaksi" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newTransaction = await prisma.$transaction(async (tx: any) => {
      // 1. Buat record Transaksi
      const transaction = await tx.transaction.create({
        data: {
          transaction_code: `TRX-${Date.now()}`,
          order_id: body.order_id,
          user_id: body.user_id,
          total_amount: body.total_amount,
          payment_method: body.payment_method, // "CASH", "QRIS", "DEBIT"
        },
      });

      // 2. Ubah status Order menjadi SELESAI
      await tx.order.update({
        where: { id: body.order_id },
        data: { status: "SELESAI" },
      });

      // 3. Ubah status Meja kembali menjadi TERSEDIA
      await tx.table.update({
        where: { id: body.table_id },
        data: { status: "TERSEDIA" },
      });

      return transaction;
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("POST Transaction Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pembayaran" },
      { status: 500 },
    );
  }
}
