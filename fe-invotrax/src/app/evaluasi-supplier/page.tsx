"use client";

import EvaluasiSupplierTable from "@/components/evaluasi-supplier-table";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/ui/navbar";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function EvaluasiSupplierPage() {
  const { logout } = useAuth();
  return (
    <ProtectedRoute requiredRole="manager">
      <div className="min-h-screen flex flex-col">
        {/* Navbar */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-bold text-xl">
                InvoTrax
              </Link>
              <Navbar />
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </Link>
            </div>
          </div>
        </header>

        <div className="space-y-4 p-6">
          <h1 className="text-4xl font-bold mb-6">Daftar Evaluasi Supplier</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Gunakan filter untuk memilih periode.
          </p>
          <EvaluasiSupplierTable />
        </div>
      </div>
    </ProtectedRoute>
  );
}