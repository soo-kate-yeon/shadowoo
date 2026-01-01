// Audio recording hook using MediaRecorder API
import { useState, useRef, useCallback } from 'react';

export type RecordingState = 'idle' | 'recording' | 'playback';

interface UseAudioRecorderReturn {
    recordingState: RecordingState;
    audioUrl: string | null;
    duration: number;
    isPlaying: boolean;
    playbackProgress: number;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    playRecording: () => void;
    pauseRecording: () => void;
    resetRecording: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackProgress, setPlaybackProgress] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const startTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);

    const startRecording = useCallback(async () => {
        try {
            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Determine supported mime type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/mp4'; // Fallback for Safari if needed

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                setRecordingState('playback');

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            // Start recording
            mediaRecorder.start();
            startTimeRef.current = Date.now();
            setRecordingState('recording');
            setDuration(0);

            // Update duration while recording
            const updateDuration = () => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    const elapsed = (Date.now() - startTimeRef.current) / 1000;
                    setDuration(elapsed);
                    animationFrameRef.current = requestAnimationFrame(updateDuration);
                }
            };
            updateDuration();

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('마이크 접근 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    const playRecording = useCallback(() => {
        if (!audioUrl) return;

        if (!audioElementRef.current) {
            const audio = new Audio(audioUrl);
            audioElementRef.current = audio;

            audio.onended = () => {
                setIsPlaying(false);
                setPlaybackProgress(0);
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            };

            audio.onloadedmetadata = () => {
                setDuration(audio.duration);
            };
        }

        // Just in case, try to play
        const playPromise = audioElementRef.current.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                setIsPlaying(true);
            }).catch(e => console.error("Playback failed", e));
        }

        // Update progress
        const updateProgress = () => {
            if (audioElementRef.current && !audioElementRef.current.paused) {
                const progress = (audioElementRef.current.currentTime / audioElementRef.current.duration) * 100;
                setPlaybackProgress(progress);
                animationFrameRef.current = requestAnimationFrame(updateProgress);
            }
        };
        updateProgress();
    }, [audioUrl]);

    const pauseRecording = useCallback(() => {
        if (audioElementRef.current) {
            audioElementRef.current.pause();
            setIsPlaying(false);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        }
    }, []);

    const resetRecording = useCallback(() => {
        // Stop audio playback
        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current.currentTime = 0;
        }

        // Stop recording if active
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }

        // Cancel any running loops
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(null);
        setRecordingState('idle');
        setIsPlaying(false);
        setDuration(0);
        setPlaybackProgress(0);
        audioChunksRef.current = [];
    }, [audioUrl]);

    return {
        recordingState,
        audioUrl,
        duration,
        isPlaying,
        playbackProgress,
        startRecording,
        stopRecording,
        playRecording,
        pauseRecording,
        resetRecording
    };
}
