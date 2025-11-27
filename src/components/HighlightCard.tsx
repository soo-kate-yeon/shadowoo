import React from 'react';

interface HighlightCardProps {
    highlightedSentence: string;
    userCaption?: string;
    onClick?: () => void;
}

export default function HighlightCard({
    highlightedSentence,
    userCaption,
    onClick,
}: HighlightCardProps) {
    return (
        <div onClick={onClick} className="flex flex-col gap-3 cursor-pointer">
            {/* Highlight Text */}
            <div className="flex gap-3 items-start h-auto">
                <div className="w-1 bg-[#fcdb4b] shrink-0 rounded-full self-stretch min-h-[24px]" />
                <p className="text-base font-normal text-black leading-snug pt-0.5">
                    {highlightedSentence}
                </p>
            </div>

            {/* User Note (if exists) */}
            {userCaption && (
                <div className="h-[18px] relative w-full pl-[26px]">
                    <div className="absolute left-[16px] top-0 w-[18px] h-[18px] flex items-center justify-center -ml-4">
                        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
                            <path d="M1 1 L1 10 L10 10" stroke="#D8D8D8" strokeWidth="2" strokeLinecap="square" />
                        </svg>
                    </div>
                    <p className="text-base font-normal text-[#767676] leading-tight font-['SF_Pro_Display']">
                        {userCaption}
                    </p>
                </div>
            )}
        </div>
    );
}
