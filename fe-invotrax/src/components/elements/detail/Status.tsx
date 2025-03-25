import React from 'react';
import { Timer, Truck, X, Check } from "lucide-react";

export type DetailPengadaanStatus = "diajukan" | "diproses" | "dikirim" | "diterima" | "ditolak";

interface StatusProps {
    status: string;
}

const Status: React.FC<StatusProps> = ({ status }) => {
    
    const getDetailPengadaanStatus = (status: string) => {
        switch (status) {
            case "diajukan":
                return { label: "Diajukan", icon: <Timer size={16} strokeWidth={1.5}/> };
            case "diproses":
                return { label: "Diproses", icon: <Timer size={16} strokeWidth={1.5}/> };
            case "dikirim":
                return { label: "Dikirim", icon: <Truck size={16} strokeWidth={1.5}/> };
            case "diterima":
                return { label: "Diterima", icon: <Check size={16} strokeWidth={1.5}/> };
            case "ditolak":
                return { label: "Ditolak", icon: <X size={16} strokeWidth={1.5}/> };
            default:
                return { label: "Unknown", icon: <Timer size={16} strokeWidth={1.5}/> }; // Default case to handle unexpected values
        }
    }

    const statusDetails = getDetailPengadaanStatus(status);

    return (
        <div className="flex gap-2 items-center">
            {statusDetails.icon} 
            <p className="text-sm font-bold">{statusDetails.label}</p>
        </div>
    );
};

export default Status;

