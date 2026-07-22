"use client";

import { useState, useEffect } from "react";

interface Menu {
  id: number;
  name: string;
  price: number;
  is_available: boolean;
  category: { name: string };
}

interface Table {
  id: number;
  table_number: number;
  status: string;
}

interface User {
  id: number;
  username: string;
  role: string;
}

interface CartItem {
  menu_id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function POSPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, tableRes, userRes] = await Promise.all([
        fetch("/api/menus"),
        fetch("/api/tables"),
        fetch("/api/users"),
      ]);

      if (menuRes.ok) setMenus(await menuRes.json());
      if (tableRes.ok) setTables(await tableRes.json());
      if (userRes.ok) setUsers(await userRes.json());
    } catch (error) {
      console.error("Gagal mengambil data awal POS:", error);
    }
  };

  const addToCart = (menu: Menu) => {
    if (!menu.is_available) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.menu_id === menu.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.menu_id === menu.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prevCart,
        { menu_id: menu.id, name: menu.name, price: menu.price, quantity: 1 },
      ];
    });
  };

  const updateQuantity = (menu_id: number, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.menu_id === menu_id) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (!selectedTable || !selectedUser) {
      alert("Harap pilih Kasir/Pelayan dan Meja terlebih dahulu!");
      return;
    }
    if (cart.length === 0) {
      alert("Keranjang pesanan masih kosong!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        table_id: parseInt(selectedTable, 10),
        user_id: parseInt(selectedUser, 10),
        items: cart.map((item) => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Pesanan Berhasil Dibuat!");
        setCart([]);
        setSelectedTable("");
        fetchData(); // Refresh data meja agar meja yang baru dipesan tidak bisa dipilih lagi
      } else {
        alert("Gagal membuat pesanan.");
      }
    } catch (error) {
      console.error("Error saat checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hanya tampilkan meja yang tersedia
  const availableTables = tables.filter((t) => t.status === "TERSEDIA");

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row gap-6 p-4">
      {/* KIRI: Area Pemilihan Menu */}
      <div className="w-full md:w-2/3 bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100 flex flex-col h-[calc(100vh-40px)]">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">
          Menu Makanan
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
          {menus.map((menu) => (
            <div
              key={menu.id}
              onClick={() => addToCart(menu)}
              className={`relative flex flex-col justify-between p-5 rounded-2xl border-2 transition-all select-none ${
                menu.is_available
                  ? "bg-white border-slate-100 hover:border-red-500 hover:shadow-lg cursor-pointer active:scale-95"
                  : "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  {menu.category?.name || "Lainnya"}
                </span>
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2">
                  {menu.name}
                </h3>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-red-600 font-extrabold text-lg">
                  Rp {menu.price.toLocaleString("id-ID")}
                </p>
                {!menu.is_available && (
                  <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded">
                    Habis
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KANAN: Area Keranjang (Cart) & Checkout */}
      <div className="w-full md:w-1/3 bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100 flex flex-col h-[calc(100vh-40px)]">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">
          Detail Pesanan
        </h2>

        {/* Info Pemesan */}
        <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Staf Bertugas
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer font-semibold"
            >
              <option value="" disabled>
                Pilih Kasir/Pelayan...
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Nomor Meja
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer font-semibold"
            >
              <option value="" disabled>
                Pilih Meja Tersedia...
              </option>
              {availableTables.map((t) => (
                <option key={t.id} value={t.id}>
                  Meja {t.table_number}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Daftar Item Keranjang */}
        <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-2">🛒</span>
              <p className="font-medium">Keranjang masih kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.menu_id}
                className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-red-600 font-semibold text-xs mt-1">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                  <button
                    onClick={() => updateQuantity(item.menu_id, -1)}
                    className="text-slate-500 font-bold hover:text-red-600 px-1"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm min-w-[20px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.menu_id, 1)}
                    className="text-slate-500 font-bold hover:text-green-600 px-1"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total & Tombol Checkout */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <span className="font-bold text-slate-500">Total Harga:</span>
            <span className="font-black text-2xl text-slate-900">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isLoading || cart.length === 0}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black rounded-xl px-4 py-4 shadow-lg shadow-red-600/30 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Memproses..." : "PROSES PESANAN"}
          </button>
        </div>
      </div>
    </div>
  );
}
