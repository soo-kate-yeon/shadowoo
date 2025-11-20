'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import YouTubePlayer, { playerControls } from '@/components/YouTubePlayer';
import SentenceItem from '@/components/SentenceItem';
import ShadowingMode from '@/components/ShadowingMode';
import { useStudyStore } from '@/store/useStudyStore';
import { parseTranscriptToSentences } from '@/lib/transcript-parser';
import { Sentence } from '@/types';

export default function StudyPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.videoId as string;

    const { currentSession, sessions, createSession, setCurrentSession, updateSessionPhase } = useStudyStore();
    const [player, setPlayer] = useState<YT.Player | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Initialize or load session
    useEffect(() => {
        if (!isMounted) return;

        const existingSession = sessions.find(s => s.videoId === videoId);

        if (existingSession) {
            console.log('Found existing session:', existingSession);
            setCurrentSession(existingSession.id);
            setIsLoading(false);
        } else {
            // Fetch transcript and create new session
            console.log('Creating new session for:', videoId);
            fetchTranscriptAndCreateSession();
        }
    }, [videoId, isMounted, sessions.length]); // Added sessions.length to retry if sessions load late

    const fetchTranscriptAndCreateSession = async () => {
        try {
            const response = await fetch(`/api/transcript?videoId=${videoId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '자막을 가져올 수 없습니다');
            }

            const sentences = parseTranscriptToSentences(data.transcript);
            console.log('Parsed sentences:', sentences.length);
            createSession(videoId, `Video ${videoId}`, sentences);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching transcript:', err);
            setError(err instanceof Error ? err.message : '오류가 발생했습니다');
            setIsLoading(false);
        }
    };

    const handlePhaseChange = (phase: 'blind' | 'script' | 'shadowing') => {
        if (currentSession) {
            console.log('Changing phase to:', phase);
            updateSessionPhase(currentSession.id, phase);
        }
    };

    if (!isMounted) return null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">자막을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="text-red-600 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    if (!currentSession) {
        return null;
    }

    console.log('Render - Current Phase:', currentSession.currentPhase);
    console.log('Render - Sentences:', currentSession.sentences?.length);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            ← Back
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">
                            {currentSession.videoTitle}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
                            Save
                        </button>
                        <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
                            End
                        </button>
                        <button
                            onClick={() => {
                                const phases: Array<'blind' | 'script' | 'shadowing'> = ['blind', 'script', 'shadowing'];
                                const currentIndex = phases.indexOf(currentSession.currentPhase);
                                if (currentIndex < phases.length - 1) {
                                    handlePhaseChange(phases[currentIndex + 1]);
                                }
                            }}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Video Player */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {currentSession.currentPhase === 'blind' && 'Now, listen to...'}
                            {currentSession.currentPhase === 'script' && 'Listen with script...'}
                            {currentSession.currentPhase === 'shadowing' && 'Shadowing practice...'}
                        </h2>

                        <YouTubePlayer
                            videoId={videoId}
                            onReady={setPlayer}
                            onTimeUpdate={setCurrentTime}
                            className="rounded-2xl overflow-hidden shadow-lg"
                        />
                    </div>

                    {/* Right: Content based on phase */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        {currentSession.currentPhase === 'blind' && (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-400 text-lg">Don't see script!</p>
                            </div>
                        )}

                        {currentSession.currentPhase === 'script' && (
                            <ScriptPanel
                                sentences={currentSession.sentences}
                                currentTime={currentTime}
                                player={player}
                            />
                        )}

                        {currentSession.currentPhase === 'shadowing' && (
                            <ShadowingMode
                                sentences={currentSession.sentences}
                                player={player}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Script Panel Component
function ScriptPanel({
    sentences,
    currentTime,
    player,
}: {
    sentences: Sentence[];
    currentTime: number;
    player: YT.Player | null;
}) {
    const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
    const { currentSession } = useStudyStore();

    useEffect(() => {
        const active = sentences.find(
            s => currentTime >= s.startTime && currentTime < s.endTime
        );
        setActiveSentenceId(active?.id || null);
    }, [currentTime, sentences]);

    const handleSentenceClick = (sentence: Sentence) => {
        if (player) {
            playerControls.seekTo(player, sentence.startTime);
            playerControls.play(player);
        }
    };

    if (!currentSession) return null;

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {sentences.map((sentence) => (
                <SentenceItem
                    key={sentence.id}
                    sentence={sentence}
                    sessionId={currentSession.id}
                    isActive={activeSentenceId === sentence.id}
                    onClick={() => handleSentenceClick(sentence)}
                />
            ))}
        </div>
    );
}
