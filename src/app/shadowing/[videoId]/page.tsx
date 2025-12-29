'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { groupSentencesByMode } from '@/lib/transcript-parser';
import { Sentence, LearningSession } from '@/types';
import YouTubePlayer from '@/components/YouTubePlayer';
import { ShadowingHeader } from '@/components/shadowing/ShadowingHeader';
import { ShadowingScriptList } from '@/components/shadowing/ShadowingScriptList';
import { RecordingBar } from '@/components/shadowing/RecordingBar';
import { Check } from 'lucide-react';

type RecordingState = 'idle' | 'recording' | 'playback';

export default function ShadowingPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const videoId = params.videoId as string;
    const sessionId = searchParams.get('sessionId');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [videoData, setVideoData] = useState<any>(null);
    const [rawSentences, setRawSentences] = useState<Sentence[]>([]);
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [mode, setMode] = useState<"sentence" | "paragraph" | "total">("sentence");

    // Player State
    const [player, setPlayer] = useState<YT.Player | null>(null);
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
    const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Loop State
    const [loopingSentenceId, setLoopingSentenceId] = useState<string | null>(null);

    // Recording State
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [isRecordingPlaying, setIsRecordingPlaying] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [currentRecordingSentenceId, setCurrentRecordingSentenceId] = useState<string | null>(null);

    useEffect(() => {
        if (!videoId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                let data;
                let transcriptSentences: Sentence[] = [];

                if (sessionId) {
                    const response = await fetch(`/api/learning-sessions?sessionId=${sessionId}`);
                    if (!response.ok) throw new Error('Session not found');
                    const result = await response.json();
                    const session = result.sessions?.[0] as LearningSession;

                    if (!session) throw new Error('Session not found');

                    data = {
                        title: session.title,
                        snippet_start_time: session.start_time,
                        snippet_end_time: session.end_time,
                        snippet_duration: session.duration
                    };
                    transcriptSentences = session.sentences || [];
                } else {
                    const response = await fetch(`/api/curated-videos/${videoId}`);
                    if (!response.ok) throw new Error('Failed to fetch curated video');
                    data = await response.json();
                    transcriptSentences = data.transcript || [];
                }

                setVideoData(data);
                setRawSentences(transcriptSentences);
                setSentences(groupSentencesByMode(transcriptSentences, mode));
            } catch (err) {
                console.error(err);
                setError('Failed to load session');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [videoId, sessionId]);

    // Re-group when mode changes
    useEffect(() => {
        if (rawSentences.length > 0) {
            setSentences(groupSentencesByMode(rawSentences, mode));
        }
    }, [mode, rawSentences]);

    const handlePlayerReady = (playerInstance: YT.Player) => {
        setPlayer(playerInstance);
    };

    const handlePlaySentence = (startTime: number, endTime: number) => {
        if (!player) return;

        if (playTimeoutRef.current) {
            clearTimeout(playTimeoutRef.current);
        }

        const sentence = sentences.find(s => s.startTime === startTime);
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

    const handleLoopSentence = (sentenceId: string, isLooping: boolean) => {
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

    const handleRecordSentence = (sentenceId: string) => {
        setCurrentRecordingSentenceId(sentenceId);
        setRecordingState('recording');
        setRecordingDuration(0);
        // TODO: Start actual audio recording
    };

    const handleStopRecording = () => {
        setRecordingState('playback');
        // TODO: Stop actual audio recording and get duration
        setRecordingDuration(5); // Mock duration
    };

    const handlePlayRecording = () => {
        setIsRecordingPlaying(true);
        // TODO: Play recorded audio
    };

    const handlePauseRecording = () => {
        setIsRecordingPlaying(false);
        // TODO: Pause recorded audio
    };

    const handleRecordAgain = () => {
        setRecordingState('recording');
        setRecordingDuration(0);
        // TODO: Start new recording
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
                title={videoData?.title || 'Loading...'}
                onBack={() => router.push('/home')}
                onPrevStep={() => router.push(`/listening/${videoId}${sessionId ? `?sessionId=${sessionId}` : ''}`)}
                onNextStep={() => { }} // TODO: Next step
            />

            <main className="flex-1 flex gap-6 p-8 h-[calc(100vh-80px)]">
                {/* Left: Video Player */}
                <div className="w-1/2 h-full flex flex-col">
                    <h2 className="text-2xl font-bold text-neutral-900 leading-relaxed mb-6 tracking-tight whitespace-pre-wrap">
                        문장을 선택하고 쉐도잉을 연습하세요
                    </h2>

                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                        <YouTubePlayer
                            videoId={videoId}
                            className="w-full h-full"
                            onReady={handlePlayerReady}
                            disableSpacebarControl={true}
                            startSeconds={videoData?.snippet_start_time}
                            endSeconds={videoData?.snippet_end_time}
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
                            onLoopSentence={handleLoopSentence}
                            onRecordSentence={handleRecordSentence}
                            loopingSentenceId={loopingSentenceId}
                        />
                    </div>
                </div>
            </main>

            {/* Recording Bar */}
            <RecordingBar
                state={recordingState}
                onRecord={handleRecordAgain}
                onStop={handleStopRecording}
                onPlay={handlePlayRecording}
                onPause={handlePauseRecording}
                isPlaying={isRecordingPlaying}
                recordingDuration={recordingDuration}
            />
        </div>
    );
}
