"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Transaction {
  id: number;
  total_amount: number;
  payment_method: string;
  paid_at: string;
  kasir: { username: string };
  order: { table: { table_number: number } };
}

export default function OwnerDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Jalankan pengambilan data pertama kali
    fetchTransactions(true);

    // FITUR REAL-TIME: Ambil data terbaru dari database setiap 5 detik secara otomatis di latar belakang
    const interval = setInterval(() => {
      fetchTransactions(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data transaksi:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const totalOmzet = transactions.reduce((sum, t) => sum + t.total_amount, 0);
  const totalTransaksi = transactions.length;
  const rataRata = totalTransaksi > 0 ? totalOmzet / totalTransaksi : 0;

  const handleExportExcel = () => {
    if (transactions.length === 0) {
      toast.error("Tidak ada data untuk diunduh!");
      return;
    }

    const toastId = toast.loading("Menyiapkan laporan Excel...");

    try {
      const headers = [
        "ID Transaksi",
        "Tanggal",
        "Nama Kasir",
        "No Meja",
        "Metode Bayar",
        "Total (Rp)",
      ];

      const csvRows = transactions.map((t) => [
        t.id,
        `"${new Date(t.paid_at).toLocaleString("id-ID")}"`,
        t.kasir?.username || "Kasir",
        t.order?.table?.table_number || "-",
        t.payment_method,
        t.total_amount,
      ]);

      const csvContent = [
        headers.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const tanggalHariIni = new Date().toISOString().split("T")[0];
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Laporan_Omzet_LaFamiglia_${tanggalHariIni}.csv`,
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Laporan berhasil diunduh!", { id: toastId });
    } catch (error) {
      console.error("Error Export:", error);
      toast.error("Gagal mengunduh laporan", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              📈 Dashboard Owner
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Pantau performa pendapatan dan unduh laporan transaksi.
            </p>
          </div>

          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-green-600/30 transition-transform active:scale-95 flex items-center gap-2"
          >
            📊 UNDUH LAPORAN (EXCEL)
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 animate-pulse font-bold text-slate-400">
            Memuat data analitik...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
                <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Total Pendapatan
                </p>
                <h2 className="text-3xl font-black text-green-600">
                  Rp {totalOmzet.toLocaleString("id-ID")}
                </h2>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
                <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Total Transaksi Selesai
                </p>
                <h2 className="text-3xl font-black text-blue-600">
                  {totalTransaksi}{" "}
                  <span className="text-lg font-bold text-slate-400">
                    Pesanan
                  </span>
                </h2>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
                <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Rata-Rata Nilai Pesanan
                </p>
                <h2 className="text-3xl font-black text-orange-600">
                  Rp {Math.round(rataRata).toLocaleString("id-ID")}
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Riwayat Transaksi
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE UPDATE
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium">
                  Belum ada transaksi yang diselesaikan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                        <th className="pb-4 font-bold">ID</th>
                        <th className="pb-4 font-bold">Tanggal & Waktu</th>
                        <th className="pb-4 font-bold">Kasir</th>
                        <th className="pb-4 font-bold">Meja</th>
                        <th className="pb-4 font-bold">Metode</th>
                        <th className="pb-4 font-bold text-right">
                          Total Tagihan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium text-slate-700">
                      {transactions.map((t) => (
                        <tr
                          key={t.id}
                          className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4">#{t.id}</td>
                          <td className="py-4">
                            {new Date(t.paid_at).toLocaleString("id-ID")}
                          </td>
                          <td className="py-4">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">
                              {t.kasir?.username || "Kasir"}
                            </span>
                          </td>
                          <td className="py-4 font-bold text-slate-900">
                            Meja {t.order?.table?.table_number}
                          </td>
                          <td className="py-4">{t.payment_method}</td>
                          <td className="py-4 text-right font-black text-slate-900">
                            Rp {t.total_amount.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
