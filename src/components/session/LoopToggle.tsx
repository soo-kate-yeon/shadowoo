'use client';

import { useState } from 'react';

interface LoopToggleProps {
    sentenceId: string;
    isLooping?: boolean;
    onToggle?: (sentenceId: string, isLooping: boolean) => void;
}

export default function LoopToggle({ sentenceId, isLooping = false, onToggle }: LoopToggleProps) {
    const handleToggle = () => {
        const newState = !isLooping;
        onToggle?.(sentenceId, newState);
    };

    return (
        <button
            onClick={handleToggle}
            className={`
                flex items-center justify-center
                w-8 h-8 rounded-md
                transition-all duration-200
                ${isLooping
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-secondary-200 text-neutral-600 hover:bg-secondary-300'
                }
            `}
            aria-label={isLooping ? "Stop looping" : "Start looping"}
            title={isLooping ? "반복 중지" : "반복 재생"}
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={isLooping ? 'animate-pulse' : ''}
            >
                <path
                    d="M13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C9.12622 3 10.1644 3.37194 11 3.99963M11 3.99963V1.5M11 3.99963L8.5 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}
