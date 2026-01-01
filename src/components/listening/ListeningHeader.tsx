"use client";

import { useRouter } from "next/navigation";

interface ListeningHeaderProps {
    title: string;
    onBack?: () => void;
    onNextStep?: () => void;
}

export function ListeningHeader({ title, onBack, onNextStep }: ListeningHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <div className="h-[80px] bg-secondary-300 border-b border-secondary-500/30 flex items-center justify-between px-8 shrink-0 relative z-10">
            <div className="flex items-center gap-8 overflow-hidden">
                <button
                    onClick={handleBack}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-body-large font-medium transition-colors shrink-0"
                >
                    학습 종료
                </button>
                <h1 className="text-xl font-semibold text-neutral-900 tracking-tight truncate max-w-2xl">
                    {title}
                </h1>
            </div>

            <div className="flex gap-3 shrink-0">
                <button
                    onClick={onNextStep}
                    className="bg-secondary-100 hover:bg-secondary-300 text-primary-500 px-4 py-2 rounded-xl text-body-large font-medium transition-colors"
                >
                    쉐도잉 시작
                </button>
            </div>
        </div>
    );
}
