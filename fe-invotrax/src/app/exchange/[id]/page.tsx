"use client";

import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/ui/navbar";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ExchangeRequestDetail from "@/components/detail-exchange-request";

export default function ExchangeRequestPage() {
    const params = useParams();
    const requestId = parseInt(params.id as string);
    const { logout } = useAuth();

    return (
        <ProtectedRoute requiredRole={["staff", "customer", "admin", "manager"]}>
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
                {/* Main Content */}
                <main className="container mx-auto py-8">
                    <ExchangeRequestDetail exchangeId={requestId} />
                </main>
            </div>
        </ProtectedRoute>
    );
}
