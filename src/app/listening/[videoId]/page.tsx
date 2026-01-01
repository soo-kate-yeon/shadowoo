'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Sentence, LearningSession } from '@/types';
import YouTubePlayer from '@/components/YouTubePlayer';
import { ListeningHeader } from '@/components/listening/ListeningHeader';
import { ScriptLine, Highlight } from '@/components/listening/ScriptLine';
import { ScriptToggle } from '@/components/listening/ScriptToggle';

export default function ListeningPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const videoId = params.videoId as string;
    const sessionId = searchParams.get('sessionId');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [videoData, setVideoData] = useState<any>(null);
    const [isScriptVisible, setIsScriptVisible] = useState(false); // Script toggle, default OFF

    const [player, setPlayer] = useState<YT.Player | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const activeSentenceRef = useRef<HTMLDivElement>(null);

    // UI State
    const [loopingSentenceId, setLoopingSentenceId] = useState<string | null>(null);

    // Store
    const addSession = useStore((state) => state.addSession);
    const storeHighlights = useStore((state) => state.highlights);
    const addHighlight = useStore((state) => state.addHighlight);
    const removeHighlight = useStore((state) => state.removeHighlight);
    const sessions = useStore((state) => state.sessions);

    // Filter highlights for this video
    const sessionHighlights = useMemo(() =>
        storeHighlights.filter(h => h.videoId === videoId),
        [storeHighlights, videoId]);

    // Prevent infinite loop: only fetch transcript once per videoId/sessionId
    const hasLoadedRef = useRef<string | null>(null);

    useEffect(() => {
        const loadKey = sessionId ? `${videoId}_${sessionId}` : videoId;
        if (!videoId || hasLoadedRef.current === loadKey) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                let data;
                let transcriptSentences: Sentence[] = [];

                if (sessionId) {
                    // Fetch specific learning session
                    const response = await fetch(`/api/learning-sessions?sessionId=${sessionId}`);
                    if (!response.ok) throw new Error('Session not found');
                    const result = await response.json();
                    const session = result.sessions?.[0] as LearningSession;

                    if (!session) throw new Error('Session not found');

                    data = {
                        title: session.title,
                        snippet_start_time: session.start_time,
                        snippet_end_time: session.end_time,
                        snippet_duration: session.duration,
                        thumbnail_url: session.thumbnail_url
                    };
                    transcriptSentences = session.sentences || [];
                } else {
                    // Fetch full curated video
                    const response = await fetch(`/api/curated-videos/${videoId}`);
                    if (!response.ok) throw new Error('Video not found in curated library');
                    data = await response.json();
                    transcriptSentences = data.transcript || [];
                }

                console.log(`📦 [ListeningPage] Data loaded:`, {
                    title: data.title,
                    sentenceCount: transcriptSentences.length,
                    sessionId
                });

                if (transcriptSentences.length === 0) {
                    throw new Error('No transcript available for this content');
                }

                setSentences(transcriptSentences);
                setVideoData(data);

                // Check store for user progress
                const existingSession = sessions[videoId];
                if (!existingSession) {
                    addSession({
                        id: crypto.randomUUID(),
                        videoId,
                        progress: 0,
                        lastAccessedAt: Date.now(),
                        totalSentences: transcriptSentences.length,
                        timeLeft: '00:00',
                        currentStep: 1,
                        currentSentence: undefined
                    });
                }

                hasLoadedRef.current = loadKey;

            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to load session');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [videoId, sessionId]);

    const handlePlayerReady = (playerInstance: YT.Player) => {
        setPlayer(playerInstance);
    };

    const handleTimeUpdate = (time: number) => {
        setCurrentTime(time);
    };

    const handleSeek = (startTime: number) => {
        if (player) {
            player.seekTo(startTime, true);
            player.playVideo();
        }
    };

    const handleAddHighlight = (text: string, comment: string) => {
        addHighlight({
            id: crypto.randomUUID(),
            videoId,
            originalText: text,
            userNote: comment,
            createdAt: Date.now()
        });
    };

    const handleRemoveHighlight = (id: string) => {
        removeHighlight(id);
    };

    const handleLoopToggle = (sentenceId: string, isLooping: boolean) => {
        if (isLooping) {
            setLoopingSentenceId(sentenceId);
            const sentence = sentences.find(s => s.id === sentenceId);
            if (sentence && player) {
                player.seekTo(sentence.startTime, true);
                player.playVideo();
            }
        } else {
            setLoopingSentenceId(null);
        }
    };

    // Loop playback effect
    useEffect(() => {
        if (!loopingSentenceId || !player) return;

        const loopingSentence = sentences.find(s => s.id === loopingSentenceId);
        if (!loopingSentence) return;

        const checkLoop = setInterval(() => {
            if (player && player.getCurrentTime) {
                const currentTime = player.getCurrentTime();
                if (currentTime >= loopingSentence.endTime) {
                    player.seekTo(loopingSentence.startTime, true);
                    player.playVideo();
                }
            }
        }, 100);

        return () => clearInterval(checkLoop);
    }, [loopingSentenceId, player, sentences]);

    // Find active sentence
    const activeSentenceIndex = sentences.findIndex(
        (s) => currentTime >= s.startTime && currentTime < s.endTime
    );

    // Auto-scroll to active sentence
    useEffect(() => {
        if (activeSentenceRef.current && isScriptVisible) {
            activeSentenceRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeSentenceIndex, isScriptVisible]);

    const handleNextStep = () => {
        router.push(`/shadowing/${videoId}${sessionId ? `?sessionId=${sessionId}` : ''}`);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-secondary-200 text-secondary-500">Loading...</div>;
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
            <ListeningHeader
                title={videoData?.title || 'Loading...'}
                onBack={() => router.push('/home')}
                onNextStep={handleNextStep}
            />

            {/* Main Content - Single Layout */}
            <main className="flex-1 flex gap-6 p-8 h-[calc(100vh-80px)]">
                {/* Left: Video Player */}
                <div className="w-1/2 h-full flex flex-col">
                    <h2 className="text-2xl font-bold text-neutral-900 leading-relaxed mb-6 tracking-tight">
                        스크립트 토글로 학습 방식을 선택하세요
                    </h2>

                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                        <YouTubePlayer
                            videoId={videoId}
                            className="w-full h-full"
                            onReady={handlePlayerReady}
                            onTimeUpdate={handleTimeUpdate}
                            startSeconds={videoData?.snippet_start_time}
                            endSeconds={videoData?.snippet_end_time}
                        />
                    </div>
                </div>

                {/* Right: Script Container */}
                <div className="w-1/2 h-full bg-secondary-50 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                    {/* Script Toggle */}
                    <ScriptToggle
                        isScriptVisible={isScriptVisible}
                        onToggle={() => setIsScriptVisible(!isScriptVisible)}
                    />

                    {/* Script Content or Placeholder */}
                    {isScriptVisible ? (
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="flex flex-col gap-6 pb-20">
                                {sentences.map((sentence, idx) => {
                                    const isActive = idx === activeSentenceIndex;
                                    const isLooping = loopingSentenceId === sentence.id;
                                    const sentenceHighlights: Highlight[] = sessionHighlights
                                        .filter(h => sentence.text.includes(h.originalText))
                                        .map(h => ({
                                            id: h.id,
                                            text: h.originalText,
                                            comment: h.userNote || ''
                                        }));

                                    return (
                                        <div key={sentence.id} ref={isActive ? activeSentenceRef : null}>
                                            <ScriptLine
                                                sentence={sentence}
                                                index={idx}
                                                videoId={videoId}
                                                isActive={isActive}
                                                isLooping={isLooping}
                                                highlights={sentenceHighlights}
                                                onAddHighlight={handleAddHighlight}
                                                onRemoveHighlight={handleRemoveHighlight}
                                                onSeek={handleSeek}
                                                onLoopToggle={handleLoopToggle}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <p className="text-2xl font-medium text-secondary-500 text-center">
                                스크립트 없이 재생하는 중
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
