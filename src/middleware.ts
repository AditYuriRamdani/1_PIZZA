import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authSession = request.cookies.get("auth_session")?.value;
  const path = request.nextUrl.pathname;

  // Bebaskan halaman login dan API autentikasi
  if (path.startsWith("/api/auth") || path === "/login" || path === "/logout") {
    return NextResponse.next();
  }

  // Jika tidak ada cookie, usir ke halaman login
  if (!authSession) {
    if (!path.startsWith("/api")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Hak Akses (Role-Based Access Control)
  try {
    const user = JSON.parse(authSession);

    // Koki hanya boleh buka layar dapur
    if (user.role === "KOKI" && path !== "/dapur") {
      return NextResponse.redirect(new URL("/dapur", request.url));
    }

    // Kasir tidak boleh buka dashboard omzet & data karyawan
    if (
      user.role === "KASIR" &&
      (path.startsWith("/owner") || path.startsWith("/users"))
    ) {
      return NextResponse.redirect(new URL("/kasir", request.url));
    }
  } catch (e) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
