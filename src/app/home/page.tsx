'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SessionCard from '@/components/SessionCard';
import UserMenu from '@/components/auth/UserMenu';
import { useStore } from '@/lib/store';
import TopNav from '@/components/TopNav';
import { CuratedVideo } from '@/types';

export default function HomePage() {
    const router = useRouter();
    const sessions = useStore((state) => state.sessions);
    const removeSession = useStore((state) => state.removeSession);

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());

    // Curated videos state
    const [curatedVideos, setCuratedVideos] = useState<CuratedVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

    // Hydration fix
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch curated videos
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (selectedDifficulty !== 'all') {
                    params.append('difficulty', selectedDifficulty);
                }

                const response = await fetch(`/api/curated-videos?${params}`);
                if (!response.ok) throw new Error('Failed to fetch videos');

                const data = await response.json();
                setCuratedVideos(data.videos || []);
            } catch (error) {
                console.error('Failed to load curated videos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [selectedDifficulty]);

    // Derived State
    const recentSessions = Object.values(sessions).sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-secondary-200 flex flex-col">
            <TopNav />

            <main className="flex-1 max-w-[1920px] w-full mx-auto p-8 flex flex-col gap-6 h-[calc(100vh-80px)] overflow-hidden">
                <div className="flex flex-row gap-6 items-start h-full">

                    {/* Left Column: Curated Videos */}
                    <section className="flex flex-col gap-4 w-[33%] h-full">
                        <div className="flex flex-col gap-4 shrink-0">
                            <h2 className="text-2xl font-semibold text-black">학습할 영상</h2>

                            {/* Difficulty Filter */}
                            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                                {[
                                    { id: 'all', label: '전체' },
                                    { id: 'beginner', label: '초급' },
                                    { id: 'intermediate', label: '중급' },
                                    { id: 'advanced', label: '고급' }
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedDifficulty(cat.id)}
                                        className={`
                                            flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors whitespace-nowrap
                                            ${selectedDifficulty === cat.id
                                                ? "bg-[#2c2c2c] text-[#f5f5f5]"
                                                : "bg-[#f5f5f5] text-[#757575] hover:bg-[#e5e5e5]"}
                                        `}
                                    >
                                        {selectedDifficulty === cat.id && (
                                            <div className="relative shrink-0 size-[16px]">
                                                <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                                                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="#F5F5F5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                                                </svg>
                                            </div>
                                        )}
                                        <span className="leading-[20px]">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                            {loading ? (
                                <div className="flex justify-center items-center h-40">
                                    <p className="text-secondary-500">Loading...</p>
                                </div>
                            ) : curatedVideos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-secondary-500">
                                    <p>큐레이션된 영상이 없어요.</p>
                                    <Link href="/admin" className="text-primary-500 hover:underline mt-2">
                                        + 영상 추가하기
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 pb-4">
                                    {curatedVideos.map((video) => (
                                        <Link href={`/session/${video.video_id}`} key={video.id} className="block">
                                            <div className="bg-surface rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                                                <div className="aspect-video relative bg-secondary-300">
                                                    <img
                                                        src={video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                                        {Math.floor(video.snippet_duration / 60)}:{String(Math.floor(video.snippet_duration % 60)).padStart(2, '0')}
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-secondary-900 line-clamp-2 mb-1">
                                                        {video.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                                                        {video.difficulty && (
                                                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                                                                {video.difficulty === 'beginner' ? '초급' : video.difficulty === 'intermediate' ? '중급' : '고급'}
                                                            </span>
                                                        )}
                                                        <span>{video.transcript?.length || 0} sentences</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Right Column: Recent Sessions */}
                    <section className="bg-[#f3f3f3] rounded-2xl p-4 h-full w-[67%] flex flex-col">
                        <div className="flex items-center justify-between relative mb-4 shrink-0">
                            <h2 className="text-xl font-semibold text-black">학습 중인 영상</h2>
                            <div className="flex items-center gap-2">
                                {isEditMode ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                if (selectedVideoIds.size === recentSessions.length) {
                                                    setSelectedVideoIds(new Set());
                                                } else {
                                                    setSelectedVideoIds(new Set(recentSessions.map(s => s.videoId)));
                                                }
                                            }}
                                            className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
                                        >
                                            {selectedVideoIds.size === recentSessions.length ? '전체 해제' : '전체 선택'}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (selectedVideoIds.size === 0) return;
                                                const idsToDelete = Array.from(selectedVideoIds);
                                                for (const videoId of idsToDelete) {
                                                    await removeSession(videoId);
                                                }
                                                setSelectedVideoIds(new Set());
                                                setIsEditMode(false);
                                            }}
                                            disabled={selectedVideoIds.size === 0}
                                            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${selectedVideoIds.size > 0
                                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                : 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                                                }`}
                                        >
                                            삭제 {selectedVideoIds.size > 0 && `(${selectedVideoIds.size})`}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditMode(false);
                                                setSelectedVideoIds(new Set());
                                            }}
                                            className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
                                        >
                                            취소
                                        </button>
                                    </>
                                ) : (
                                    recentSessions.length > 0 && (
                                        <button
                                            onClick={() => setIsEditMode(true)}
                                            className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
                                        >
                                            편집
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                            {recentSessions.length > 0 ? (
                                <div className="flex flex-col gap-4 pb-4">
                                    {recentSessions.map((session) => {
                                        // Find video info from curatedVideos if possible
                                        const curatedVideo = curatedVideos.find(v => v.video_id === session.videoId);
                                        const isSelected = selectedVideoIds.has(session.videoId);
                                        return (
                                            <div
                                                key={session.id}
                                                onClick={() => !isEditMode && router.push(`/session/${session.videoId}`)}
                                                className={`cursor-pointer ${isEditMode ? 'pointer-events-auto' : ''}`}
                                            >
                                                <SessionCard
                                                    title={curatedVideo?.title || `Video ${session.videoId}`}
                                                    thumbnailUrl={curatedVideo?.thumbnail_url || `https://img.youtube.com/vi/${session.videoId}/hqdefault.jpg`}
                                                    progress={session.progress}
                                                    timeLeft={session.timeLeft}
                                                    totalSentences={session.totalSentences}
                                                    isEditMode={isEditMode}
                                                    isSelected={isSelected}
                                                    onToggleSelection={() => {
                                                        const newSelected = new Set(selectedVideoIds);
                                                        if (isSelected) {
                                                            newSelected.delete(session.videoId);
                                                        } else {
                                                            newSelected.add(session.videoId);
                                                        }
                                                        setSelectedVideoIds(newSelected);
                                                    }}
                                                    onClick={() => { }}
                                                />
                                            </div>
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

                </div>
            </main>
        </div>
    );
}
