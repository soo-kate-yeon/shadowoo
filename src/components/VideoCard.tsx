import React from 'react';

interface VideoCardProps {
    thumbnailUrl?: string;
    title: string;
    duration: string;
    description: string;
    sentenceCount?: number;
    onClick?: () => void;
}

export default function VideoCard({
    thumbnailUrl,
    title,
    duration,
    description,
    sentenceCount = 275, // Default mock value if not provided
    onClick,
}: VideoCardProps) {
    return (
        <div
            onClick={onClick}
            className="flex flex-col gap-4 group cursor-pointer"
        >
            {/* Thumbnail Container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-200">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
                )}
                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 bg-black/35 backdrop-blur-sm px-2 py-1.5 rounded-lg">
                    <span className="text-white text-sm font-medium">{duration}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1">
                <div className="flex items-end justify-between gap-2">
                    <h3 className="text-lg font-semibold text-black tracking-[0.5px] line-clamp-1 flex-1">
                        {title}
                    </h3>
                    <span className="text-lg font-medium text-black shrink-0">
                        {sentenceCount}문장 · {duration.split(':')[0]}분
                    </span>
                </div>
                <p className="text-sm font-medium text-[#767676] leading-tight line-clamp-2">
                    {description}
                </p>
            </div>
        </div>
    );
}
