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
                return {
                    label: "Diajukan",
                    icon: <Timer size={16} strokeWidth={2}/>,
                    className: "bg-blue-100 text-blue-800"
                };
            case "diproses":
                return {
                    label: "Diproses",
                    icon: <Timer size={16} strokeWidth={2}/>,
                    className: "bg-yellow-100 text-yellow-800"
                };
            case "dikirim":
                return {
                    label: "Dikirim",
                    icon: <Truck size={16} strokeWidth={2}/>,
                    className: "bg-purple-100 text-purple-800"
                };
            case "diterima":
                return {
                    label: "Diterima",
                    icon: <Check size={16} strokeWidth={2}/>,
                    className: "bg-green-100 text-green-800"
                };
            case "ditolak":
                return {
                    label: "Ditolak",
                    icon: <X size={16} strokeWidth={2}/>,
                    className: "bg-red-100 text-red-800"
                };
            default:
                return {
                    label: "Unknown",
                    icon: <Timer size={16} strokeWidth={1.5}/>,
                    className: "bg-gray-100 text-gray-800"
                }; // Default case to handle unexpected values
        }
    };

    const statusDetails = getDetailPengadaanStatus(status);

    return (
        <div className={`flex gap-1 items-center px-2 py-1 rounded-lg text-sm font-bold ${statusDetails.className}`}>
            {statusDetails.icon}
            <p>{statusDetails.label}</p>
        </div>
    );
};

export default Status;
