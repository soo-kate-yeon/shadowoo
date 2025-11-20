'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyStore } from '@/store/useStudyStore';
import { extractVideoId } from '@/lib/transcript-parser';

export default function HomePage() {
  const router = useRouter();
  const { sessions } = useStudyStore();
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateSession = async () => {
    setError('');
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
      setError('유효한 YouTube URL을 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      // Fetch transcript
      const response = await fetch(`/api/transcript?videoId=${videoId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '자막을 가져올 수 없습니다');
      }

      // Navigate to study session
      router.push(`/study/${videoId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const inProgressSessions = sessions.filter(s => !s.isCompleted);
  const completedSessions = sessions.filter(s => s.isCompleted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            ShadowingNinja
          </h1>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Study Material */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Study Material</h2>
              <p className="text-gray-600">YouTube 영상으로 새로운 학습 세션을 시작하세요</p>
            </div>

            {/* Video URL Input */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
                />
                <button
                  onClick={handleCreateSession}
                  disabled={isLoading || !videoUrl}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? '로딩 중...' : '시작하기'}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Sample Videos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Video Thumbnail</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        Sample Video Title {i}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">20:34</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      Sample description for the video content
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sessions */}
          <div className="space-y-6">
            {/* In Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">진행 중</h3>
              {inProgressSessions.length === 0 ? (
                <p className="text-sm text-gray-500">진행 중인 세션이 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {inProgressSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => router.push(`/study/${session.videoId}`)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 cursor-pointer transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                        {session.videoTitle}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(session.updatedAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">완료</h3>
              {completedSessions.length === 0 ? (
                <p className="text-sm text-gray-500">완료된 세션이 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {completedSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => router.push(`/study/${session.videoId}`)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 cursor-pointer transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                        {session.videoTitle}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(session.updatedAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
