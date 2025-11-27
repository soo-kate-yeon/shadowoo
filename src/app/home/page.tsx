'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SessionCard from '@/components/SessionCard';
import VideoCard from '@/components/VideoCard';
import HighlightCard from '@/components/HighlightCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Mock Data
const RECENT_SESSIONS = [
    {
        id: 1,
        title: "Steve Jobs' 2005 Stanford Commencement Address",
        thumbnailUrl: "https://img.youtube.com/vi/UF8uR6Z6KLc/maxresdefault.jpg",
        progress: 75,
        timeLeft: "14:30",
        totalSentences: 45
    },
    {
        id: 2,
        title: "The power of vulnerability | Brené Brown",
        thumbnailUrl: "https://img.youtube.com/vi/iCvmsMzlF7o/maxresdefault.jpg",
        progress: 30,
        timeLeft: "20:19",
        totalSentences: 62
    }
];

const RECOMMENDED_VIDEOS = [
    {
        id: 3,
        title: "How great leaders inspire action | Simon Sinek",
        thumbnailUrl: "https://img.youtube.com/vi/qp0HIF3SfI4/maxresdefault.jpg",
        duration: "18:04",
        description: "Simon Sinek has a simple but powerful model for inspirational leadership - starting with a golden circle and the question: \"Why?\""
    },
    {
        id: 4,
        title: "Your body language may shape who you are | Amy Cuddy",
        thumbnailUrl: "https://img.youtube.com/vi/Ks-_Mh1QhMc/maxresdefault.jpg",
        duration: "21:02",
        description: "Body language affects how others see us, but it may also change how we see ourselves."
    },
    {
        id: 5,
        title: "Inside the mind of a master procrastinator | Tim Urban",
        thumbnailUrl: "https://img.youtube.com/vi/arj7oStGLkU/maxresdefault.jpg",
        duration: "14:03",
        description: "Tim Urban knows that procrastination doesn't make sense, but he's never been able to shake his habit of waiting until the last minute to get things done."
    }
];

export default function HomePage() {
    const [url, setUrl] = useState('');
    const router = useRouter();
    const hasRecords = true; // Toggle this to see empty state

    const handleStartSession = () => {
        if (!url) return;
        console.log('Starting session with URL:', url);
        // router.push(`/session?url=${encodeURIComponent(url)}`);
    };

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

                <div className="flex items-center gap-6">
                    <button className="text-body-large text-neutral-900 font-medium hover:text-neutral-700">
                        로그아웃
                    </button>
                    <Avatar className="w-10 h-10 border-2 border-white cursor-pointer">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <main className="flex-1 max-w-[1920px] w-full mx-auto p-8 flex flex-col gap-6 h-[calc(100vh-80px)] overflow-hidden">
                {hasRecords ? (
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
                                    {RECOMMENDED_VIDEOS.map((video) => (
                                        <Link href={`/session/new?videoId=${video.id}`} key={video.id} className="block">
                                            <VideoCard
                                                title={video.title}
                                                thumbnailUrl={video.thumbnailUrl}
                                                duration={video.duration}
                                                description={video.description}
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
                                <div className="flex flex-col gap-4 pb-4">
                                    {RECENT_SESSIONS.map((session) => (
                                        <SessionCard
                                            key={session.id}
                                            title={session.title}
                                            thumbnailUrl={session.thumbnailUrl}
                                            progress={session.progress}
                                            timeLeft={session.timeLeft}
                                            totalSentences={session.totalSentences}
                                            onClick={() => console.log(`Resume session ${session.id}`)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Right Column: Highlights */}
                        <section className="bg-[#f3f3f3] rounded-2xl p-4 h-full w-[30%] flex flex-col">
                            <h2 className="text-xl font-semibold text-black mb-4 shrink-0">하이라이트</h2>
                            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                                <div className="flex flex-col gap-4 pb-4">
                                    {/* Mock Grouped Highlights */}
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-[#e3e3e3] rounded-2xl p-3 flex gap-3 items-center">
                                            <div className="w-[80px] h-[56px] rounded-xl overflow-hidden shrink-0 bg-neutral-300">
                                                <img src="https://img.youtube.com/vi/UF8uR6Z6KLc/maxresdefault.jpg" className="w-full h-full object-cover" alt="Thumbnail" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-black line-clamp-2 leading-tight">
                                                Steve Jobs' 2005 Stanford Commencement Address
                                            </h3>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <HighlightCard
                                                highlightedSentence="Stay hungry, stay foolish."
                                                userCaption="This is my favorite quote."
                                            />
                                            <HighlightCard
                                                highlightedSentence="Your time is limited, so don't waste it living someone else's life."
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="bg-[#e3e3e3] rounded-2xl p-3 flex gap-3 items-center">
                                            <div className="w-[80px] h-[56px] rounded-xl overflow-hidden shrink-0 bg-neutral-300">
                                                <img src="https://img.youtube.com/vi/iCvmsMzlF7o/maxresdefault.jpg" className="w-full h-full object-cover" alt="Thumbnail" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-black line-clamp-2 leading-tight">
                                                The power of vulnerability
                                            </h3>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <HighlightCard
                                                highlightedSentence="Vulnerability is the birthplace of innovation, creativity and change."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                ) : (
                    /* Empty State */
                    <section className="flex flex-col items-center justify-center py-20 gap-6 h-full">
                        <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl">📝</span>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-headline-medium text-neutral-900">아직 학습 기록이 없어요</h3>
                            <p className="text-body-large text-neutral-500">
                                왼쪽 목록에서 영상을 선택하여<br />첫 번째 쉐도잉 학습을 시작해보세요!
                            </p>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
