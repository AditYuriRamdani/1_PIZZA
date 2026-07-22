"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      window.location.href = "/login";
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 text-white">
      <p className="text-xl font-bold animate-pulse">
        Sedang keluar dari sistem...
      </p>
    </div>
  );
}
