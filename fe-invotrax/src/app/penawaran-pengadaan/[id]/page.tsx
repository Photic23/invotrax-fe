"use client";

import { useParams } from "next/navigation";
import UpdatePenawaranPengadaanForm from "@/components/update-penawaran-pengadaan-form";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/ui/navbar";

export default function EditPenawaranPengadaanPage() {
  const params = useParams();
  const penawaranId = parseInt(params.id as string);
  const { logout } = useAuth();

  return (
    <ProtectedRoute requiredRole="vendor">
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
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </Link>
            </div>
          </div>
        </header>
        <div className="container py-8">
          <UpdatePenawaranPengadaanForm penawaranId={penawaranId} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
