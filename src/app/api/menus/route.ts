import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        category: true,
      },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(menus);
  } catch (error) {
    console.error("GET Menu Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data menu" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newMenu = await prisma.menu.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        category_id: body.category_id,
        is_available: body.is_available,
      },
    });

    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error("POST Menu Error:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan menu" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const updatedMenu = await prisma.menu.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        category_id: body.category_id,
        is_available: body.is_available,
      },
    });

    return NextResponse.json(updatedMenu);
  } catch (error) {
    console.error("PUT Menu Error:", error);
    return NextResponse.json({ error: "Gagal mengubah menu" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    await prisma.menu.delete({
      where: { id: body.id },
    });

    return NextResponse.json({ message: "Menu berhasil dihapus" });
  } catch (error) {
    console.error("DELETE Menu Error:", error);
    return NextResponse.json(
      {
        error: "Gagal menghapus menu. Pastikan menu ini belum pernah dipesan.",
      },
      { status: 500 },
    );
  }
}
