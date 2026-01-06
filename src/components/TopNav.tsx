"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export default function TopNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const isSessionActive =
    pathname === "/home" ||
    pathname?.startsWith("/session") ||
    pathname?.startsWith("/shadowing");
  const isArchiveActive = pathname?.startsWith("/archive");

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Failed to get user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header
      className="h-14 flex items-center justify-between sticky top-0 z-10"
      style={{
        backgroundColor: "#f0efeb",
        borderBottom: "1px solid #dfdedb",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      {/* Left: Navigation */}
      <nav className="flex items-center gap-6">
        <Link
          href="/home"
          className="text-base font-medium transition-colors"
          style={{
            color: isSessionActive ? "#b45000" : "#565552",
          }}
        >
          세션
        </Link>
        <Link
          href="/archive"
          className="text-base font-medium transition-colors"
          style={{
            color: isArchiveActive ? "#b45000" : "#565552",
          }}
        >
          노트
        </Link>
      </nav>

      {/* Right: Profile Icon */}
      {isLoading ? (
        <div
          className="w-9 h-9 rounded-full animate-pulse"
          style={{ backgroundColor: "#dfdedb" }}
        />
      ) : user ? (
        <Link
          href="/profile"
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-opacity hover:opacity-80"
          style={{
            backgroundColor: "#dfdedb",
            color: "#565552",
          }}
        >
          {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
            <img
              src={user.user_metadata.avatar_url || user.user_metadata.picture}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            user.email?.[0]?.toUpperCase() || "U"
          )}
        </Link>
      ) : null}
    </header>
  );
}
