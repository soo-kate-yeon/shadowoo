'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Sentence } from '@/types';
import YouTubePlayer from '@/components/YouTubePlayer';

export default function SessionPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.videoId as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sentences, setSentences] = useState<Sentence[]>([]);

    const [player, setPlayer] = useState<YT.Player | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const activeSentenceRef = useRef<HTMLDivElement>(null);

    const addSession = useStore((state) => state.addSession);
    const getVideo = useStore((state) => state.getVideo);
    const video = getVideo(videoId);

    useEffect(() => {
        if (!videoId) return;

        // Initialize session if needed
        // In a real app, we might check if it exists first, but addSession overwrites or we can check
        // For now, let's just ensure we have the video data. 
        // If we came from a direct link and don't have video data in store, we might need to fetch it.
        // But for this prototype, we assume we came from Home where video exists in store.

        const fetchTranscript = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/transcript?videoId=${videoId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch transcript');
                }
                const data = await response.json();
                setSentences(data.sentences);

                // Create/Update session in store
                addSession({
                    id: crypto.randomUUID(),
                    videoId,
                    progress: 0,
                    lastAccessedAt: Date.now(),
                    totalSentences: data.sentences.length,
                    timeLeft: video?.duration || '00:00' // Fallback or calculate
                });

            } catch (err) {
                console.error(err);
                setError('Failed to load session');
            } finally {
                setLoading(false);
            }
        };

        fetchTranscript();
    }, [videoId, addSession, video]);

    const handlePlayerReady = (playerInstance: YT.Player) => {
        setPlayer(playerInstance);
    };

    const handleTimeUpdate = (time: number) => {
        setCurrentTime(time);
    };

    const handleSentenceClick = (startTime: number) => {
        if (player) {
            player.seekTo(startTime, true);
            player.playVideo(); // Optional: auto-play after seek
        }
    };

    // Find active sentence
    const activeSentenceIndex = sentences.findIndex(
        (s) => currentTime >= s.startTime && currentTime < s.endTime
    );

    // Auto-scroll to active sentence
    useEffect(() => {
        if (activeSentenceRef.current) {
            activeSentenceRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeSentenceIndex]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading Session...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => router.push('/home')}>Go Home</Button>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <header className="h-16 border-b flex items-center px-6 justify-between shrink-0 bg-white z-10">
                <h1 className="font-semibold text-lg truncate max-w-[600px]">{video?.title || 'Unknown Video'}</h1>
                <Button variant="ghost" onClick={() => router.push('/home')}>Exit</Button>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Column: Video Player */}
                <div className="flex-1 bg-black flex items-center justify-center relative">
                    <div className="w-full max-w-[1200px] aspect-video">
                        <YouTubePlayer
                            videoId={videoId}
                            className="w-full h-full"
                            onReady={handlePlayerReady}
                            onTimeUpdate={handleTimeUpdate}
                        />
                    </div>
                </div>

                {/* Right Column: Transcript */}
                <div className="w-[400px] bg-white border-l flex flex-col shrink-0">
                    <div className="p-4 border-b shrink-0 bg-white">
                        <h2 className="font-semibold text-lg">Transcript</h2>
                        <p className="text-sm text-muted-foreground">{sentences.length} sentences</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {sentences.map((sentence, idx) => {
                            const isActive = idx === activeSentenceIndex;
                            return (
                                <div
                                    key={sentence.id}
                                    ref={isActive ? activeSentenceRef : null}
                                    className={`
                                        p-3 rounded-xl cursor-pointer transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-primary-100 ring-1 ring-primary-500 shadow-sm'
                                            : 'hover:bg-secondary-100'
                                        }
                                    `}
                                    onClick={() => handleSentenceClick(sentence.startTime)}
                                >
                                    <div className="flex gap-3">
                                        <span className={`
                                            text-xs font-mono mt-1 shrink-0 w-6 transition-colors
                                            ${isActive ? 'text-primary-700 font-bold' : 'text-muted-foreground'}
                                        `}>
                                            {idx + 1}
                                        </span>
                                        <p className={`
                                            text-base leading-relaxed transition-colors
                                            ${isActive ? 'text-black font-medium' : 'text-neutral-800 group-hover:text-black'}
                                        `}>
                                            {sentence.text}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
