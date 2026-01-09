import React from "react";

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
  sentenceCount,
  onClick,
  onMouseEnter,
}: VideoCardProps) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="flex flex-col gap-1 group cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div
        className="relative w-full aspect-video rounded-md overflow-hidden"
        style={{ backgroundColor: "#dfdedb" }}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-sm font-medium"
            style={{ color: "#908f8c" }}
          >
            No Image
          </div>
        )}

        {/* Tags on Thumbnail */}
        <div className="absolute top-1 right-1 flex gap-1.5">
          {sentenceCount !== undefined && (
            <span
              className="px-1 py-1 rounded-md text-xs font-regular"
              style={{ backgroundColor: "#0c0b09", color: "#ffffff" }}
            >
              {sentenceCount}문장
            </span>
          )}
        </div>

        {/* Duration Badge */}
        <div
          className="absolute bottom-1 right-1 px-1 py-1 rounded-md text-xs font-regular"
          style={{ backgroundColor: "#0c0b09", color: "#ffffff" }}
        >
          {duration}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col gap-1">
        <h3
          className="text-sm font-bold leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity"
          style={{ color: "#0c0b09" }}
        >
          {title}
        </h3>

        {description && (
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: "#908f8c" }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
