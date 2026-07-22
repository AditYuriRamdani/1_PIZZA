"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
  };

  const handleEditClick = (category: Category) => {
    setEditId(category.id);
    setName(category.name);
  };

  const handleDelete = async (id: number, catName: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus kategori "${catName}"?`,
    );
    if (!confirmDelete) return;

    const toastId = toast.loading("Menghapus kategori...");

    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success(`Kategori "${catName}" berhasil dihapus!`, {
          id: toastId,
        });
        fetchCategories();
      } else {
        toast.error(
          "Gagal menghapus kategori. Pastikan tidak ada menu yang memakai kategori ini.",
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
      editId ? "Memperbarui kategori..." : "Menyimpan kategori...",
    );

    try {
      const payload = { id: editId, name };
      const method = editId ? "PUT" : "POST";

      const res = await fetch("/api/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          editId
            ? "Kategori berhasil diperbarui!"
            : "Kategori baru berhasil ditambah!",
          { id: toastId },
        );
        resetForm();
        fetchCategories();
      } else {
        toast.error("Gagal menyimpan kategori.", { id: toastId });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Manajemen Kategori
          </h1>
          <p className="text-slate-500 font-medium">
            Kelola pengelompokan hidangan restoran Anda secara penuh (CRUD).
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
                {editId ? "✏️ Edit Kategori" : "Tambah Kategori"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 block">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Cth: Pizza"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>

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
                        ? "Update Kategori"
                        : "+ Simpan Kategori"}
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
                Daftar Kategori
              </h2>

              {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <p className="text-lg font-medium">
                    Belum ada kategori yang terdaftar.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex flex-col p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                    >
                      <h3 className="font-bold text-slate-800 text-lg mb-4">
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-auto">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm py-2 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
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
