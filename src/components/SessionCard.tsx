import React from 'react';

interface SessionCardProps {
    thumbnailUrl?: string;
    title: string;
    totalSentences: number;
    timeLeft: string;
    progress?: number;
    onClick?: () => void;
    isEditMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: () => void;
}

export default function SessionCard({
    thumbnailUrl,
    title,
    totalSentences,
    timeLeft,
    progress,
    onClick,
    isEditMode = false,
    isSelected = false,
    onToggleSelection,
}: SessionCardProps) {
    return (
        <div
            className={`flex items-start gap-4 w-full transition-all ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={isEditMode ? onToggleSelection : undefined}
        >
            {/* Edit Checkbox */}
            {isEditMode && (
                <div className="flex items-center justify-center h-[139px] shrink-0">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#ed752a] border-[#ed752a]' : 'border-neutral-300 bg-white'}`}>
                        {isSelected && (
                            <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 5.5L5 9.5L13 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                </div>
            )}

            {/* Thumbnail */}
            <div className="w-[191px] h-[139px] rounded-xl overflow-hidden shrink-0 relative bg-neutral-200">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/35 backdrop-blur-sm px-2 py-1.5 rounded-md">
                    <span className="text-white text-xs font-medium font-['SF_Pro_Display']">{timeLeft}</span>
                </div>
            </div>

            {/* Info Column */}
            <div className="flex flex-col gap-4 flex-1 min-w-0">
                {/* Title & Meta */}
                <div className="flex flex-col items-start w-full">
                    <h3 className="text-lg font-semibold text-black line-clamp-2 leading-tight mb-1 font-['SF_Pro_Display']">
                        {title}
                    </h3>
                    <p className="text-lg font-medium text-[#767676]">
                        {totalSentences}문장 · {timeLeft.split(':')[0]}분
                    </p>
                </div>

                {/* Action Button */}
                {!isEditMode && (
                    <button
                        onClick={onClick}
                        className="bg-neutral-200 hover:bg-neutral-300 transition-colors rounded-xl py-2 px-2.5 flex items-center justify-center w-fit"
                    >
                        <span className="text-sm font-medium text-[#3f3f3f]">계속 학습하기</span>
                    </button>
                )}
            </div>
        </div>
    );
}
