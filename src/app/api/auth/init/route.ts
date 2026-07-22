import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const defaultUsers = [
      { username: "owner", password: "owner123", role: "OWNER" },
      { username: "kasir", password: "kasir123", role: "KASIR" },
      { username: "koki", password: "koki123", role: "KOKI" },
      { username: "pelayan", password: "pelayan123", role: "PELAYAN" },
    ];

    for (const user of defaultUsers) {
      const existingUser = await prisma.user.findFirst({
        where: { username: user.username },
      });

      if (!existingUser) {
        // Abaikan error tipe enum dengan ts-ignore jika schema Prisma Anda menggunakan huruf kapital untuk Role
        // @ts-ignore
        await prisma.user.create({ data: user });
      }
    }

    return NextResponse.json({
      message: "Akun default berhasil diinisialisasi",
    });
  } catch (error) {
    console.error("Init Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat akun default" },
      { status: 500 },
    );
  }
}
