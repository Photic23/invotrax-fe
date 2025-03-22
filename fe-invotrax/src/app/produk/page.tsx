"use client";

import ProductTable from "@/components/produk-table";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/ui/navbar";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function ProductPage() {
  const { logout } = useAuth();
  return (
    <ProtectedRoute requiredRole="staff">
      <div className="min-h-screen flex flex-col">
        {/* Navbar */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-bold text-xl">
                InvoTrax
              </Link>
              <Navbar></Navbar>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                onClick={logout}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </Link>
            </div>
          </div>
        </header>
        <div className="space-y-4 p-6">
        <h1 className="text-4xl font-bold mb-6">Daftar Produk</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Daftar produk yang tersedia. Tekan baris untuk melihat detail produk.
            </p>
          <ProductTable />
        </div>
      </div>
    </ProtectedRoute>
  );
}
