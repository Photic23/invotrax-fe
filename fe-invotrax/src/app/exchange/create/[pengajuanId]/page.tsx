"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/ui/navbar";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import CreateExchangeRequestForm from "@/components/create-exchange-request-form";
import { useParams } from "next/navigation";

export default function CreateExchangeRequestPage() {
    const params = useParams();
    const pengajuanId = parseInt(params.pengajuanId as string);
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
                <Navbar></Navbar>
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
            <div className="container py-8">
            <CreateExchangeRequestForm pengajuanId={pengajuanId}/>
            </div>
        </div>
        </ProtectedRoute>
    );
}
