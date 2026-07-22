import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET Category Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kategori" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCategory = await prisma.category.create({
      data: { name: body.name },
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("POST Category Error:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan kategori" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updatedCategory = await prisma.category.update({
      where: { id: body.id },
      data: { name: body.name },
    });
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("PUT Category Error:", error);
    return NextResponse.json(
      { error: "Gagal mengubah kategori" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    await prisma.category.delete({
      where: { id: body.id },
    });
    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json(
      {
        error:
          "Gagal menghapus kategori. Pastikan tidak ada menu di kategori ini.",
      },
      { status: 500 },
    );
  }
}
