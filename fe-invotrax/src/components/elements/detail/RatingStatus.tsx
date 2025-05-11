import React from 'react';
import { Star, X, StarOff } from "lucide-react";

interface RatingStatusProps {
    rating: number;
}

const RatingStatus: React.FC<RatingStatusProps> = ({ rating }) => {
    
    const getRating = (rating: number) => {
        if (rating === 0) {
            return {
                label: "Belum Dinilai",
                icon: <StarOff size={16} strokeWidth={2}/>,
                className: "bg-yellow-100 text-yellow-800"
            };
        } else if (rating > 0) {
            return {
                label: rating,
                icon: <Star size={16} strokeWidth={2}/>,
                className: "bg-green-100 text-green-800"
            };
        } else {
            return {
                label: "Unknown",
                icon: <X size={16} strokeWidth={2}/>,
                className: "bg-gray-100 text-gray-800"
            }; // Default case to handle unexpected values
        }
    };

    const statusDetails = getRating(rating);

    return (
        <div className={`flex gap-1 items-center px-2 py-1 rounded-lg text-sm font-bold ${statusDetails.className}`}>
            {statusDetails.icon} 
            <p>{statusDetails.label}</p>
        </div>
    );
};

export default RatingStatus;
