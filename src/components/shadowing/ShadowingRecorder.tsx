"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Play, Pause } from "lucide-react";

interface ShadowingRecorderProps {
    originalAudioUrl?: string; // URL or mechanism to play original
    onPlayOriginal: () => void;
    onStopOriginal: () => void;
    isOriginalPlaying: boolean;
    sentenceDuration?: number; // Duration in seconds
}

export function ShadowingRecorder({
    onPlayOriginal,
    onStopOriginal,
    isOriginalPlaying,
    sentenceDuration = 0
}: ShadowingRecorderProps) {
    // Playback state
    const [originalProgress, setOriginalProgress] = useState(0);

    // Recording state
    const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording" | "review">("idle");
    const [isReviewPlaying, setIsReviewPlaying] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [reviewProgress, setReviewProgress] = useState(0);

    // Media Recorder Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const recordingStartTimeRef = useRef<number>(0);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup recorded URL
    useEffect(() => {
        return () => {
            if (recordedUrl) {
                URL.revokeObjectURL(recordedUrl);
            }
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, [recordedUrl]);

    // Track original playback progress
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOriginalPlaying && sentenceDuration > 0) {
            const startTime = Date.now();
            interval = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min((elapsed / sentenceDuration) * 100, 100);
                setOriginalProgress(progress);

                if (progress >= 100) {
                    clearInterval(interval);
                    setOriginalProgress(0);
                }
            }, 50);
        } else {
            setOriginalProgress(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOriginalPlaying, sentenceDuration]);

    // Handle Original Playback Toggle
    const toggleOriginalPlay = () => {
        if (isOriginalPlaying) {
            onStopOriginal();
        } else {
            onPlayOriginal();
        }
    };

    // Start Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            recordingStartTimeRef.current = Date.now();
            setRecordingDuration(0);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedUrl(url);
                setRecordingStatus('review');

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Clear recording interval
                if (recordingIntervalRef.current) {
                    clearInterval(recordingIntervalRef.current);
                }

                // Auto play review
                setIsReviewPlaying(true);
            };

            mediaRecorder.start();
            setRecordingStatus('recording');

            // Track recording duration
            recordingIntervalRef.current = setInterval(() => {
                const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
                setRecordingDuration(elapsed);
            }, 100);

            // Stop original if playing
            if (isOriginalPlaying) {
                onStopOriginal();
            }

        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('마이크 권한이 필요합니다');
        }
    };

    // Stop Recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && recordingStatus === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    // Handle Mic Button Click
    const handleMicClick = () => {
        if (recordingStatus === "idle" || recordingStatus === "review") {
            startRecording();
            setIsReviewPlaying(false);
            setReviewProgress(0);
        } else if (recordingStatus === "recording") {
            stopRecording();
        }
    };

    // Handle Review Playback
    useEffect(() => {
        if (recordedUrl) {
            if (!audioRef.current) {
                audioRef.current = new Audio(recordedUrl);
                audioRef.current.onended = () => {
                    setIsReviewPlaying(false);
                    setReviewProgress(0);
                };
                audioRef.current.ontimeupdate = () => {
                    if (audioRef.current && audioRef.current.duration) {
                        const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                        setReviewProgress(progress);
                    }
                };
            } else {
                audioRef.current.src = recordedUrl;
            }
        }
    }, [recordedUrl]);

    useEffect(() => {
        if (audioRef.current) {
            if (isReviewPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [isReviewPlaying]);

    const handleReviewToggle = () => {
        if (recordingStatus === "review") {
            setIsReviewPlaying(!isReviewPlaying);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-secondary-200 rounded-2xl p-6 animate-in slide-in-from-top-2 duration-300 border border-secondary-300/50">
            <div className="flex flex-col gap-6 w-full">

                {/* Section 1: Original Audio */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-body-large font-semibold text-neutral-900">
                            먼저 강세와 억양에 유의하며 반복해서 들어보세요.
                        </h3>
                    </div>

                    {/* Player Controls */}
                    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm min-w-[280px] justify-between border border-secondary-200">
                        <button
                            onClick={toggleOriginalPlay}
                            className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 shrink-0 shadow-sm
                                ${isOriginalPlaying ? "bg-primary-600 hover:bg-primary-700" : "bg-primary-500 hover:bg-primary-600"}
                            `}
                        >
                            {isOriginalPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>

                        {/* Progress Bar and Time */}
                        <div className="flex flex-col gap-1.5 flex-1 px-3">
                            <div className="w-full h-1.5 bg-secondary-100 rounded-full overflow-hidden relative">
                                <div
                                    className="h-full bg-primary-500 transition-all duration-100 ease-linear rounded-full"
                                    style={{ width: `${originalProgress}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-secondary-500 font-medium tabular-nums">
                                    {isOriginalPlaying ? formatTime(sentenceDuration * (originalProgress / 100)) : formatTime(sentenceDuration * (originalProgress / 100))}
                                </span>
                                <span className="text-xs text-secondary-400 font-medium tabular-nums">
                                    {formatTime(sentenceDuration)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px w-full bg-secondary-300/50" />

                {/* Section 2: Recording */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                        <h3 className="text-body-large font-semibold text-neutral-900">
                            녹음 버튼을 눌러 쉐도잉을 시작하세요.
                        </h3>
                        <p className="text-body-medium text-secondary-500">
                            원본과 비교해 들으며 부족한 부분을 분석해보세요.
                        </p>
                    </div>

                    {/* Recorder Controls */}
                    <div
                        onClick={handleReviewToggle}
                        className={`
                            flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm min-w-[280px] justify-between border border-secondary-200 transition-all duration-200 select-none
                            ${recordingStatus === 'review' ? 'cursor-pointer hover:border-primary-200 hover:shadow-md' : ''}
                        `}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMicClick();
                            }}
                            className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 shrink-0 shadow-sm
                                ${recordingStatus === 'recording'
                                    ? "bg-error animate-pulse ring-4 ring-error/20"
                                    : recordingStatus === 'review'
                                        ? "bg-primary-500 hover:bg-primary-600"
                                        : "bg-secondary-400 hover:bg-secondary-500"}
                            `}
                        >
                            {recordingStatus === 'recording' ? <div className="w-3.5 h-3.5 bg-white rounded-sm" /> : <Mic className="w-5 h-5" />}
                        </button>

                        {/* Progress Bar and Time */}
                        <div className="flex flex-col gap-1.5 flex-1 px-3">
                            <div className="w-full h-1.5 bg-secondary-100 rounded-full overflow-hidden relative">
                                <div
                                    className={`h-full transition-all duration-100 ease-linear rounded-full ${recordingStatus === 'recording' ? 'bg-error' :
                                        recordingStatus === 'review' ? 'bg-primary-500' : 'bg-secondary-300'
                                        }`}
                                    style={{
                                        width: recordingStatus === 'review' ? `${reviewProgress}%` : '0%'
                                    }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-xs font-medium tabular-nums ${recordingStatus === 'recording' ? 'text-error' : 'text-secondary-500'}`}>
                                    {recordingStatus === 'recording' ? formatTime(recordingDuration) :
                                        recordingStatus === 'review' && audioRef.current ? formatTime(audioRef.current.currentTime || 0) : '0:00'}
                                </span>
                                {recordingStatus === 'review' && audioRef.current && (
                                    <span className="text-xs text-secondary-400 font-medium tabular-nums">
                                        {formatTime(audioRef.current.duration || 0)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
