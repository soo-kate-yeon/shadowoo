"use client";

import { Eye, EyeOff } from "lucide-react";

interface ScriptToggleProps {
    isScriptVisible: boolean;
    onToggle: () => void;
}

export function ScriptToggle({ isScriptVisible, onToggle }: ScriptToggleProps) {
    return (
        <div className="flex items-center justify-between p-4 bg-surface border-b border-outline sticky top-0 z-10">
            <span className="text-body-large font-medium text-neutral-800">
                {isScriptVisible ? "스크립트 보기" : "스크립트 숨김"}
            </span>
            <button
                onClick={onToggle}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-body-large font-medium transition-all
                    ${isScriptVisible
                        ? 'bg-primary-500 text-white hover:bg-primary-600'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }
                `}
                aria-label={isScriptVisible ? "스크립트 숨기기" : "스크립트 보기"}
            >
                {isScriptVisible ? (
                    <>
                        <Eye className="w-5 h-5" />
                        <span>보이는 중</span>
                    </>
                ) : (
                    <>
                        <EyeOff className="w-5 h-5" />
                        <span>숨김</span>
                    </>
                )}
            </button>
        </div>
    );
}
