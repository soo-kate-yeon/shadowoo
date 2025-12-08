"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

interface CommentPopoverProps {
    initialValue?: string;
    onSubmit: (comment: string) => void;
    onClose?: () => void;
}

export function CommentPopover({ initialValue = "", onSubmit, onClose }: CommentPopoverProps) {
    const [comment, setComment] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node) && onClose) {
                // If clicking the submit button, don't close immediately (let submit handle it)
                // Actually, the submit button is sibling to input. 
                // Let's check if click is inside the popover container.
                const popover = inputRef.current.closest('.bg-secondary-50');
                if (popover && !popover.contains(event.target as Node)) {
                    onClose();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleSubmit = () => {
        if (comment.trim()) {
            onSubmit(comment);
        }
    };

    return (
        <div className="absolute z-50 left-0 -bottom-14 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-secondary-50 rounded-xl border border-secondary-500/30 shadow-lg w-[400px] flex items-center gap-2 p-3">
                <input
                    ref={inputRef}
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="코멘트 추가하기"
                    className="flex-1 bg-transparent border-none outline-none text-body-large text-neutral-900 placeholder:text-secondary-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!comment.trim()}
                    className={`
                        w-6 h-6 rounded-full flex items-center justify-center transition-colors
                        ${comment.trim() ? "bg-primary-500 hover:bg-primary-600" : "bg-secondary-500 cursor-not-allowed"}
                    `}
                >
                    <ArrowUp className="w-4 h-4 text-white" />
                </button>
            </div>
        </div>
    );
}
