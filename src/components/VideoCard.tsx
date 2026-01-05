import React, { useState } from "react";

interface VideoCardProps {
  thumbnailUrl?: string;
  title: string;
  duration: string;
  description: string;
  sentenceCount?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

export default function VideoCard({
  thumbnailUrl,
  title,
  duration,
  description,
  sentenceCount = 275, // Default mock value if not provided
  onClick,
  onMouseEnter,
}: VideoCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="flex flex-col gap-3 group cursor-pointer transition-all duration-300"
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-secondary-300 shadow-sm">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary-500 font-medium bg-secondary-200">
            No Image
          </div>
        )}
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[12px] font-bold text-white tracking-wider">
          {duration}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col">
        <h3 className="text-base font-bold text-neutral-900 leading-snug line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-medium text-secondary-500">
            <span>{sentenceCount}문장</span>
            <span className="w-1 h-1 rounded-full bg-secondary-500" />
            <span>{duration.split(":")[0]}분</span>
          </div>

          {description && (
            <div className="relative">
              <p
                className="text-sm text-secondary-500 leading-normal mt-0.5 font-normal line-clamp-3"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {description}
              </p>

              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute left-0 top-full mt-2 w-full bg-neutral-900 text-white text-sm rounded-lg p-3 shadow-lg z-50 pointer-events-none">
                  <div className="leading-relaxed">{description}</div>
                  {/* Tooltip Arrow */}
                  <div className="absolute bottom-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-neutral-900"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
