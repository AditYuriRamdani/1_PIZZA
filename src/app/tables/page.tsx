"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Table {
  id: number;
  table_number: number;
  status: "TERSEDIA" | "TERISI" | "DIPESAN";
}

export default function TablePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [status, setStatus] = useState("TERSEDIA");
  const [editId, setEditId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/tables");
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data meja:", error);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTableNumber("");
    setStatus("TERSEDIA");
  };

  const handleEditClick = (table: Table) => {
    setEditId(table.id);
    setTableNumber(table.table_number.toString());
    setStatus(table.status);
  };

  const handleDelete = async (id: number, tNumber: number) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus Meja ${tNumber}?`,
    );
    if (!confirmDelete) return;

    const toastId = toast.loading("Menghapus meja...");

    try {
      const res = await fetch("/api/tables", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success(`Meja ${tNumber} berhasil dihapus!`, { id: toastId });
        fetchTables();
      } else {
        toast.error(
          "Gagal menghapus meja. Meja mungkin sedang memiliki riwayat pesanan aktif.",
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
      editId ? "Memperbarui meja..." : "Menyimpan meja...",
    );

    try {
      const payload = {
        id: editId,
        table_number: tableNumber,
        status: status,
      };

      const method = editId ? "PUT" : "POST";

      const res = await fetch("/api/tables", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          editId ? "Meja berhasil diperbarui!" : "Meja baru berhasil ditambah!",
          { id: toastId },
        );
        resetForm();
        fetchTables();
      } else {
        toast.error(
          "Gagal menyimpan meja. Mungkin nomor meja sudah terdaftar.",
          { id: toastId },
        );
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TERSEDIA":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "TERISI":
        return "bg-red-100 text-red-700 border-red-200";
      case "DIPESAN":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Manajemen Meja
          </h1>
          <p className="text-slate-500 font-medium">
            Atur dan pantau ketersediaan meja restoran Anda secara langsung.
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
                {editId ? "✏️ Edit Meja" : "Tambah Meja Baru"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 block">
                    Nomor Meja
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Cth: 1, 2, 3..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all text-center text-lg font-bold"
                  />
                </div>

                {editId && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 block">
                      Status Meja
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer font-bold"
                    >
                      <option value="TERSEDIA">TERSEDIA</option>
                      <option value="DIPESAN">DIPESAN</option>
                      <option value="TERISI">TERISI</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 text-white font-bold rounded-xl px-4 py-4 shadow-lg transform transition-all active:scale-95 disabled:opacity-70 ${
                      editId
                        ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
                        : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-orange-500/30"
                    }`}
                  >
                    {isLoading
                      ? "Menyimpan..."
                      : editId
                        ? "Update Meja"
                        : "+ Tambah Meja"}
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
                Denah Meja
              </h2>

              {tables.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <p className="text-lg font-medium">
                    Belum ada meja yang terdaftar.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className={`relative flex flex-col p-4 rounded-2xl border-2 transition-all shadow-sm group ${getStatusColor(table.status)}`}
                    >
                      <div className="flex flex-col items-center justify-center mb-10">
                        <span className="text-sm font-bold opacity-70 mb-1">
                          MEJA
                        </span>
                        <span className="text-4xl font-black mb-2">
                          {table.table_number}
                        </span>
                        <span className="text-xs font-extrabold tracking-wider px-2 py-1 rounded-full bg-white/50 backdrop-blur-sm">
                          {table.status}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(table)}
                          className="flex-1 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs py-2 rounded shadow-sm backdrop-blur-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(table.id, table.table_number)
                          }
                          className="flex-1 bg-white/80 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold text-xs py-2 rounded shadow-sm backdrop-blur-sm"
                        >
                          Del
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
