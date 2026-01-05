"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SessionCard from "@/components/SessionCard";
import UserMenu from "@/components/auth/UserMenu";
import { useStore } from "@/lib/store";
import TopNav from "@/components/TopNav";
import VideoCard from "@/components/VideoCard";
import { CuratedVideo } from "@/types";
import { usePrefetch } from "@/hooks/usePrefetch";
import GuestViewOverlay from "@/components/home/GuestViewOverlay";

export default function HomePage() {
  const router = useRouter();
  const { prefetchVideo, prefetchSession } = usePrefetch();
  const sessions = useStore((state) => state.sessions);
  const removeSession = useStore((state) => state.removeSession);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(
    new Set(),
  );

  // Curated videos state
  const [learningSessions, setLearningSessions] = useState<any[]>([]); // Using any for now to match API response, or import LearningSession
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Hydration fix
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth state for guest view
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Fetch learning sessions
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
        setIsAuthLoading(false);

        setLoading(true);
        const params = new URLSearchParams();
        if (selectedDifficulty !== "all") {
          params.append("difficulty", selectedDifficulty);
        }

        const response = await fetch(`/api/learning-sessions?${params}`);
        if (!response.ok) throw new Error("Failed to fetch sessions");

        const data = await response.json();
        setLearningSessions(data.sessions || []);
      } catch (error) {
        console.error("Failed to load learning sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [selectedDifficulty]);

  // Derived State
  const recentSessions = Object.values(sessions).sort(
    (a, b) => b.lastAccessedAt - a.lastAccessedAt,
  );

  if (!isMounted || isAuthLoading) {
    return (
      <div className="min-h-screen bg-secondary-200 flex flex-col">
        <TopNav />
        <main className="flex-1 max-w-[1920px] w-full mx-auto p-8 flex items-center justify-center">
          <p className="text-secondary-500">Loading...</p>
        </main>
      </div>
    );
  }

  const isGuest = !user;

  return (
    <div className="min-h-screen bg-secondary-200 flex flex-col">
      <TopNav />

      <main className="flex-1 max-w-[1920px] w-full mx-auto p-8 flex flex-col gap-6 h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex flex-row gap-8 items-start h-full">
          {/* Left Column: Learning Sessions */}
          <section className="flex flex-col gap-4 w-1/2 h-full min-h-0 relative">
            <div className="flex flex-col gap-4 shrink-0">
              <h2 className="text-2xl font-semibold text-black">학습할 영상</h2>

              {/* Difficulty Filter */}
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {[
                  { id: "all", label: "전체" },
                  { id: "beginner", label: "초급" },
                  { id: "intermediate", label: "중급" },
                  { id: "advanced", label: "고급" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedDifficulty(cat.id)}
                    className={`
                                            flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors whitespace-nowrap
                                            ${
                                              selectedDifficulty === cat.id
                                                ? "bg-[#2c2c2c] text-[#f5f5f5]"
                                                : "bg-[#f5f5f5] text-[#757575] hover:bg-[#e5e5e5]"
                                            }
                                        `}
                  >
                    {selectedDifficulty === cat.id && (
                      <div className="relative shrink-0 size-[16px]">
                        <svg
                          className="block size-full"
                          fill="none"
                          viewBox="0 0 16 16"
                        >
                          <path
                            d="M13.3333 4L6 11.3333L2.66667 8"
                            stroke="#F5F5F5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.6"
                          />
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
              ) : learningSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-secondary-500">
                  <p>큐레이션된 학습 세션이 없어요.</p>
                  <Link
                    href="/admin"
                    className="text-primary-500 hover:underline mt-2"
                  >
                    + 세션 추가하기
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-8 pb-8">
                    {learningSessions.map((session) => (
                      <VideoCard
                        key={session.id}
                        title={session.title}
                        thumbnailUrl={session.thumbnail_url}
                        duration={`${Math.floor(session.duration / 60)}:${String(Math.floor(session.duration % 60)).padStart(2, "0")}`}
                        description={session.description || ""}
                        sentenceCount={session.sentence_ids?.length || 0}
                        onClick={() => {
                          if (isGuest) return;
                          router.push(
                            `/listening/${session.source_video_id}?sessionId=${session.id}`,
                          );
                        }}
                        onMouseEnter={() => {
                          if (isGuest) return;
                          prefetchVideo(session.source_video_id);
                          prefetchSession(session.id);
                        }}
                      />
                    ))}
                  </div>
                  {isGuest && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/60 pointer-events-none rounded-2xl" />
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Right Column: Recent Sessions */}
          <section className="bg-secondary-50 rounded-3xl p-6 h-full w-1/2 flex flex-col border border-secondary-300/50 relative overflow-hidden">
            {isGuest && (
              <div className="absolute inset-0 z-10 bg-secondary-50/60 backdrop-blur-[2px] flex items-center justify-center p-8 text-center">
                <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-sm border border-secondary-200 w-full max-w-sm">
                  <p className="text-secondary-600 font-medium">
                    로그인하면 최근 학습했던 영상을 여기서 바로 이어볼 수
                    있어요!
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between relative mb-4 shrink-0">
              <h2 className="text-xl font-semibold text-black">
                학습 중인 영상
              </h2>
              <div className="flex items-center gap-2">
                {isEditMode ? (
                  <>
                    <button
                      onClick={() => {
                        if (selectedVideoIds.size === recentSessions.length) {
                          setSelectedVideoIds(new Set());
                        } else {
                          setSelectedVideoIds(
                            new Set(recentSessions.map((s) => s.videoId)),
                          );
                        }
                      }}
                      className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
                    >
                      {selectedVideoIds.size === recentSessions.length
                        ? "전체 해제"
                        : "전체 선택"}
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
                      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        selectedVideoIds.size > 0
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-secondary-100 text-secondary-400 cursor-not-allowed"
                      }`}
                    >
                      삭제{" "}
                      {selectedVideoIds.size > 0 &&
                        `(${selectedVideoIds.size})`}
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
                    // Find session info from learningSessions if possible
                    const learningSession = learningSessions.find(
                      (s) => s.source_video_id === session.videoId,
                    );
                    const isSelected = selectedVideoIds.has(session.videoId);

                    return (
                      <div
                        key={session.id}
                        onClick={() =>
                          !isEditMode &&
                          router.push(
                            `/listening/${session.videoId}${learningSession ? `?sessionId=${learningSession.id}` : ""}`,
                          )
                        }
                        className={`cursor-pointer ${isEditMode ? "pointer-events-auto" : ""}`}
                      >
                        <SessionCard
                          title={
                            learningSession?.title || `Video ${session.videoId}`
                          }
                          thumbnailUrl={
                            learningSession?.thumbnail_url ||
                            `https://img.youtube.com/vi/${session.videoId}/hqdefault.jpg`
                          }
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
                          onClick={() => {}}
                          onMouseEnter={() => {
                            prefetchVideo(session.videoId);
                            // Fallback for session if learningSession is not yet loaded or doesn't match
                            if (learningSession) {
                              prefetchSession(learningSession.id);
                            }
                          }}
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

      {isMounted && isGuest && <GuestViewOverlay />}
    </div>
  );
}
