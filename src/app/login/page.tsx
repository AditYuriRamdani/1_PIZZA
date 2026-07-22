"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Skrip ini otomatis berjalan di latar belakang untuk membuatkan akun default jika belum ada
  useEffect(() => {
    fetch("/api/auth/init").catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Memeriksa kredensial...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        toast.success("Login berhasil!", { id: toastId });
        window.location.href = "/";
      } else {
        const data = await res.json();
        toast.error(data.error, { id: toastId });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 font-sans p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-y-auto max-h-screen">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🍕</div>
          <h1 className="text-3xl font-extrabold text-red-700 tracking-tight">
            La Famiglia
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Masuk ke sistem manajemen
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all"
              placeholder="Masukkan username Anda"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95 disabled:opacity-70"
          >
            {isLoading ? "Memproses..." : "MASUK SEKARANG"}
          </button>
        </form>

        {/* Kotak Informasi Akun Default */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
          <p className="font-bold text-slate-700 mb-2 border-b border-slate-200 pb-2">
            📋 Informasi Akun Default:
          </p>
          <ul className="space-y-2 text-slate-600 font-medium">
            <li className="flex justify-between">
              <span>Role Owner:</span>{" "}
              <span className="font-bold text-red-600">owner / owner123</span>
            </li>
            <li className="flex justify-between">
              <span>Role Kasir:</span>{" "}
              <span className="font-bold text-blue-600">kasir / kasir123</span>
            </li>
            <li className="flex justify-between">
              <span>Role Koki:</span>{" "}
              <span className="font-bold text-orange-600">koki / koki123</span>
            </li>
            <li className="flex justify-between">
              <span>Role Pelayan:</span>{" "}
              <span className="font-bold text-teal-600">
                pelayan / pelayan123
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
