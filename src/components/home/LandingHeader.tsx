"use client";

import Link from "next/link";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";

export function LandingHeader() {
  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-12 max-w-[1440px] mx-auto w-full">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-display-small font-bold text-neutral-900 tracking-tight">
          Shadowing Ninja
        </span>
      </Link>

      {/* Auth Trigger */}
      <nav className="flex items-center gap-4">
        <AuthSidePanel triggerText="로그인" defaultMode="login" />
        <AuthSidePanel triggerText="시작하기" defaultMode="signup" />
      </nav>
    </header>
  );
}
