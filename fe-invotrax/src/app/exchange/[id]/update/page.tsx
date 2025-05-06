"use client";

import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/ui/navbar";
import UpdateExchangeRequestForm from "@/components/update-exchange-request-form";

export default function EditExchangeRequestPage() {
    const params = useParams();
    const exchangeId = parseInt(params.id as string);
    const { logout } = useAuth();

    return (
        <ProtectedRoute requiredRole={["staff", "customer"]}>
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
            <div className="container py-8">
            <UpdateExchangeRequestForm exchangeId={exchangeId} />
            </div>
        </div>
        </ProtectedRoute>
    );
}
