"use client";

import CreatePenawaranPengadaanForm from "@/components/create-pengajuan-penawaran-form";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/ui/navbar";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function CreatePenawaranPengadaanPage() {
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
              <button
                onClick={logout}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <div className="container py-8">
          <CreatePenawaranPengadaanForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
