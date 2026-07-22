import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { table_number: "asc" },
    });
    return NextResponse.json(tables);
  } catch (error) {
    console.error("GET Table Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data meja" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTable = await prisma.table.create({
      data: {
        table_number: parseInt(body.table_number, 10),
      },
    });
    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    console.error("POST Table Error:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan meja. Pastikan nomor meja belum ada." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updatedTable = await prisma.table.update({
      where: { id: body.id },
      data: {
        table_number: parseInt(body.table_number, 10),
        status: body.status,
      },
    });
    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error("PUT Table Error:", error);
    return NextResponse.json({ error: "Gagal mengubah meja" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    await prisma.table.delete({
      where: { id: body.id },
    });
    return NextResponse.json({ message: "Meja berhasil dihapus" });
  } catch (error) {
    console.error("DELETE Table Error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus meja. Pastikan meja tidak sedang terisi." },
      { status: 500 },
    );
  }
}
