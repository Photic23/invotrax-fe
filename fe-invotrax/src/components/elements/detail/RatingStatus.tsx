import React from 'react';
import { Star, X, StarOff } from "lucide-react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface RatingStatusProps {
    rating: number;
    deskripsi?: string;
}

const RatingStatus: React.FC<RatingStatusProps> = ({ rating, deskripsi }) => {
    
    const getRating = (rating: number) => {
        if (rating === 0) {
            return {
                label: "Belum Dinilai",
                icon: <StarOff size={16} strokeWidth={2}/>,
                className: "bg-yellow-100 text-yellow-800"
            };
        } else if (rating > 0) {
            return {
                label: `${rating} / 5`,
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
        <Dialog>
            <DialogTrigger asChild>
                <button
                className={`flex gap-1 items-center px-2 py-1 rounded-lg text-sm font-bold ${statusDetails.className}`}
                >
                {statusDetails.icon}
                <p>{statusDetails.label}</p>
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Penilaian</DialogTitle>
                <DialogDescription>
                    {rating === 0 && !deskripsi ? (
                        <span className="text-sm italic text-muted-foreground mt-2 block">
                        Belum ada penilaian.
                        </span>
                    ) : (
                        <span className="text-sm mt-2 block text-muted-foreground space-y-2">
                        <span className="text-black block">
                            <span className="font-semibold text-base">Rating:</span>{" "}
                            {rating > 0 ? `${rating} / 5` : "-"}
                        </span>

                        <span className="text-black block ">
                            <span className="font-semibold text-base">Deskripsi penilaian:</span>
                            <br />
                            {deskripsi ? (
                            deskripsi
                            ) : (
                            <span className="italic text-muted-foreground">
                                Tidak ada deskripsi penilaian.
                            </span>
                            )}
                        </span>
                        </span>
                    )}
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export default RatingStatus;
