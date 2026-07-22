import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "La Famiglia Pizzeria",
  description: "Restaurant Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-100 text-gray-900 flex min-h-screen font-sans">
        <Toaster position="top-center" reverseOrder={false} />

        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-xl flex flex-col print:hidden">
          <div className="p-6 border-b text-center font-extrabold text-2xl text-red-700 tracking-tight">
            La Famiglia 🍕
          </div>
          <nav className="flex flex-col flex-1 p-4 gap-3 overflow-y-auto">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Menu Navigasi
            </p>

            <Link
              href="/"
              className="px-4 py-2 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors font-medium"
            >
              Manajemen Kategori
            </Link>
            <Link
              href="/menu"
              className="px-4 py-2 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors font-medium"
            >
              Manajemen Menu
            </Link>
            <Link
              href="/tables"
              className="px-4 py-2 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors font-medium"
            >
              Manajemen Meja
            </Link>
            <Link
              href="/users"
              className="px-4 py-2 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors font-medium"
            >
              Manajemen Karyawan
            </Link>
            <Link
              href="/kasir"
              className="px-4 py-2 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors font-medium"
            >
              POS (Kasir)
            </Link>
            <Link
              href="/dapur"
              className="px-4 py-2 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors font-medium"
            >
              Kitchen Display
            </Link>
            <Link
              href="/transaksi"
              className="px-4 py-2 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors font-medium"
            >
              💳 Pembayaran
            </Link>
            <Link
              href="/owner"
              className="px-4 py-2 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors font-medium"
            >
              Dashboard Analitik
            </Link>

            {/* Tombol Logout */}
            <div className="mt-auto pt-4 border-t border-slate-100">
              <Link
                href="/logout"
                className="block px-4 py-3 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl transition-colors font-bold text-center border border-slate-200"
              >
                🚪 Keluar Akun
              </Link>
            </div>
          </nav>
          <div className="p-4 border-t text-sm text-gray-500 text-center bg-slate-50">
            v1.0 - RMS System
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 h-screen overflow-y-auto relative">
          {children}
        </main>
      </body>
    </html>
  );
}
