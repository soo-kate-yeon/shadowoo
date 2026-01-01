"use client";

import { useRouter } from "next/navigation";

interface ListeningHeaderProps {
  title: string;
  onBack?: () => void;
  onNextStep?: () => void;
}

export function ListeningHeader({
  title,
  onBack,
  onNextStep,
}: ListeningHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="h-16 bg-surface border-1 border-secondary-500/30 flex items-center justify-between px-8 shrink-0 relative z-10 transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-4 overflow-hidden">
        <button
          onClick={handleBack}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-body-medium font-medium transition-colors shrink-0"
        >
          학습 종료
        </button>
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight truncate max-w-2xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center bg-secondary-100 p-1 rounded-xl">
        <div className="px-4 py-1.5 rounded-sm text-sm font-bold bg-white text-primary-500 transition-all">
          리스닝 모드
        </div>
        <button
          onClick={onNextStep}
          className="px-4 py-1.5 rounded-sm text-sm font-medium transition-all text-neutral-500 hover:text-neutral-900"
        >
          쉐도잉 모드
        </button>
      </div>
    </div>
  );
}
