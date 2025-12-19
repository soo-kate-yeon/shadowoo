"use client";

import { useState, useEffect } from "react";
import { Sentence } from "@/types";
import { ShadowingRecorder } from "./ShadowingRecorder";

interface ShadowingScriptListProps {
    sentences: Sentence[];
    mode: "sentence" | "paragraph" | "total";
    onPlaySentence: (startTime: number, endTime: number) => void;
    onStopOriginal: () => void;
    currentPlayingId: string | null;
    player: YT.Player | null;
}

export function ShadowingScriptList({
    sentences,
    mode,
    onPlaySentence,
    onStopOriginal,
    currentPlayingId,
    player
}: ShadowingScriptListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleExpand = (id: string) => {
        if (expandedId === id) {
            setExpandedId(null);
            onStopOriginal();
        } else {
            setExpandedId(id);
        }
    };

    // Spacebar control
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();

                if (!player || !expandedId) return;

                const currentState = player.getPlayerState();
                if (currentState === window.YT.PlayerState.PLAYING) {
                    player.pauseVideo();
                } else {
                    // Find the expanded sentence and play it
                    const sentence = sentences.find(s => s.id === expandedId);
                    if (sentence) {
                        onPlaySentence(sentence.startTime, sentence.endTime);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [player, expandedId, sentences, onPlaySentence]);

    // Track playing state from player
    useEffect(() => {
        if (!player) return;

        const interval = setInterval(() => {
            const state = player.getPlayerState();
            setIsPlaying(state === window.YT.PlayerState.PLAYING);
        }, 100);

        return () => clearInterval(interval);
    }, [player]);

    return (
        <div className="flex flex-col gap-6">
            {sentences.map((sentence, idx) => (
                <div key={sentence.id} className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <span className={`
                            text-xs font-mono mt-2 shrink-0 w-6 transition-colors
                            ${expandedId === sentence.id ? 'text-primary-700 font-bold' : 'text-secondary-500'}
                        `}>
                            {idx + 1}
                        </span>
                        <p
                            onClick={() => toggleExpand(sentence.id)}
                            className={`
                                text-lg leading-relaxed cursor-pointer transition-all duration-200
                                ${expandedId === sentence.id
                                    ? "font-semibold text-neutral-900"
                                    : "font-medium text-secondary-500 hover:text-secondary-700"
                                }
                            `}
                        >
                            {sentence.text}
                        </p>
                    </div>

                    {/* Shadowing Player Panel (Accordion) */}
                    {expandedId === sentence.id && (
                        <div className="pl-10">
                            <ShadowingRecorder
                                onPlayOriginal={() => onPlaySentence(sentence.startTime, sentence.endTime)}
                                onStopOriginal={onStopOriginal}
                                isOriginalPlaying={currentPlayingId === sentence.id && isPlaying}
                                sentenceDuration={sentence.endTime - sentence.startTime}
                            />
                        </div>
                    )}
                </div>
            ))}
            <div className="h-20" />
        </div>
    );
}
