import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        table: true,
        pelayan: true,
        items: {
          include: {
            menu: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET Orders Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pesanan" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newOrder = await prisma.$transaction(async (tx: any) => {
      // Cek apakah meja ini sudah memiliki pesanan aktif yang belum selesai
      const existingOrder = await tx.order.findFirst({
        where: {
          table_id: body.table_id,
          status: { not: "SELESAI" },
        },
      });

      // FITUR NAMBAH PESANAN: Jika sudah ada pesanan di meja ini, gabungkan.
      if (existingOrder) {
        for (const item of body.items) {
          await tx.orderItem.create({
            data: {
              order_id: existingOrder.id,
              menu_id: item.menu_id,
              quantity: item.quantity,
            },
          });
        }

        // Ubah status ke MENUNGGU agar koki tahu ada tambahan pesanan baru
        const updatedOrder = await tx.order.update({
          where: { id: existingOrder.id },
          data: { status: "MENUNGGU" },
          include: { items: true },
        });
        return updatedOrder;
      }

      // LOGIKA NORMAL: Jika meja kosong, buat pesanan baru
      else {
        const order = await tx.order.create({
          data: {
            table_id: body.table_id,
            user_id: body.user_id,
            status: "MENUNGGU",
            items: {
              create: body.items.map((item: any) => ({
                menu_id: item.menu_id,
                quantity: item.quantity,
              })),
            },
          },
        });

        await tx.table.update({
          where: { id: body.table_id },
          data: { status: "TERISI" },
        });

        return order;
      }
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("POST Order Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat pesanan" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const updatedOrder = await prisma.order.update({
      where: { id: body.order_id },
      data: { status: body.status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("PATCH Order Error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status pesanan" },
      { status: 500 },
    );
  }
}
