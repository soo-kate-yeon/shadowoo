'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SessionCard from '@/components/SessionCard';
import VideoCard from '@/components/VideoCard';
import HighlightCard from '@/components/HighlightCard';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import UserMenu from '@/components/auth/UserMenu';
import { useStore } from '@/lib/store';
import { extractVideoId } from '@/lib/transcript-parser';

export default function HomePage() {
    const [url, setUrl] = useState('');
    const router = useRouter();

    // Store Data
    const videos = useStore((state) => state.videos);
    const sessions = useStore((state) => state.sessions);
    const highlights = useStore((state) => state.highlights);
    const getVideo = useStore((state) => state.getVideo);

    // Derived State
    const recentSessions = Object.values(sessions).sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
    const hasRecords = recentSessions.length > 0 || highlights.length > 0;

    // Hydration fix (Zustand persist needs client-side mount check)
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleStartSession = () => {
        if (!url) return;
        const videoId = extractVideoId(url);
        if (videoId) {
            console.log('Starting session with Video ID:', videoId);
            router.push(`/session/${videoId}`);
        } else {
            alert('Invalid YouTube URL');
        }
    };

    if (!isMounted) {
        return null; // or a loading skeleton
    }

    return (
        <div className="min-h-screen bg-secondary-200 flex flex-col">
            {/* Top Navigation */}
            <header className="h-[80px] bg-secondary-300 flex items-center justify-between px-8 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    {/* Logo Area */}
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-title-panel text-neutral-900">ShadowingNinja</span>
                </div>

                <UserMenu />
            </header>

            <main className="flex-1 max-w-[1920px] w-full mx-auto p-8 flex flex-col gap-6 h-[calc(100vh-80px)] overflow-hidden">
                {/* Always show the 3-column layout, with individual empty states */}
                <div className="flex flex-row gap-6 items-start h-full">

                    {/* Left Column: Recommended Videos */}
                    <section className="flex flex-col gap-4 w-[25%] h-full">
                        <div className="flex flex-col gap-4 shrink-0">
                            <h2 className="text-2xl font-semibold text-black">학습할 영상</h2>
                            {/* Filter Chips Mock */}
                            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                                {["토크쇼", "영화", "TV 시리즈", "인터뷰", "팟캐스트"].map((cat, index) => (
                                    <button
                                        key={cat}
                                        className={`
                                flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors whitespace-nowrap
                                ${index === 0
                                                ? "bg-[#2c2c2c] text-[#f5f5f5]"
                                                : "bg-[#f5f5f5] text-[#757575] hover:bg-[#e5e5e5]"}
                            `}
                                    >
                                        {index === 0 && (
                                            <div className="relative shrink-0 size-[16px]">
                                                <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                                                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="#F5F5F5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                                                </svg>
                                            </div>
                                        )}
                                        <span className="leading-[20px]">{cat}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                            <div className="flex flex-col gap-4 pb-4">
                                {videos.map((video) => (
                                    <Link href={`/session/${video.id}`} key={video.id} className="block">
                                        <VideoCard
                                            title={video.title}
                                            thumbnailUrl={video.thumbnailUrl}
                                            duration={video.duration}
                                            description={video.description}
                                            sentenceCount={video.sentenceCount}
                                        />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Middle Column: Recent Sessions */}
                    <section className="bg-[#f3f3f3] rounded-2xl p-4 h-full w-[45%] flex flex-col">
                        <div className="flex items-center gap-1 relative mb-4 shrink-0">
                            <h2 className="text-xl font-semibold text-black">학습 중인 영상</h2>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                            {recentSessions.length > 0 ? (
                                <div className="flex flex-col gap-4 pb-4">
                                    {recentSessions.map((session) => {
                                        const video = getVideo(session.videoId);
                                        if (!video) return null;
                                        return (
                                            <SessionCard
                                                key={session.id}
                                                title={video.title}
                                                thumbnailUrl={video.thumbnailUrl}
                                                progress={session.progress}
                                                timeLeft={session.timeLeft}
                                                totalSentences={session.totalSentences}
                                                onClick={() => router.push(`/session/${session.videoId}`)}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                                    <p>아직 학습 중인 영상이 없어요.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Right Column: Highlights */}
                    <section className="bg-[#f3f3f3] rounded-2xl p-4 h-full w-[30%] flex flex-col">
                        <h2 className="text-xl font-semibold text-black mb-4 shrink-0">하이라이트</h2>
                        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                            {highlights.length > 0 ? (
                                <div className="flex flex-col gap-4 pb-4">
                                    {/* Group highlights by video logic could go here, for now just listing */}
                                    {highlights.map((highlight) => {
                                        const video = getVideo(highlight.videoId);
                                        return (
                                            <HighlightCard
                                                key={highlight.id}
                                                highlightedSentence={highlight.originalText}
                                                userCaption={highlight.userNote}
                                            // videoTitle={video?.title} // HighlightCard doesn't support videoTitle prop yet based on last edit, need to check
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                                    <p>아직 하이라이트가 없어요.</p>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
