import React from 'react';
import { BadgeCheck, X } from "lucide-react";

interface WarrantyStatusProps {
    warranty_status: string;
}

const WarrantyStatus: React.FC<WarrantyStatusProps> = ({ warranty_status }) => {

    const getWarrantyStatus = (warranty_status: string) => {
        switch (warranty_status) {
            case "Berlaku":
                return {
                    label: "Active",
                    icon: <BadgeCheck size={16} strokeWidth={2}/>,
                    className: "bg-green-100 text-green-800"
                };
            case "Habis":
                return {
                    label: "Expired",
                    icon: <X size={16} strokeWidth={2}/>,
                    className: "bg-red-100 text-red-800"
                };
            default:
                return {
                    label: "Unknown",
                    icon: <X size={16} strokeWidth={2}/>,
                    className: "bg-gray-100 text-gray-800"
                }; // Default case to handle unexpected values
        }
    };

    const statusDetails = getWarrantyStatus(warranty_status);

    return (
        <div className={`flex gap-1 items-center px-2 py-1 rounded-lg text-sm font-bold ${statusDetails.className}`}>
            {statusDetails.icon}
            <p>{statusDetails.label}</p>
        </div>
    );
};

export default WarrantyStatus;
