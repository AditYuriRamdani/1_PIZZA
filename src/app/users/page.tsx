"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface User {
  id: number;
  username: string;
  role: "OWNER" | "PELAYAN" | "KOKI" | "KASIR";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("KASIR");
  const [editId, setEditId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data karyawan:", error);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setUsername("");
    setPassword("");
    setRole("KASIR");
  };

  const handleEditClick = (user: User) => {
    setEditId(user.id);
    setUsername(user.username);
    setPassword(""); // Kosongkan agar password lama tidak tertimpa tanpa sengaja
    setRole(user.role);
  };

  const handleDelete = async (id: number, uname: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus akun "${uname}"?`,
    );
    if (!confirmDelete) return;

    const toastId = toast.loading("Menghapus staf...");

    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success(`Akun "${uname}" berhasil dihapus!`, { id: toastId });
        fetchUsers();
      } else {
        toast.error(
          "Gagal menghapus staf. Akun ini mungkin memiliki riwayat transaksi/pesanan.",
          { id: toastId },
        );
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.", { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const toastId = toast.loading(
      editId ? "Memperbarui staf..." : "Menyimpan staf...",
    );

    try {
      const payload: any = { id: editId, username, role };
      if (password) {
        payload.password = password;
      }

      const method = editId ? "PUT" : "POST";

      const res = await fetch("/api/users", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          editId
            ? "Staf berhasil diperbarui!"
            : "Staf baru berhasil didaftarkan!",
          { id: toastId },
        );
        resetForm();
        fetchUsers();
      } else {
        toast.error("Gagal menyimpan karyawan. Username mungkin sudah ada.", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "KASIR":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PELAYAN":
        return "bg-teal-100 text-teal-700 border-teal-200";
      case "KOKI":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Manajemen Karyawan
          </h1>
          <p className="text-slate-500 font-medium">
            Kelola akses dan peran staf restoran La Famiglia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div
              className={`bg-white rounded-3xl shadow-xl p-8 border sticky top-8 transition-all ${
                editId
                  ? "border-amber-400 shadow-amber-200/50"
                  : "border-slate-100 shadow-slate-200/50"
              }`}
            >
              <h2 className="text-xl font-bold mb-6 text-slate-800">
                {editId ? "✏️ Edit Staf" : "Registrasi Staf"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 block">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Cth: adit_kasir"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 block">
                    Password{" "}
                    {editId && (
                      <span className="text-xs text-slate-400 font-normal">
                        (Kosongkan jika tidak diubah)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    required={!editId}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editId ? "•••••••• (Rahasia)" : "••••••••"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 block">
                    Peran (Role)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all cursor-pointer font-bold"
                  >
                    <option value="KASIR">KASIR</option>
                    <option value="PELAYAN">PELAYAN</option>
                    <option value="KOKI">KOKI</option>
                    <option value="OWNER">OWNER</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 text-white font-bold rounded-xl px-4 py-4 shadow-lg transform transition-all active:scale-95 disabled:opacity-70 ${
                      editId
                        ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
                        : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/30"
                    }`}
                  >
                    {isLoading
                      ? "Menyimpan..."
                      : editId
                        ? "Update Staf"
                        : "+ Daftarkan Staf"}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
              <h2 className="text-xl font-bold mb-6 text-slate-800">
                Daftar Akun Karyawan
              </h2>

              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <p className="text-lg font-medium">
                    Belum ada staf yang terdaftar.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border shadow-sm ${getRoleColor(user.role)}`}
                        >
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-none mb-1">
                            {user.username}
                          </h3>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md ${getRoleColor(user.role)}`}
                          >
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm py-2 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm py-2 rounded-lg transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
