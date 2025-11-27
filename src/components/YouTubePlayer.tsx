'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface YouTubePlayerProps {
    videoId: string;
    onReady?: (player: YT.Player) => void;
    onTimeUpdate?: (currentTime: number) => void;
    className?: string;
}

declare global {
    interface Window {
        YT: typeof YT;
        onYouTubeIframeAPIReady: () => void;
    }
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function YouTubePlayer({
    videoId,
    onReady,
    onTimeUpdate,
    className = '',
}: YouTubePlayerProps) {
    const playerRef = useRef<YT.Player | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isAPIReady, setIsAPIReady] = useState(false);

    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showControls, setShowControls] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    // Load YouTube IFrame API
    useEffect(() => {
        if (window.YT && window.YT.Player) {
            setIsAPIReady(true);
            return;
        }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            setIsAPIReady(true);
        };
    }, []);

    // Initialize player
    useEffect(() => {
        if (!isAPIReady || !containerRef.current) return;

        playerRef.current = new window.YT.Player(containerRef.current, {
            videoId,
            playerVars: {
                autoplay: 0,
                controls: 0, // Hide default controls
                modestbranding: 1,
                rel: 0,
                disablekb: 1, // Disable default keyboard controls to avoid conflict
                fs: 0, // Hide fullscreen button
            },
            events: {
                onReady: (event) => {
                    setDuration(event.target.getDuration());
                    setVolume(event.target.getVolume());
                    onReady?.(event.target);
                },
                onStateChange: (event) => {
                    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
                    if (event.data === window.YT.PlayerState.PLAYING) {
                        startTimeUpdateInterval();
                    }
                },
            },
        });

        return () => {
            playerRef.current?.destroy();
        };
    }, [isAPIReady, videoId]);

    // Time update interval
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeUpdateInterval = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
                const time = playerRef.current.getCurrentTime();
                setCurrentTime(time);
                onTimeUpdate?.(time);
            } else {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        }, 100);
    }, [onTimeUpdate]);

    // Cleanup interval
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Controls Handlers
    const togglePlay = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const handleSeek = (value: number[]) => {
        if (!playerRef.current) return;
        const newTime = value[0];
        setCurrentTime(newTime);
        playerRef.current.seekTo(newTime, true);
    };

    const handleVolumeChange = (value: number[]) => {
        if (!playerRef.current) return;
        const newVolume = value[0];
        setVolume(newVolume);
        playerRef.current.setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
            playerRef.current.unMute();
        }
    };

    const toggleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.unMute();
            playerRef.current.setVolume(volume);
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
        }
    };

    const handleSpeedChange = (speed: number) => {
        if (!playerRef.current) return;
        playerRef.current.setPlaybackRate(speed);
        setPlaybackRate(speed);
        setShowSpeedMenu(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className={`relative group ${className}`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => {
                setShowControls(false);
                setShowSpeedMenu(false);
            }}
        >
            {/* Video Container */}
            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden">
                <div ref={containerRef} className="absolute inset-0 w-full h-full" />
            </div>

            {/* Controls Overlay */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/40 flex flex-col justify-end transition-opacity duration-300 rounded-xl overflow-hidden",
                    showControls || !isPlaying ? "opacity-100" : "opacity-0"
                )}
            >
                {/* Center Play Button (only when paused) */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <button
                            onClick={togglePlay}
                            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors pointer-events-auto"
                        >
                            <Play className="w-8 h-8 text-white fill-current ml-1" />
                        </button>
                    </div>
                )}

                {/* Bottom Controls Bar */}
                <div className="p-4 space-y-2 bg-gradient-to-t from-black/80 to-transparent">
                    {/* Progress Bar */}
                    <Slider
                        value={[currentTime]}
                        max={duration}
                        step={1}
                        onValueChange={handleSeek}
                        className="cursor-pointer"
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Play/Pause */}
                            <button onClick={togglePlay} className="text-white hover:text-primary-400 transition-colors">
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-2 group/volume">
                                <button onClick={toggleMute} className="text-white hover:text-primary-400 transition-colors">
                                    {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                </button>
                                <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                                    <Slider
                                        value={[isMuted ? 0 : volume]}
                                        max={100}
                                        onValueChange={handleVolumeChange}
                                        className="w-20"
                                    />
                                </div>
                            </div>

                            {/* Time */}
                            <span className="text-white text-sm font-medium">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Speed Control */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                    className="text-white hover:text-primary-400 transition-colors font-medium text-sm w-12"
                                >
                                    {playbackRate}x
                                </button>
                                {showSpeedMenu && (
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md rounded-lg p-1 min-w-[60px] flex flex-col gap-1">
                                        {PLAYBACK_SPEEDS.map((speed) => (
                                            <button
                                                key={speed}
                                                onClick={() => handleSpeedChange(speed)}
                                                className={cn(
                                                    "px-2 py-1 text-sm rounded hover:bg-white/20 transition-colors",
                                                    playbackRate === speed ? "text-primary-400 font-bold" : "text-white"
                                                )}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
