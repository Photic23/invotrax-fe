"use client";

import KontrakTable from "@/components/kontrak-table";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/ui/navbar";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function KontrakPage() {
  const { logout, getToken } = useAuth();
  return (
    <ProtectedRoute requiredRole={["manager"]}>
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
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <div className="space-y-4 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Daftar Kontrak</h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Daftar kontrak yang telah Anda buat. Tekan kode kontrak untuk melihat detail kontrak.
              </p>
            </div>

            {/* Tombol Buat Kontrak Baru */}
            <Link href="/kontrak/create">
              <Button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
                Buat Kontrak Baru
              </Button>
            </Link>
          </div>
          <KontrakTable />
        </div>
      </div>
    </ProtectedRoute>
  );
}
