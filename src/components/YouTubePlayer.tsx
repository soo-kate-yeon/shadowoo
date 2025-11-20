'use client';

import { useEffect, useRef, useState } from 'react';

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

export default function YouTubePlayer({
    videoId,
    onReady,
    onTimeUpdate,
    className = '',
}: YouTubePlayerProps) {
    const playerRef = useRef<YT.Player | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isAPIReady, setIsAPIReady] = useState(false);

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
                controls: 1,
                modestbranding: 1,
                rel: 0,
            },
            events: {
                onReady: (event) => {
                    onReady?.(event.target);
                },
                onStateChange: () => {
                    // Start time update interval when playing
                    if (playerRef.current?.getPlayerState() === window.YT.PlayerState.PLAYING) {
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
    const startTimeUpdateInterval = () => {
        const interval = setInterval(() => {
            if (playerRef.current && playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
                const currentTime = playerRef.current.getCurrentTime();
                onTimeUpdate?.(currentTime);
            } else {
                clearInterval(interval);
            }
        }, 100);
    };

    return (
        <div className={`relative aspect-video ${className}`}>
            <div ref={containerRef} className="absolute inset-0" />
        </div>
    );
}

// Export player control utilities
export const playerControls = {
    seekTo: (player: YT.Player, seconds: number) => {
        player.seekTo(seconds, true);
    },

    play: (player: YT.Player) => {
        player.playVideo();
    },

    pause: (player: YT.Player) => {
        player.pauseVideo();
    },

    getCurrentTime: (player: YT.Player): number => {
        return player.getCurrentTime();
    },
};
