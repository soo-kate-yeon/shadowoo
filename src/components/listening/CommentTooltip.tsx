"use client";

import { useState } from "react";

interface CommentTooltipProps {
    originalText: string;
    comment: string;
    onClose: () => void;
}

export function CommentTooltip({ originalText, comment, onClose }: CommentTooltipProps) {
    return (
        <div className="absolute z-50 -top-2 left-0 right-0 transform -translate-y-full">
            <div className="bg-surface border border-outline rounded-xl shadow-lg p-4 max-w-md">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="pr-6">
                    <p className="text-body-large text-neutral-900 mb-2">
                        {originalText}
                    </p>
                    <p className="text-body-medium text-neutral-600 pl-4 border-l-2 border-primary-300">
                        {comment}
                    </p>
                </div>

                {/* Arrow pointing down */}
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-surface border-r border-b border-outline transform rotate-45"></div>
            </div>
        </div>
    );
}
