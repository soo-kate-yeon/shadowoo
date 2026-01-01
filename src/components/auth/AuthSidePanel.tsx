"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import AuthForm from "@/components/auth/AuthForm";
import LoginButton from "@/components/auth/LoginButton";
import { Button } from "@/components/ui/button";

export function AuthSidePanel({
  triggerText = "로그인",
  defaultMode = "login",
}: {
  triggerText?: string;
  defaultMode?: "login" | "signup";
}) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [isOpen, setIsOpen] = useState(false);

  // Reset state when panel opens/closes or defaultMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="text-body-large font-medium text-neutral-900 hover:bg-neutral-100"
        >
          {triggerText}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-none sm:w-1/2 p-12 overflow-y-auto duration-500">
        <SheetHeader className="mb-8 space-y-4 text-left">
          <SheetTitle className="text-display-medium text-neutral-900 leading-tight">
            {mode === "login" ? "다시 오셨군요!" : "계정 만들기"}
          </SheetTitle>
          <SheetDescription className="text-headline-small text-neutral-500">
            {mode === "login"
              ? "로그인하고 학습을 이어가세요."
              : "이메일과 비밀번호를 입력해 계정을 만드세요."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
          {/* 1) Email/Password Form */}
          <AuthForm mode={mode} />

          {/* 2) Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-neutral-500 font-medium">또는</span>
            </div>
          </div>

          {/* 3) Google Login */}
          <LoginButton
            provider="google"
            variant="social"
            size="social"
            className="w-full bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 h-14 text-lg justify-start px-6 gap-4 shadow-sm"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="flex-1 text-center font-medium">
              Google로 계속하기
            </span>
          </LoginButton>

          {/* 4) Email Login (Button as requested) */}
          <Button
            variant="outline"
            className="w-full bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 h-14 text-lg justify-start px-6 gap-4 shadow-sm"
            onClick={() => {
              // Focus on the email input if it exists
              document.getElementById("email")?.focus();
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="flex-1 text-center font-medium">
              이메일로 계속하기
            </span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
