'use client';

interface SaveToggleProps {
    sentenceId: string;
    isSaved?: boolean;
    onToggle?: (sentenceId: string, isSaved: boolean) => void;
}

export default function SaveToggle({ sentenceId, isSaved = false, onToggle }: SaveToggleProps) {
    const handleToggle = () => {
        const newState = !isSaved;
        onToggle?.(sentenceId, newState);
    };

    return (
        <button
            onClick={handleToggle}
            className={`
                flex items-center justify-center
                w-8 h-8 rounded-md
                transition-all duration-200
                ${isSaved
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-secondary-200 text-neutral-600 hover:bg-secondary-300'
                }
            `}
            aria-label={isSaved ? "Remove from saved" : "Save sentence"}
            title={isSaved ? "저장됨" : "저장"}
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M3 2.5C3 2.22386 3.22386 2 3.5 2H12.5C12.7761 2 13 2.22386 13 2.5V13.5L8 10.5L3 13.5V2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={isSaved ? 'currentColor' : 'none'}
                />
            </svg>
        </button>
    );
}
