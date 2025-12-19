"use client";

import { useState, useRef, useEffect } from "react";
import { Sentence } from "@/types";
import { CommentPopover } from "./CommentPopover";
import { AnalysisPanel, Highlight } from "./AnalysisPanel";
import LoopToggle from "./LoopToggle";
import SaveToggle from "./SaveToggle";
import { useStore } from "@/lib/store";

interface ScriptLineProps {
    sentence: Sentence;
    index: number;
    videoId: string;
    isActive: boolean;
    isLooping: boolean;
    expanded: boolean;
    highlights: Highlight[];
    onToggleExpand: () => void;
    onAddHighlight: (text: string, comment: string) => void;
    onSeek: (startTime: number) => void;
    onLoopToggle: (sentenceId: string, isLooping: boolean) => void;
    onRemoveHighlight?: (id: string) => void;
    onRestoreHighlight?: (highlight: Highlight) => void;
}

export function ScriptLine({
    sentence,
    index,
    videoId,
    isActive,
    isLooping,
    expanded,
    highlights,
    onToggleExpand,
    onAddHighlight,
    onSeek,
    onLoopToggle,
    onRemoveHighlight,
    onRestoreHighlight
}: ScriptLineProps) {
    const [selection, setSelection] = useState<{ text: string } | null>(null);
    const activeRef = useRef<HTMLDivElement>(null);

    // Store actions for saved sentences
    const savedSentences = useStore((state) => state.savedSentences);
    const addSavedSentence = useStore((state) => state.addSavedSentence);
    const removeSavedSentence = useStore((state) => state.removeSavedSentence);

    // Check if this sentence is saved
    const isSaved = savedSentences.some((s) => s.sentenceId === sentence.id);

    // Close popover when active state changes (e.g. another sentence starts playing)
    useEffect(() => {
        if (!isActive) {
            setSelection(null);
        }
    }, [isActive]);

    const handleMouseUp = () => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();

        if (text && text.length > 0) {
            // Ensure we are selecting within this component
            if (activeRef.current && sel?.anchorNode && activeRef.current.contains(sel.anchorNode)) {
                setSelection({ text });
                // If not expanded, expand it to show context
                if (!expanded) {
                    onToggleExpand();
                }
            }
        }
    };

    const handleExpandToggle = () => {
        // Only toggle if we are NOT selecting text
        if (!selection) {
            onToggleExpand();
        }
    };

    const handleCommentSubmit = (comment: string) => {
        if (selection) {
            onAddHighlight(selection.text, comment);
            setSelection(null);
            // Clear selection
            window.getSelection()?.removeAllRanges();
        }
    };

    const handleSaveToggle = (sentenceId: string, shouldSave: boolean) => {
        if (shouldSave) {
            // Add to saved sentences
            addSavedSentence({
                id: crypto.randomUUID(),
                videoId: videoId,
                sentenceId: sentence.id,
                sentenceText: sentence.text,
                startTime: sentence.startTime,
                endTime: sentence.endTime,
                createdAt: Date.now()
            });
        } else {
            // Remove from saved sentences
            const savedSentence = savedSentences.find((s) => s.sentenceId === sentenceId);
            if (savedSentence) {
                removeSavedSentence(savedSentence.id);
            }
        }
    };

    // Helper to render text with highlights
    const renderTextWithHighlights = (originalText: string) => {
        if (highlights.length === 0) return originalText;

        let parts = [originalText];

        highlights.forEach(h => {
            const newParts: any[] = [];
            parts.forEach(part => {
                if (typeof part === 'string' && part.includes(h.text)) {
                    const split = part.split(h.text);
                    for (let i = 0; i < split.length; i++) {
                        newParts.push(split[i]);
                        if (i < split.length - 1) {
                            newParts.push(
                                <span key={`${h.text}-${i}`} className="bg-accent-yellow">
                                    {h.text}
                                </span>
                            );
                        }
                    }
                } else {
                    newParts.push(part);
                }
            });
            parts = newParts;
        });

        return <>{parts}</>;
    };

    return (
        <div
            ref={activeRef}
            className="flex flex-col gap-4"
        >
            {/* Script Line */}
            <div className="relative group">
                <div className="flex gap-4 items-start">
                    <span className={`
                        text-xs font-mono mt-2 shrink-0 w-6 transition-colors
                        ${isActive ? 'text-primary-700 font-bold' : 'text-secondary-500'}
                    `}>
                        {index + 1}
                    </span>
                    <p
                        onMouseUp={handleMouseUp}
                        onClick={() => {
                            handleExpandToggle();
                            // Also seek when clicking the line (if not selecting)
                            if (!selection) {
                                onSeek(sentence.startTime);
                            }
                        }}
                        className={`
                            flex-1 text-lg leading-relaxed cursor-pointer transition-colors select-text
                            ${expanded || isActive ? "font-semibold text-neutral-900" : "font-medium text-secondary-500 hover:text-secondary-600"}
                        `}
                    >
                        {selection ? (
                            <>
                                {sentence.text.split(selection.text).map((part, i, arr) => (
                                    <span key={i}>
                                        {part}
                                        {i < arr.length - 1 && <span className="bg-accent-yellow">{selection.text}</span>}
                                    </span>
                                ))}
                            </>
                        ) : (
                            renderTextWithHighlights(sentence.text)
                        )}
                    </p>
                    <div className={`flex gap-2 mt-1 transition-opacity ${isLooping || isSaved ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <LoopToggle
                            sentenceId={sentence.id}
                            isLooping={isLooping}
                            onToggle={onLoopToggle}
                        />
                        <SaveToggle
                            sentenceId={sentence.id}
                            isSaved={isSaved}
                            onToggle={handleSaveToggle}
                        />
                    </div>
                </div>

                {/* Comment Popover */}
                {selection && (
                    <CommentPopover
                        onSubmit={handleCommentSubmit}
                        onClose={() => setSelection(null)}
                    />
                )}
            </div>

            {/* Analysis Panel (Accordion) */}
            {expanded && (
                <div className="pl-10">
                    <AnalysisPanel
                        highlights={highlights}
                        videoId={videoId}
                        sentenceId={sentence.id}
                        sentenceText={sentence.text}
                        onRemoveHighlight={onRemoveHighlight}
                        onRestoreHighlight={onRestoreHighlight}
                    />
                </div>
            )}
        </div>
    );
}
