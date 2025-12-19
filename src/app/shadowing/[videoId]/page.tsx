'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Sentence } from '@/types';
import YouTubePlayer from '@/components/YouTubePlayer';
import { ShadowingHeader } from '@/components/shadowing/ShadowingHeader';
import { ShadowingScriptList } from '@/components/shadowing/ShadowingScriptList';
import { Check } from 'lucide-react';

export default function ShadowingPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.videoId as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [mode, setMode] = useState<"sentence" | "paragraph" | "total">("sentence");

    // Player State
    const [player, setPlayer] = useState<YT.Player | null>(null);
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
    const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getVideo = useStore((state) => state.getVideo);
    const video = getVideo(videoId);

    useEffect(() => {
        if (!videoId) return;

        const fetchTranscript = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/curated-videos/${videoId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch curated video');
                }
                const data = await response.json();

                // The API returns a single video with transcript
                if (data.video && data.video.transcript) {
                    setSentences(data.video.transcript);
                } else {
                    throw new Error('No transcript available');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load video. Please make sure it has been added via the admin panel.');
            } finally {
                setLoading(false);
            }
        };

        fetchTranscript();
    }, [videoId]);

    const handlePlayerReady = (playerInstance: YT.Player) => {
        setPlayer(playerInstance);
    };

    const handlePlaySentence = (startTime: number, endTime: number) => {
        if (!player) return;

        // Clear existing timeout
        if (playTimeoutRef.current) {
            clearTimeout(playTimeoutRef.current);
        }

        // Find sentence ID
        const sentence = sentences.find(s => s.start === startTime);
        if (sentence) {
            setCurrentPlayingId(sentence.id);
        }

        player.seekTo(startTime, true);
        player.playVideo();

        const duration = (endTime - startTime) * 1000;
        playTimeoutRef.current = setTimeout(() => {
            player.pauseVideo();
            setCurrentPlayingId(null);
        }, duration);
    };

    const handleStopOriginal = () => {
        if (player) {
            player.pauseVideo();
        }
        if (playTimeoutRef.current) {
            clearTimeout(playTimeoutRef.current);
        }
        setCurrentPlayingId(null);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-secondary-200 text-secondary-500">Loading Shadowing...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 bg-secondary-200">
                <p className="text-error">{error}</p>
                <button onClick={() => router.push('/home')} className="text-primary-500 hover:underline">Go Home</button>
            </div>
        );
    }

    return (
        <div className="h-screen bg-secondary-200 flex flex-col overflow-hidden relative">
            {/* Header */}
            <ShadowingHeader
                title={video?.title || 'Unknown Video'}
                onBack={() => router.push('/home')}
                onPrevStep={() => router.push(`/session/${videoId}`)}
                onNextStep={() => { }} // TODO: Next step
            />

            <main className="flex-1 flex gap-6 p-8 h-[calc(100vh-80px)]">
                {/* Left: Video Player */}
                <div className="w-1/2 h-full flex flex-col">
                    <h2 className="text-2xl font-bold text-neutral-900 leading-relaxed mb-6 tracking-tight whitespace-pre-wrap">
                        이제, 스크립트를 보며 다시 들어보세요.{'\n'}
                        어려운 문장이 있다면 클릭해서 분석해보세요.
                    </h2>

                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                        <YouTubePlayer
                            videoId={videoId}
                            className="w-full h-full"
                            onReady={handlePlayerReady}
                            disableSpacebarControl={true}
                        />
                    </div>
                </div>

                {/* Right: Shadowing Script & Tools */}
                <div className="w-1/2 h-full bg-secondary-50 rounded-2xl p-8 overflow-hidden flex flex-col shadow-sm">
                    {/* Mode Toggles */}
                    <div className="flex gap-3 mb-6 shrink-0">
                        <button
                            onClick={() => setMode("sentence")}
                            className={`px-3 py-2 rounded-lg text-body-large font-medium flex items-center gap-2 transition-colors ${mode === 'sentence' ? 'bg-neutral-800 text-neutral-50' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                        >
                            {mode === 'sentence' && <Check className="w-4 h-4" />}
                            한 문장씩
                        </button>
                        <button
                            onClick={() => setMode("paragraph")}
                            className={`px-3 py-2 rounded-lg text-body-large font-medium flex items-center gap-2 transition-colors ${mode === 'paragraph' ? 'bg-neutral-800 text-neutral-50' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                        >
                            {mode === 'paragraph' && <Check className="w-4 h-4" />}
                            한 문단씩
                        </button>
                        <button
                            onClick={() => setMode("total")}
                            className={`px-3 py-2 rounded-lg text-body-large font-medium flex items-center gap-2 transition-colors ${mode === 'total' ? 'bg-neutral-800 text-neutral-50' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                        >
                            {mode === 'total' && <Check className="w-4 h-4" />}
                            전체
                        </button>
                    </div>

                    {/* Script List */}
                    <div className="flex-1 overflow-y-auto pb-20">
                        <ShadowingScriptList
                            sentences={sentences}
                            mode={mode}
                            onPlaySentence={handlePlaySentence}
                            onStopOriginal={handleStopOriginal}
                            currentPlayingId={currentPlayingId}
                            player={player}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
