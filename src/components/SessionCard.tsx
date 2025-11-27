import React from 'react';

interface SessionCardProps {
    thumbnailUrl?: string;
    title: string;
    totalSentences: number;
    progress: number; // Percentage 0-100
    timeLeft: string;
    onClick?: () => void;
}

export default function SessionCard({
    thumbnailUrl,
    title,
    totalSentences,
    progress,
    timeLeft,
    onClick,
}: SessionCardProps) {
    return (
        <div className="flex items-start gap-4 w-full">
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

                {/* Progress */}
                <div className="flex items-center gap-2 w-full">
                    <div className="w-full h-1 bg-[#d8d8d8] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#a5d592] rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-sm font-medium text-black">{progress}%</span>
                </div>

                {/* Action Button */}
                <button
                    onClick={onClick}
                    className="bg-neutral-200 hover:bg-neutral-300 transition-colors rounded-xl py-2 px-2.5 flex items-center justify-center w-fit"
                >
                    <span className="text-sm font-medium text-[#3f3f3f]">계속 학습하기</span>
                </button>
            </div>
        </div>
    );
}
