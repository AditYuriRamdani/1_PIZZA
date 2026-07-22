import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi ke database
    const user = await prisma.user.findFirst({
      where: {
        username: body.username,
        password: body.password,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Username atau password salah!" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });

    // Set sesi login di Cookie browser
    response.cookies.set({
      name: "auth_session",
      value: JSON.stringify({
        id: user.id,
        role: user.role,
        username: user.username,
      }),
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24, // Berlaku 24 jam
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
