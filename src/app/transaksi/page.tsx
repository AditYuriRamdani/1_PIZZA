"use client";

import { useState, useEffect } from "react";

interface OrderItem {
  quantity: number;
  menu: { name: string; price: number };
}

interface Order {
  id: number;
  status: string;
  table_id: number;
  table: { table_number: number };
  items: OrderItem[];
}

interface User {
  id: number;
  username: string;
}

// Tambahan interface untuk menyimpan data struk
interface ReceiptData {
  order: Order;
  total: number;
  paymentMethod: string;
  kasirName: string;
  date: string;
}

export default function TransactionPage() {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isLoading, setIsLoading] = useState(false);

  // State untuk menyimpan data struk yang akan dicetak
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orderRes, userRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/users"),
      ]);

      if (orderRes.ok) {
        const data = await orderRes.json();
        setActiveOrders(data.filter((o: Order) => o.status !== "SELESAI"));
      }
      if (userRes.ok) {
        setUsers(await userRes.json());
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce(
      (total, item) => total + item.menu.price * item.quantity,
      0,
    );
  };

  const handlePayment = async (order: Order) => {
    if (!selectedUser) {
      alert(
        "Harap pilih Kasir yang bertugas di menu dropdown atas terlebih dahulu!",
      );
      return;
    }

    const confirmPayment = window.confirm(
      `Selesaikan tagihan untuk Meja ${order.table.table_number}?`,
    );
    if (!confirmPayment) return;

    setIsLoading(true);
    const totalAmount = calculateTotal(order.items);
    const kasirInfo = users.find((u) => u.id.toString() === selectedUser);

    try {
      const payload = {
        order_id: order.id,
        table_id: order.table_id,
        user_id: parseInt(selectedUser, 10),
        total_amount: totalAmount,
        payment_method: paymentMethod,
      };

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // 1. Siapkan data untuk struk
        setReceiptData({
          order: order,
          total: totalAmount,
          paymentMethod: paymentMethod,
          kasirName: kasirInfo?.username || "Kasir",
          date: new Date().toLocaleString("id-ID"),
        });

        // 2. Refresh data meja
        fetchData();

        // 3. Panggil jendela print browser setelah komponen struk dirender (delay 100ms)
        setTimeout(() => {
          window.print();
        }, 100);
      } else {
        alert("Gagal memproses pembayaran.");
      }
    } catch (error) {
      console.error("Error bayar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 
        BAGIAN 1: UI DASHBOARD KASIR 
        Class "print:hidden" akan menyembunyikan semua ini saat proses cetak berjalan
      */}
      <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800 print:hidden">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                💳 Kasir & Pembayaran
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Selesaikan tagihan pelanggan dan cetak struk pembayaran.
              </p>
            </div>
            <div className="flex gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                  Kasir Bertugas
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-green-500 font-semibold"
                >
                  <option value="" disabled>
                    Pilih Kasir...
                  </option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                  Metode Bayar
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-green-500 font-semibold"
                >
                  <option value="CASH">CASH (Tunai)</option>
                  <option value="QRIS">QRIS</option>
                  <option value="DEBIT">KARTU DEBIT</option>
                </select>
              </div>
            </div>
          </div>

          {activeOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl shadow-sm border border-slate-200">
              <span className="text-6xl mb-4 opacity-50">🧾</span>
              <p className="text-2xl font-bold">Tidak ada tagihan tertunda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map((order) => {
                const total = calculateTotal(order.items);
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col"
                  >
                    <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h2 className="text-xl font-black text-slate-800">
                        Meja {order.table.table_number}
                      </h2>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                        {order.status}
                      </span>
                    </div>

                    <div className="p-5 flex-1 overflow-y-auto">
                      <ul className="space-y-3">
                        {order.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between items-start text-sm"
                          >
                            <span className="font-semibold text-slate-700">
                              {item.quantity}x {item.menu.name}
                            </span>
                            <span className="font-bold text-slate-900">
                              Rp{" "}
                              {(item.menu.price * item.quantity).toLocaleString(
                                "id-ID",
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 bg-slate-900 text-white mt-auto">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-400 font-bold">
                          Total Tagihan
                        </span>
                        <span className="text-2xl font-black">
                          Rp {total.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <button
                        onClick={() => handlePayment(order)}
                        disabled={isLoading}
                        className="w-full bg-green-500 hover:bg-green-600 text-slate-900 font-black py-4 rounded-xl transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          "Memproses..."
                        ) : (
                          <>🖨️ BAYAR & CETAK STRUK</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 
        BAGIAN 2: FORMAT CETAK STRUK (THERMAL PRINTER)
        Class "hidden print:block" membuatnya tidak terlihat di layar monitor,
        tapi akan muncul dan menyesuaikan kertas saat diprint.
      */}
      {receiptData && (
        <div className="hidden print:block font-mono text-black w-[80mm] mx-auto bg-white p-4 text-sm">
          <div className="text-center mb-4">
            <h1 className="font-black text-xl mb-1">LA FAMIGLIA PIZZERIA</h1>
            <p className="text-xs">Jl. Dipatiukur No. 112, Coblong</p>
            <p className="text-xs">Bandung, Jawa Barat</p>
          </div>

          <div className="border-t-2 border-dashed border-black py-2 mb-2 text-xs">
            <div className="flex justify-between">
              <span>Tanggal</span>
              <span>{receiptData.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir</span>
              <span>{receiptData.kasirName}</span>
            </div>
            <div className="flex justify-between">
              <span>Meja</span>
              <span>{receiptData.order.table.table_number}</span>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-black py-2 mb-2">
            {receiptData.order.items.map((item, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-bold">{item.menu.name}</div>
                <div className="flex justify-between text-xs">
                  <span>
                    {item.quantity} x {item.menu.price.toLocaleString("id-ID")}
                  </span>
                  <span>
                    {(item.quantity * item.menu.price).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-black py-2 mb-4">
            <div className="flex justify-between font-black text-base">
              <span>TOTAL</span>
              <span>Rp {receiptData.total.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Tipe Bayar</span>
              <span>{receiptData.paymentMethod}</span>
            </div>
          </div>

          <div className="text-center text-xs mt-8">
            <p className="font-bold">Terima Kasih Atas Kunjungan Anda!</p>
            <p>Layanan Kritik & Saran: 0812-3456-7890</p>
            <p className="mt-4">*** CUSTOMER COPY ***</p>
          </div>
        </div>
      )}
    </>
  );
}
