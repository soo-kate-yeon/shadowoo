import { useState } from "react";
import { CornerDownLeft, Save, Check } from "lucide-react";
import HighlightCard from "../HighlightCard";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export interface Highlight {
    id?: string;
    text: string;
    comment: string;
}

interface AnalysisPanelProps {
    highlights: Highlight[];
    videoId: string;
    sentenceId: string;
    sentenceText: string;
    onRemoveHighlight?: (id: string) => void;
    onRestoreHighlight?: (highlight: Highlight) => void;
}

type FeedbackType = 'too_fast' | 'unknown_words' | 'linking_sounds';

interface AIResponse {
    analysis: string;
    tips: string;
    focusPoint: string;
}

export function AnalysisPanel({
    highlights,
    videoId,
    sentenceId,
    sentenceText,
    onRemoveHighlight,
    onRestoreHighlight
}: AnalysisPanelProps) {
    const [analysisState, setAnalysisState] = useState<"initial" | "loading" | "done">("initial");
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType[]>([]);
    const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const addAINote = useStore(state => state.addAINote);

    const toggleFeedback = (type: FeedbackType) => {
        setSelectedFeedback(prev => {
            const isSelected = prev.includes(type);
            const newSelection = isSelected
                ? prev.filter(t => t !== type)
                : [...prev, type];

            // Trigger analysis if it's the first selection
            if (newSelection.length > 0 && analysisState === 'initial') {
                handleAnalyze(newSelection);
            }

            return newSelection;
        });
    };

    const handleAnalyze = async (feedback: FeedbackType[]) => {
        setAnalysisState("loading");

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sentence: sentenceText,
                    feedbackTypes: feedback
                })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            setAiResponse(data);
            setAnalysisState("done");
        } catch (error) {
            console.error(error);
            toast.error("분석을 불러오는데 실패했습니다.");
            setAnalysisState("initial");
        }
    };

    const handleSaveNote = () => {
        if (!aiResponse) return;

        addAINote({
            id: crypto.randomUUID(),
            videoId,
            sentenceId,
            sentenceText,
            userFeedback: selectedFeedback,
            aiResponse,
            createdAt: Date.now()
        });

        setIsSaved(true);
        toast.success("AI 노트가 저장되었습니다.");
    };

    const handleDeleteHighlight = (index: number) => {
        const highlight = highlights[index];
        if (!highlight.id || !onRemoveHighlight) return;

        onRemoveHighlight(highlight.id);

        toast("하이라이트가 삭제되었습니다.", {
            action: {
                label: "실행 취소",
                onClick: () => onRestoreHighlight?.(highlight),
            },
        });
    };

    return (
        <div className="bg-secondary-200 rounded-2xl p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-4 w-full">
                <h3 className="text-body-large font-medium text-neutral-900">이 문장이 왜 어려웠나요?</h3>

                {/* Tags */}
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => toggleFeedback('too_fast')}
                        className={`px-3 py-2 rounded-lg text-body-large transition-colors border ${selectedFeedback.includes('too_fast')
                            ? 'bg-secondary-50 text-primary-500 border-primary-500'
                            : 'bg-secondary-50 text-secondary-500 border-transparent hover:bg-white hover:border-primary-500/20'
                            }`}
                    >
                        속도가 빨라요
                    </button>
                    <button
                        onClick={() => toggleFeedback('unknown_words')}
                        className={`px-3 py-2 rounded-lg text-body-large transition-colors border ${selectedFeedback.includes('unknown_words')
                            ? 'bg-secondary-50 text-primary-500 border-primary-500'
                            : 'bg-secondary-50 text-secondary-500 border-transparent hover:bg-white hover:border-primary-500/20'
                            }`}
                    >
                        모르는 단어가 많아요
                    </button>
                    <button
                        onClick={() => toggleFeedback('linking_sounds')}
                        className={`px-3 py-2 rounded-lg text-body-large transition-colors border ${selectedFeedback.includes('linking_sounds')
                            ? 'bg-secondary-50 text-primary-500 border-primary-500'
                            : 'bg-secondary-50 text-secondary-500 border-transparent hover:bg-white hover:border-primary-500/20'
                            }`}
                    >
                        연음 때문에 알아듣기 힘들어요
                    </button>
                </div>

                {/* AI Analysis Area */}
                {analysisState === "loading" && (
                    <div className="w-full bg-secondary-500/15 rounded-lg py-4 flex items-center justify-center">
                        <p className="text-secondary-500 text-body-large animate-pulse">쉐도우가 힌트를 생성하고 있어요...</p>
                    </div>
                )}

                {analysisState === "done" && aiResponse && (
                    <div className="flex flex-col gap-4 animate-in fade-in bg-white rounded-xl p-5 border border-secondary-500/20 shadow-sm">

                        {/* Analysis Section */}
                        <div className="flex gap-3 items-start">
                            <span className="text-xl">🧐</span>
                            <div className="flex-1">
                                <h4 className="font-semibold text-neutral-900 mb-1">분석</h4>
                                <p className="text-secondary-600 leading-relaxed text-sm">
                                    {aiResponse.analysis}
                                </p>
                            </div>
                        </div>

                        <div className="h-px bg-secondary-100" />

                        {/* Tips Section */}
                        <div className="flex gap-3 items-start">
                            <span className="text-xl">💡</span>
                            <div className="flex-1">
                                <h4 className="font-semibold text-neutral-900 mb-1">팁</h4>
                                <p className="text-secondary-600 leading-relaxed text-sm">
                                    {aiResponse.tips}
                                </p>
                            </div>
                        </div>

                        <div className="h-px bg-secondary-100" />

                        {/* Focus Point Section */}
                        <div className="flex gap-3 items-start">
                            <span className="text-xl">🎯</span>
                            <div className="flex-1">
                                <h4 className="font-semibold text-neutral-900 mb-1">집중 포인트</h4>
                                <p className="text-primary-600 font-medium text-sm">
                                    {aiResponse.focusPoint}
                                </p>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleSaveNote}
                                disabled={isSaved}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                    ${isSaved
                                        ? 'bg-green-100 text-green-700 cursor-default'
                                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                    }
                                `}
                            >
                                {isSaved ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        저장됨
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        노트에 저장
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Separator */}
                <div className="h-px w-full bg-secondary-500/30 my-1" />

                {/* Highlights Section */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-body-large font-medium text-neutral-900">문장 하이라이트</h3>

                    {highlights.length === 0 ? (
                        <p className="text-secondary-500 text-body-large text-center py-2">
                            아직 하이라이트한 표현이 없어요
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {highlights.map((h, i) => (
                                <HighlightCard
                                    key={i}
                                    highlightedSentence={h.text}
                                    userCaption={h.comment}
                                    onDelete={() => handleDeleteHighlight(i)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
