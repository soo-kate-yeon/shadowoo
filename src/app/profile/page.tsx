"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import TopNav from "@/components/TopNav";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import AdminButton from "./AdminButton";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const sessions = useStore((state) => state.sessions);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        router.push("/login");
      }
    };
    getUser();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signup");
    router.refresh();
  };

  const activeSessionsCount = Object.keys(sessions).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary-200 flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-[600px] w-full mx-auto p-8 flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">프로필</h1>

        {/* Account Information Section */}
        <section className="bg-surface rounded-2xl p-6 border border-secondary-300/50">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            계정 정보
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-neutral-900">
                  {user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    "사용자"}
                </p>
                <p className="text-base text-secondary-500">{user.email}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Statistics Section */}
        <section className="bg-surface rounded-2xl p-6 border border-secondary-300/50">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            학습 현황
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-200">
              <p className="text-sm text-secondary-500 mb-1">학습 중인 영상</p>
              <p className="text-3xl font-bold text-primary-500">
                {activeSessionsCount}
              </p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-200">
              <p className="text-sm text-secondary-500 mb-1">계정 생성일</p>
              <p className="text-base font-semibold text-neutral-900">
                {new Date(user.created_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Plan Information Section */}
        <section className="bg-surface rounded-2xl p-6 border border-secondary-300/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-neutral-900">
              플랜 정보
            </h2>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
              Beginner
            </span>
          </div>
          <p className="text-base text-secondary-600 mb-4">
            기본 학습 기능을 제공하는 무료 플랜입니다.
          </p>
          <Button
            onClick={() => router.push("/pricing")}
            className="w-full bg-primary-600 text-white hover:bg-primary-700 font-semibold py-3 rounded-xl transition-colors"
          >
            플랜 업그레이드
          </Button>
        </section>

        {/* Admin Access Section */}
        {user && <AdminButton userId={user.id} />}

        {/* Logout Section */}
        <section className="bg-surface rounded-2xl p-6 border border-secondary-300/50">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">설정</h2>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-2 border-secondary-300 text-secondary-600 hover:bg-secondary-100 font-semibold py-3 rounded-xl transition-colors"
          >
            로그아웃
          </Button>
        </section>
      </main>
    </div>
  );
}
