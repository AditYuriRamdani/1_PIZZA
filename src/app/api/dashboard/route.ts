import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { paid_at: "desc" },
      include: {
        kasir: true,
      },
    });

    const totalRevenue = transactions.reduce(
      (sum, trx) => sum + trx.total_amount,
      0,
    );

    const totalOrders = await prisma.order.count();

    const activeMenus = await prisma.menu.count({
      where: { is_available: true },
    });

    const recentTransactions = transactions.slice(0, 5); // Ambil 5 terbaru

    // Menghitung Menu Paling Laris (Top 5) dari pesanan yang sudah SELESAI
    const topItems = await prisma.orderItem.groupBy({
      by: ["menu_id"],
      where: {
        order: { status: "SELESAI" },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    // Mengambil nama menu berdasarkan ID dari hasil groupBy
    const topMenus = await Promise.all(
      topItems.map(async (item) => {
        const menu = await prisma.menu.findUnique({
          where: { id: item.menu_id },
        });
        return {
          name: menu?.name || "Menu Tidak Diketahui",
          sold: item._sum.quantity || 0,
        };
      }),
    );

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      activeMenus,
      recentTransactions,
      topMenus,
    });
  } catch (error) {
    console.error("GET Dashboard Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data analitik" },
      { status: 500 },
    );
  }
}
