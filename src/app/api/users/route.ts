import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          notIn: ["owner", "kasir", "koki", "pelayan"],
        },
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET User Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data karyawan" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newUser = await prisma.user.create({
      data: {
        username: body.username,
        password: body.password,
        role: body.role,
      },
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("POST User Error:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan karyawan. Mungkin Username sudah dipakai." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const dataToUpdate: any = {
      username: body.username,
      role: body.role,
    };

    // Jika password diisi, update passwordnya. Jika kosong, biarkan password lama.
    if (body.password) {
      dataToUpdate.password = body.password;
    }

    const updatedUser = await prisma.user.update({
      where: { id: body.id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT User Error:", error);
    return NextResponse.json(
      { error: "Gagal mengubah data karyawan" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    await prisma.user.delete({
      where: { id: body.id },
    });
    return NextResponse.json({ message: "Karyawan berhasil dihapus" });
  } catch (error) {
    console.error("DELETE User Error:", error);
    return NextResponse.json(
      {
        error:
          "Gagal menghapus karyawan. Pastikan akun ini tidak terikat dengan transaksi.",
      },
      { status: 500 },
    );
  }
}
