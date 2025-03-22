"use client";

import PenawaranTable from "@/components/penawaran-pengadaan-table";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/ui/navbar";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PenawaranPengadaanPage() {
  const { logout, getToken } = useAuth();
  return (
    <ProtectedRoute requiredRole="vendor">
      <div className="min-h-screen flex flex-col">
        {/* Navbar */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-bold text-xl">InvoTrax</Link>
              <Navbar />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={logout}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <div className="space-y-4 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Daftar Penawaran Pengadaan</h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Daftar penawaran yang telah Anda ajukan. Tekan baris untuk melihat detail penawaran.
              </p>
            </div>

            {/* Tombol Buat Penawaran Baru */}
            <Link href="/penawaran-pengadaan/create">
              <Button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
                Buat Penawaran Baru
              </Button>
            </Link>
          </div>
          <PenawaranTable />
        </div>
      </div>
    </ProtectedRoute>
  );
}
