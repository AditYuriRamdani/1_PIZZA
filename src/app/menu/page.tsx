"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast"; // <-- Import toast

interface Category {
  id: number;
  name: string;
}

interface Menu {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category: { name: string };
  is_available: boolean;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchMenus();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
    }
  };

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menus");
      if (res.ok) setMenus(await res.json());
    } catch (error) {
      console.error("Gagal mengambil menu:", error);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setIsAvailable(true);
  };

  const handleEditClick = (menu: Menu) => {
    setEditId(menu.id);
    setName(menu.name);
    setDescription(menu.description || "");
    setPrice(menu.price.toString());
    setCategoryId(menu.category_id.toString());
    setIsAvailable(menu.is_available);
  };

  const handleDelete = async (id: number, menuName: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus menu "${menuName}"?`,
    );
    if (!confirmDelete) return;

    // Toast Loading saat proses hapus berjalan
    const toastId = toast.loading("Menghapus menu...");

    try {
      const res = await fetch("/api/menus", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success(`Menu "${menuName}" berhasil dihapus!`, { id: toastId });
        fetchMenus();
      } else {
        toast.error("Gagal menghapus! Menu mungkin terikat pesanan.", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.", { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const toastId = toast.loading(
      editId ? "Memperbarui menu..." : "Menyimpan menu baru...",
    );

    try {
      const payload = {
        id: editId,
        name: name,
        description: description,
        price: parseFloat(price),
        category_id: parseInt(categoryId, 10),
        is_available: isAvailable,
      };

      const method = editId ? "PUT" : "POST";

      const res = await fetch("/api/menus", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          editId ? "Menu berhasil diperbarui!" : "Menu baru berhasil ditambah!",
          { id: toastId },
        );
        resetForm();
        fetchMenus();
      } else {
        toast.error("Gagal menyimpan menu. Periksa input Anda.", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Manajemen Menu
          </h1>
          <p className="text-slate-500 font-medium">
            Kelola daftar hidangan, harga, dan ketersediaan restoran Anda
            (CRUD).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div
              className={`bg-white rounded-3xl shadow-xl p-8 border sticky top-8 transition-all ${
                editId
                  ? "border-amber-400 shadow-amber-200/50"
                  : "border-slate-100 shadow-slate-200/50"
              }`}
            >
              <h2 className="text-2xl font-bold mb-6 text-slate-800">
                {editId ? "✏️ Edit Menu" : "Tambah Menu"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 block">
                    Nama Hidangan
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Cth: Pepperoni Pizza"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 block">
                    Kategori
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled>
                      Pilih Kategori...
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 block">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Cth: 75000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 block">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Cth: Pizza dengan ekstra keju..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                  ></textarea>
                </div>

                {editId && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 block">
                      Status Ketersediaan
                    </label>
                    <select
                      value={isAvailable ? "true" : "false"}
                      onChange={(e) =>
                        setIsAvailable(e.target.value === "true")
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer font-bold"
                    >
                      <option value="true">TERSEDIA</option>
                      <option value="false">HABIS</option>
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
                        ? "Update Menu"
                        : "+ Simpan Menu"}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">
                Daftar Menu Tersedia
              </h2>

              {menus.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <p className="text-lg font-medium">
                    Belum ada menu yang ditambahkan
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menus.map((menu) => (
                    <div
                      key={menu.id}
                      className="group flex flex-col justify-between p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-orange-200 hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-800 text-lg">
                            {menu.name}
                          </h3>
                          {!menu.is_available && (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                              Habis
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-2">
                          {menu.category?.name || "Kategori"}
                        </p>
                        <p className="text-orange-600 font-extrabold">
                          Rp {menu.price.toLocaleString("id-ID")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => handleEditClick(menu)}
                          className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm py-2 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(menu.id, menu.name)}
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
