"use client";

import { useParams } from "next/navigation";
import UpdateProductForm from "@/components/update-produk-form";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/ui/navbar";

export default function EditProductPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
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
        <div className="container py-8">
          <UpdateProductForm productId={productId} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
