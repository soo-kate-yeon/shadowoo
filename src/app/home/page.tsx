'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SessionCard from '@/components/SessionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
    const [url, setUrl] = useState('');
    const router = useRouter();

    const handleStartSession = () => {
        if (!url) return;
        console.log('Starting session with URL:', url);
        // router.push(`/session?url=${encodeURIComponent(url)}`);
    };

    return (
        <div className="min-h-screen bg-secondary-200 flex flex-col">
            {/* Header */}
            <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
                <h1 className="text-xl font-bold text-primary-500">ShadowingNinja</h1>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-neutral-600">
                        로그아웃
                    </Button>
                    <Avatar>
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <main className="flex-1 max-w-[1440px] w-full mx-auto p-8 flex flex-col gap-12">
                {/* Input Section */}
                <section className="flex flex-col gap-6 pt-12 items-center">
                    <h2 className="text-headline-large text-neutral-900 text-center">
                        새로운 쉐도잉 세션 시작하기
                    </h2>
                    <div className="flex gap-4 max-w-2xl w-full">
                        <Input
                            type="text"
                            placeholder="YouTube URL을 입력하세요"
                            className="flex-1 h-12 text-body-large"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <Button
                            onClick={handleStartSession}
                            size="lg"
                            className="h-12 px-8 text-title-medium"
                        >
                            시작하기
                        </Button>
                    </div>
                </section>

                {/* Recent Sessions Section */}
                <section className="flex flex-col gap-6">
                    <h3 className="text-title-section text-neutral-900 border-b border-border pb-4">
                        최근 학습한 세션
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Placeholder data for recent sessions */}
                        <SessionCard
                            title="Steve Jobs' 2005 Stanford Commencement Address"
                            thumbnailUrl="https://img.youtube.com/vi/UF8uR6Z6KLc/maxresdefault.jpg"
                            progress={75}
                            timeLeft="14:30"
                            totalSentences={45}
                        />
                        <SessionCard
                            title="The power of vulnerability | Brené Brown"
                            thumbnailUrl="https://img.youtube.com/vi/iCvmsMzlF7o/maxresdefault.jpg"
                            progress={30}
                            timeLeft="20:19"
                            totalSentences={62}
                        />
                        <SessionCard
                            title="How great leaders inspire action | Simon Sinek"
                            thumbnailUrl="https://img.youtube.com/vi/qp0HIF3SfI4/maxresdefault.jpg"
                            progress={100}
                            timeLeft="18:04"
                            totalSentences={58}
                        />
                    </div>
                </section>
            </main>
        </div>
    );
}
