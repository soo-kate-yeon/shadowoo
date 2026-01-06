"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SessionCard from "@/components/SessionCard";
import { useStore } from "@/lib/store";
import TopNav from "@/components/TopNav";
import VideoCard from "@/components/VideoCard";
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
  const [learningSessions, setLearningSessions] = useState<any[]>([]);
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
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#faf9f5" }}
      >
        <TopNav />
        <main className="flex-1 flex items-center justify-center">
          <p style={{ color: "#908f8c" }}>Loading...</p>
        </main>
      </div>
    );
  }

  const isGuest = !user;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#faf9f5" }}
    >
      <TopNav />

      {/* Main Content - 100vh minus TopNav (56px), with 24px padding */}
      <main
        className="flex-1 h-[calc(100vh-56px)] overflow-hidden"
        style={{ padding: 24 }}
      >
        {/* Two-column layout with 1:1 ratio and 24px gap */}
        <div className="h-full flex" style={{ gap: 24 }}>
          {/* Left Section: Learning Sessions (50%) */}
          <section className="flex flex-col h-full min-h-0 flex-1">
            {/* Header - 24px gap between title and filters */}
            <div
              className="flex flex-col shrink-0"
              style={{ gap: 24, marginBottom: 24 }}
            >
              <h2 className="text-xl font-bold" style={{ color: "#0c0b09" }}>
                어떤 영상으로 쉐도잉을 해보시겠어요?
              </h2>

              {/* Difficulty Filter */}
              <div className="flex" style={{ gap: 8 }}>
                {[
                  { id: "all", label: "전체" },
                  { id: "beginner", label: "초급" },
                  { id: "intermediate", label: "중급" },
                  { id: "advanced", label: "고급" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedDifficulty(cat.id)}
                    className="flex items-center rounded-lg text-sm font-medium transition-colors"
                    style={{
                      padding: "8px 12px",
                      gap: 6,
                      backgroundColor:
                        selectedDifficulty === cat.id ? "#0c0b09" : "#f0efeb",
                      color:
                        selectedDifficulty === cat.id ? "#ffffff" : "#565552",
                    }}
                  >
                    {selectedDifficulty === cat.id && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M13.3333 4L6 11.3333L2.66667 8"
                          stroke="#ffffff"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.6"
                        />
                      </svg>
                    )}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Video Grid - 3 columns with 24px gap */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p style={{ color: "#908f8c" }}>Loading...</p>
                </div>
              ) : learningSessions.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-40"
                  style={{ color: "#908f8c" }}
                >
                  <p>큐레이션된 학습 세션이 없어요.</p>
                  <Link
                    href="/admin"
                    className="hover:underline"
                    style={{ color: "#b45000", marginTop: 8 }}
                  >
                    + 세션 추가하기
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 24,
                      paddingBottom: 24,
                    }}
                  >
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
                    <div
                      className="absolute inset-0 pointer-events-none rounded-2xl"
                      style={{
                        background:
                          "linear-gradient(to bottom, transparent, rgba(250, 249, 245, 0.3), rgba(250, 249, 245, 0.7))",
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Right Section: Continue Learning (50%) */}
          <section className="flex flex-col h-full min-h-0 flex-1">
            {/* Header */}
            <div
              className="flex items-center justify-between shrink-0"
              style={{ marginBottom: 24 }}
            >
              <h2 className="text-xl font-bold" style={{ color: "#0c0b09" }}>
                계속 학습하기
              </h2>
              <div className="flex items-center" style={{ gap: 8 }}>
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
                      className="text-sm font-medium transition-colors"
                      style={{ padding: "8px 12px", color: "#565552" }}
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
                      className="text-sm font-medium rounded-lg transition-colors"
                      style={{
                        padding: "8px 12px",
                        backgroundColor:
                          selectedVideoIds.size > 0 ? "#fce8e8" : "#f0efeb",
                        color:
                          selectedVideoIds.size > 0 ? "#cf1e29" : "#908f8c",
                        cursor:
                          selectedVideoIds.size === 0
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      삭제
                      {selectedVideoIds.size > 0 &&
                        ` (${selectedVideoIds.size})`}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setSelectedVideoIds(new Set());
                      }}
                      className="text-sm font-medium transition-colors"
                      style={{ padding: "8px 12px", color: "#565552" }}
                    >
                      취소
                    </button>
                  </>
                ) : (
                  recentSessions.length > 0 && (
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="text-sm font-medium transition-colors"
                      style={{ padding: "8px 12px", color: "#565552" }}
                    >
                      편집
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Scrollable Session List - 24px gap between items */}
            <div
              className="flex-1 min-h-0 overflow-y-auto rounded-xl relative"
              style={{ backgroundColor: isGuest ? "#f0efeb" : "transparent" }}
            >
              {isGuest && (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(240, 239, 235, 0.8)",
                    padding: 24,
                  }}
                >
                  <div
                    className="rounded-xl text-center"
                    style={{
                      padding: 20,
                      backgroundColor: "#ffffff",
                      border: "1px solid #dfdedb",
                    }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#565552" }}
                    >
                      로그인하면 최근 학습했던 영상을
                      <br />
                      여기서 바로 이어볼 수 있어요!
                    </p>
                  </div>
                </div>
              )}

              {recentSessions.length > 0 ? (
                <div
                  className="flex flex-col"
                  style={{ gap: 24, paddingBottom: 24 }}
                >
                  {recentSessions.map((session) => {
                    const learningSession = learningSessions.find(
                      (s) => s.source_video_id === session.videoId,
                    );
                    const isSelected = selectedVideoIds.has(session.videoId);

                    return (
                      <SessionCard
                        key={session.id}
                        title={
                          learningSession?.title || `Video ${session.videoId}`
                        }
                        thumbnailUrl={
                          learningSession?.thumbnail_url ||
                          `https://img.youtube.com/vi/${session.videoId}/hqdefault.jpg`
                        }
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
                        onClick={() => {
                          router.push(
                            `/listening/${session.videoId}${learningSession ? `?sessionId=${learningSession.id}` : ""}`,
                          );
                        }}
                        onMouseEnter={() => {
                          prefetchVideo(session.videoId);
                          if (learningSession) {
                            prefetchSession(learningSession.id);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-full"
                  style={{ color: "#908f8c" }}
                >
                  <p className="text-sm">아직 학습 중인 영상이 없어요.</p>
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
