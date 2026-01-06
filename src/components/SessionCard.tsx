import React from "react";

interface SessionCardProps {
  thumbnailUrl?: string;
  title: string;
  description?: string;
  totalSentences?: number;
  timeLeft?: string;
  progress?: number;
  onClick?: () => void;
  isEditMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  onMouseEnter?: () => void;
}

export default function SessionCard({
  thumbnailUrl,
  title,
  onClick,
  isEditMode = false,
  isSelected = false,
  onToggleSelection,
  onMouseEnter,
}: SessionCardProps) {
  return (
    <div
      className={`group flex gap-4 ${isEditMode ? "cursor-pointer" : ""}`}
      onClick={isEditMode ? onToggleSelection : undefined}
      onMouseEnter={onMouseEnter}
    >
      {/* Edit Checkbox */}
      {isEditMode && (
        <div className="flex items-center justify-center shrink-0">
          <div
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
            style={{
              backgroundColor: isSelected ? "#b45000" : "#ffffff",
              borderColor: isSelected ? "#b45000" : "#dfdedb",
            }}
          >
            {isSelected && (
              <svg
                width="14"
                height="11"
                viewBox="0 0 14 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5.5L5 9.5L13 1.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Thumbnail with Hover Overlay */}
      <div
        className="relative w-[160px] h-[90px] rounded-lg overflow-hidden shrink-0"
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
            className="w-full h-full flex items-center justify-center text-xs font-medium"
            style={{ color: "#908f8c" }}
          >
            No Image
          </div>
        )}

        {/* Hover Overlay with Start Button */}
        {!isEditMode && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            style={{ backgroundColor: "rgba(12, 11, 9, 0.6)" }}
            onClick={onClick}
          >
            <button
              className="rounded-lg text-sm font-semibold"
              style={{
                padding: "8px 12px",
                backgroundColor: "#ffffff",
                color: "#0c0b09",
              }}
            >
              시작
            </button>
          </div>
        )}
      </div>

      {/* Info Column */}
      <div className="flex flex-col justify-center flex-1 min-w-0 gap-1">
        <h3
          className="text-base font-semibold line-clamp-2 leading-snug"
          style={{ color: "#0c0b09" }}
        >
          {title}
        </h3>
        <p className="text-sm" style={{ color: "#908f8c" }}>
          이 영상으로 마저 공부할까요?
        </p>
      </div>
    </div>
  );
}
