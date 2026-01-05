"use client";

import { useState, useEffect } from "react";
import AuthForm from "@/components/auth/AuthForm";
import LoginButton from "@/components/auth/LoginButton";
import { Button } from "@/components/ui/button";

export function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Reset state when modal opens or defaultMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setShowEmailForm(false);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors z-10"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="p-8 sm:p-12 max-h-[90vh] overflow-y-auto">
          <div className="mb-10 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight leading-tight">
              {mode === "login" ? "다시 오셨군요!" : "계정 만들기"}
            </h2>
            <p className="text-lg text-neutral-500">
              {mode === "login"
                ? "로그인하고 학습을 이어가세요."
                : "이메일과 비밀번호를 입력해 계정을 만드세요."}
            </p>
          </div>

          <div className="flex flex-col gap-6 w-full">
            {/* 1) Google Login */}
            <LoginButton
              provider="google"
              variant="social"
              size="social"
              className="w-full bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 h-14 text-lg justify-start px-6 gap-4 shadow-sm rounded-2xl"
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

            {/* 2) Email Login Button */}
            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="w-full bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 h-14 text-lg justify-start px-6 gap-4 shadow-sm rounded-2xl flex items-center transition-colors"
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
            </button>

            {/* 3) Email Form (conditionally shown) */}
            {showEmailForm && (
              <>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-neutral-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-neutral-500 font-medium">
                      또는
                    </span>
                  </div>
                </div>

                <AuthForm mode={mode} />
              </>
            )}

            {/* Switch Mode */}
            <p className="text-center text-neutral-500">
              {mode === "login"
                ? "계정이 없으신가요?"
                : "이미 계정이 있으신가요?"}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-primary-600 font-semibold hover:underline"
              >
                {mode === "login" ? "회원가입" : "로그인"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
