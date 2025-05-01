import React from 'react';
import { Star, X, StarOff } from "lucide-react";

interface RatingStatusProps {
    rating: number;
}

const RatingStatus: React.FC<RatingStatusProps> = ({ rating }) => {
    
    const getRating = (rating: number) => {
        if (rating === 0) {
            return { label: "Belum Dinilai", icon: <StarOff size={16} strokeWidth={1.5}/> };
        } else if (rating > 0) {
            return { label: rating, icon: <Star size={16} strokeWidth={1.5}/> };
        } else {
            return { label: "Unknown", icon: <X size={16} strokeWidth={1.5}/> };
        }
    }

    const statusDetails = getRating(rating);

    return (
        <div className="flex gap-2 items-center">
            {statusDetails.icon} 
            <p className="text-sm font-bold">{statusDetails.label}</p>
        </div>
    );
};

export default RatingStatus;

