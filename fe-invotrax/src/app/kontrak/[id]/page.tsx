"use client";

import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/ui/navbar";
import KontrakDetail from "@/components/kontrak-detail";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function DetailKontrakPage() {
  const params = useParams();
  const kontrakId = parseInt(params.id as string);
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
              <Navbar></Navbar>
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
        {/* Main Content */}
        <main className="container mx-auto py-8">
          <KontrakDetail kontrakId={kontrakId} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
