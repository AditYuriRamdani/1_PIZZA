"use client";

import { useState, useEffect } from "react";

// Struktur data yang dikembalikan oleh API
interface OrderItem {
  id: number;
  quantity: number;
  menu: { name: string };
}

interface Order {
  id: number;
  status: "MENUNGGU" | "DIPROSES" | "SIAP_DISAJIKAN" | "SELESAI";
  created_at: string;
  table: { table_number: number };
  pelayan: { username: string };
  items: OrderItem[];
}

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh setiap 5 detik agar koki selalu mendapat pesanan terbaru
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        // Hanya tampilkan pesanan yang belum selesai
        const activeOrders = data.filter(
          (o: Order) => o.status === "MENUNGGU" || o.status === "DIPROSES",
        );
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error("Gagal mengambil data pesanan:", error);
    }
  };

  const updateStatus = async (orderId: number, newStatus: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
      } else {
        alert("Gagal mengubah status pesanan.");
      }
    } catch (error) {
      console.error("Error update status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 font-sans text-slate-100 rounded-3xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          🍳 Kitchen Display
        </h1>
        <p className="text-slate-400 font-medium">
          Pantau dan perbarui status pesanan secara real-time.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <span className="text-6xl mb-4">🍽️</span>
          <p className="text-2xl font-bold">Dapur Sedang Kosong</p>
          <p>Belum ada pesanan masuk...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`flex flex-col rounded-2xl shadow-xl overflow-hidden border-t-8 transition-all ${
                order.status === "MENUNGGU"
                  ? "bg-slate-800 border-red-500"
                  : "bg-slate-800 border-amber-400"
              }`}
            >
              {/* Header Tiket */}
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Meja {order.table.table_number}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {order.pelayan.username} • {formatTime(order.created_at)}
                  </p>
                </div>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    order.status === "MENUNGGU"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-amber-400/20 text-amber-300"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Daftar Makanan */}
              <div className="p-4 flex-1 overflow-y-auto">
                <ul className="space-y-3">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-start border-b border-slate-700/50 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="font-semibold text-lg leading-tight pr-4 text-slate-200">
                        {item.menu.name}
                      </span>
                      <span className="font-black text-xl text-white bg-slate-700 px-2 rounded">
                        x{item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tombol Aksi */}
              <div className="p-4 bg-slate-900/50">
                {order.status === "MENUNGGU" ? (
                  <button
                    disabled={isLoading}
                    onClick={() => updateStatus(order.id, "DIPROSES")}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black py-3 rounded-xl transition-colors"
                  >
                    MULAI MASAK
                  </button>
                ) : (
                  <button
                    disabled={isLoading}
                    onClick={() => updateStatus(order.id, "SIAP_DISAJIKAN")}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-black py-3 rounded-xl transition-colors"
                  >
                    MAKANAN SIAP
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
