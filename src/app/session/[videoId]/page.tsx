'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Sentence } from '@/types';
import YouTubePlayer from '@/components/YouTubePlayer';
import { SessionHeader } from '@/components/session/SessionHeader';
import { ScriptLine } from '@/components/session/ScriptLine';
import { Highlight } from '@/components/session/AnalysisPanel';

export default function SessionPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.videoId as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [currentStep, setCurrentStep] = useState<1 | 2>(1); // Step 1: listen, Step 2: script

    const [player, setPlayer] = useState<YT.Player | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const activeSentenceRef = useRef<HTMLDivElement>(null);

    // UI State
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loopingSentenceId, setLoopingSentenceId] = useState<string | null>(null);

    // Store
    const addSession = useStore((state) => state.addSession);
    const getVideo = useStore((state) => state.getVideo);
    const video = getVideo(videoId);
    const storeHighlights = useStore((state) => state.highlights);
    const addHighlight = useStore((state) => state.addHighlight);
    const removeHighlight = useStore((state) => state.removeHighlight);
    const updateSessionPosition = useStore((state) => state.updateSessionPosition);
    const sessions = useStore((state) => state.sessions);

    // Filter highlights for this video
    const sessionHighlights = useMemo(() =>
        storeHighlights.filter(h => h.videoId === videoId),
        [storeHighlights, videoId]);


    // Prevent infinite loop: only fetch transcript once per videoId
    const hasLoadedTranscriptRef = useRef<string | null>(null);

    useEffect(() => {
        if (!videoId || hasLoadedTranscriptRef.current === videoId) return;

        const fetchTranscript = async () => {
            try {
                setLoading(true);
                // NEW: Fetch from curated videos API
                const response = await fetch(`/api/curated-videos/${videoId}`);
                console.log(`📡 [SessionPage] Fetch status: ${response.status} ${response.statusText}`);

                if (!response.ok) {
                    throw new Error('Video not found in curated library');
                }

                const data = await response.json();
                console.log('📦 [SessionPage] Curated video loaded:', {
                    title: data.video?.title,
                    sentenceCount: data.video?.transcript?.length,
                    snippet_duration: data.video?.snippet_duration
                });

                // Validate response data
                if (!data.video || !data.video.transcript || !Array.isArray(data.video.transcript)) {
                    throw new Error('Invalid video data structure');
                }

                // Handle empty array
                if (data.video.transcript.length === 0) {
                    throw new Error('This video has no transcript available');
                }

                setSentences(data.video.transcript);

                // Check if session exists and load last position
                const existingSession = sessions[videoId];
                if (existingSession) {
                    // Resume from last position
                    setCurrentStep(existingSession.currentStep);
                } else {
                    // Create new session starting at step 1
                    addSession({
                        id: crypto.randomUUID(),
                        videoId,
                        progress: 0,
                        lastAccessedAt: Date.now(),
                        totalSentences: data.transcript.length,
                        timeLeft: data.duration || '00:00',
                        currentStep: 1,
                        currentSentence: undefined
                    });
                }

                // Mark as loaded
                hasLoadedTranscriptRef.current = videoId;

            } catch (err: any) {
                // Ignore "no transcript" errors in console, just set UI state
                if (err.message === 'This video has no transcript available') {
                    setError('This video has no transcript available');
                    setLoading(false);
                    return;
                }

                console.error(err);
                setError('Failed to load session');
            } finally {
                setLoading(false);
            }
        };

        fetchTranscript();
    }, [videoId]); // Removed sessions, addSession, video from deps to prevent infinite loop


    const handlePlayerReady = (playerInstance: YT.Player) => {
        setPlayer(playerInstance);
    };

    const handleTimeUpdate = (time: number) => {
        setCurrentTime(time);
    };

    const handleSeek = (startTime: number) => {
        if (player) {
            player.seekTo(startTime, true);
            player.playVideo(); // Optional: auto-play after seek
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

    const handleRestoreHighlight = (highlight: Highlight) => {
        if (highlight.id) {
            addHighlight({
                id: highlight.id,
                videoId,
                originalText: highlight.text,
                userNote: highlight.comment,
                createdAt: Date.now()
            });
        }
    };

    const handleLoopToggle = (sentenceId: string, isLooping: boolean) => {
        if (isLooping) {
            setLoopingSentenceId(sentenceId);
            // Find the sentence and start playing it
            const sentence = sentences.find(s => s.id === sentenceId);
            if (sentence && player) {
                player.seekTo(sentence.start, true);
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
                // If we've passed the end of the looping sentence, restart it
                if (currentTime >= loopingSentence.end) {
                    player.seekTo(loopingSentence.start, true);
                    player.playVideo();
                }
            }
        }, 100); // Check every 100ms

        return () => clearInterval(checkLoop);
    }, [loopingSentenceId, player, sentences]);

    // Position Restoration Logic
    const hasRestoredPosition = useRef(false);

    useEffect(() => {
        // Skip if already restored, or if player/sentences aren't ready
        if (hasRestoredPosition.current || !player || sentences.length === 0) {
            return;
        }

        const existingSession = sessions[videoId];

        // Only restore if:
        // 1. Session exists
        // 2. Current step is 2 (script view) or higher
        // 3. We have a valid saved sentence index
        if (existingSession &&
            existingSession.currentStep >= 2 &&
            existingSession.currentSentence !== undefined &&
            existingSession.currentSentence < sentences.length) {

            const targetSentence = sentences[existingSession.currentSentence];
            console.log(`Restoring position to sentence #${existingSession.currentSentence}: ${targetSentence.text.substring(0, 30)}...`);

            // Add a small delay to ensure player is fully initialized and ready to seek
            setTimeout(() => {
                if (player && player.seekTo) {
                    player.seekTo(targetSentence.start, true);
                    // Optional: Auto-play could be added here if desired
                    // player.playVideo();
                }
            }, 500);

            hasRestoredPosition.current = true;
        } else if (existingSession && existingSession.currentStep === 1) {
            // For step 1, we just mark as restored without seeking (start from beginning)
            hasRestoredPosition.current = true;
        }
    }, [player, sentences, videoId, sessions]);

    // Find active sentence
    const activeSentenceIndex = sentences.findIndex(
        (s) => currentTime >= s.start && currentTime < s.end
    );

    // Track active sentence position (only in Step 2)
    // Use ref to track last updated index to prevent excessive updates
    const lastTrackedSentenceRef = useRef<number>(-1);

    useEffect(() => {
        // Only update if:
        // 1. We're in Step 2
        // 2. We have a valid sentence index
        // 3. The sentence has actually changed (not the same as last tracked)
        if (currentStep === 2 &&
            activeSentenceIndex >= 0 &&
            activeSentenceIndex !== lastTrackedSentenceRef.current) {

            updateSessionPosition(videoId, 2, activeSentenceIndex);
            lastTrackedSentenceRef.current = activeSentenceIndex;
        }
    }, [activeSentenceIndex, currentStep, videoId]); // Removed updateSessionPosition from deps

    // Auto-scroll to active sentence
    useEffect(() => {
        if (activeSentenceRef.current) {
            activeSentenceRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeSentenceIndex]);

    const handleNextStep = () => {
        if (currentStep === 1) {
            setCurrentStep(2);
            updateSessionPosition(videoId, 2);
        } else {
            router.push(`/shadowing/${videoId}`);
        }
    };

    const handlePrevStep = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
            updateSessionPosition(videoId, 1);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-secondary-200 text-secondary-500">Loading Session...</div>;
    }

    if (error && error !== 'This video has no transcript available') {
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
            <SessionHeader
                title={video?.title || 'Unknown Video'}
                currentStep={currentStep}
                onBack={() => router.push('/home')}
                onNextStep={handleNextStep}
                onPrevStep={handlePrevStep}
            />

            {currentStep === 1 ? (
                // Step 1: Listen without script
                <main className="flex-1 flex gap-6 p-8 h-[calc(100vh-80px)]">
                    {/* Left: Video Player */}
                    <div className="w-1/2 h-full flex flex-col">
                        <h2 className="text-2xl font-bold text-neutral-900 leading-relaxed mb-6 tracking-tight whitespace-pre-wrap">
                            처음에는 스크립트 없이 끝까지 들어보세요.
                        </h2>

                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                            <YouTubePlayer
                                videoId={videoId}
                                className="w-full h-full"
                                onReady={handlePlayerReady}
                                onTimeUpdate={handleTimeUpdate}
                            />
                        </div>
                    </div>

                    {/* Right: Caption */}
                    <div className="w-1/2 h-full bg-secondary-50 rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm">
                        <p className="text-2xl font-medium text-secondary-500 text-center mb-8">
                            처음에는 스크립트 없이 끝까지 들어보세요
                        </p>
                    </div>
                </main>
            ) : (
                // Step 2: Script view
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
                                onTimeUpdate={handleTimeUpdate}
                            />
                        </div>
                    </div>

                    {/* Right: Script & Analysis */}
                    <div className="w-1/2 h-full bg-secondary-50 rounded-2xl p-8 overflow-y-auto relative shadow-sm">
                        <div className="flex flex-col gap-6 pb-20">
                            {sentences.map((sentence, idx) => {
                                const isActive = idx === activeSentenceIndex;
                                const isLooping = loopingSentenceId === sentence.id;
                                // Find highlights for this sentence
                                // Simple check: if highlight text is contained in sentence text
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
                                            expanded={expandedId === sentence.id}
                                            highlights={sentenceHighlights}
                                            onToggleExpand={() => setExpandedId(prev => prev === sentence.id ? null : sentence.id)}
                                            onAddHighlight={handleAddHighlight}
                                            onRemoveHighlight={handleRemoveHighlight}
                                            onRestoreHighlight={handleRestoreHighlight}
                                            onSeek={handleSeek}
                                            onLoopToggle={handleLoopToggle}
                                        />
                                    </div>
                                );
                            })}
                            {/* Extra scroll space */}
                            <div className="h-20" />
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
}
