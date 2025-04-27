import React from 'react';
import { Timer, Truck, X, Check } from "lucide-react";

interface WarrantyStatusProps {
    warranty_status: string;
}

const WarrantyStatus: React.FC<WarrantyStatusProps> = ({ warranty_status }) => {
    
    const getWarrantyStatus = (warranty_status: string) => {
        switch (warranty_status) {
            case "Berlaku":
                return { label: "Berlaku", icon: <Timer size={16} strokeWidth={1.5}/> };
            case "Habis":
                return { label: "Habis", icon: <X size={16} strokeWidth={1.5}/> };
            default:
                return { label: "Unknown", icon: <X size={16} strokeWidth={1.5}/> }; // Default case to handle unexpected values
        }
    }

    const statusDetails = getWarrantyStatus(warranty_status);

    return (
        <div className="flex gap-2 items-center">
            {statusDetails.icon} 
            <p className="text-sm font-bold">{statusDetails.label}</p>
        </div>
    );
};

export default WarrantyStatus;

