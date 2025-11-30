
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ArrowUp, CornerDownLeft } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import imgKimKardashian from "figma:asset/05a7c61b6458a5b0392fad0cf1925b5a714fbe01.png";

// Icons
function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F9F7F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C13.94 2 15.84 2.56 17.46 3.62C19.09 4.68 20.37 6.19 21.15 7.97C21.94 9.74 22.18 11.71 21.87 13.62C21.55 15.54 20.69 17.32 19.38 18.75M12 6V12L16 14M2.5 8.88C2.18 9.84 2.01 10.86 2 11.88M2.83 16C3.39 17.29 4.22 18.45 5.26 19.4M4.64 5.24C4.92 4.93 5.21 4.65 5.53 4.38M8.64 21.42C11.14 22.31 13.88 22.17 16.28 21.04" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F9F7F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 9C16.65 9.87 17 10.92 17 12C17 13.08 16.65 14.13 16 15M19.36 18.36C20.2 17.53 20.86 16.54 21.32 15.44C21.77 14.35 22 13.18 22 12C22 10.82 21.77 9.65 21.32 8.56C20.86 7.46 20.2 6.47 19.36 5.64M11 4.7C11 4.56 10.96 4.43 10.88 4.31C10.8 4.2 10.69 4.1 10.56 4.05C10.44 4 10.29 3.98 10.16 4.01C10.02 4.04 9.9 4.11 9.8 4.2L6.41 7.59C6.28 7.72 6.13 7.82 5.96 7.89C5.78 7.96 5.6 8 5.42 8H3C2.73 8 2.48 8.11 2.29 8.29C2.11 8.48 2 8.73 2 9V15C2 15.27 2.11 15.52 2.29 15.71C2.48 15.89 2.73 16 3 16H5.42C5.6 16 5.78 16.04 5.96 16.11C6.13 16.18 6.28 16.28 6.41 16.41L9.8 19.8C9.9 19.9 10.02 19.96 10.16 19.99C10.29 20.02 10.44 20 10.56 19.95C10.69 19.9 10.8 19.81 10.88 19.69C10.96 19.57 11 19.44 11 19.3V4.7Z" />
    </svg>
  );
}

// Custom curved arrow icon for comments
function ReplyArrowIcon() {
    return (
        <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L1 17" stroke="#B4A69E" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round"/>
            <path d="M1 17L17 17" stroke="#B4A69E" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    );
}

interface SessionPageProps {
  onBack: () => void;
  onNextStep?: () => void;
}

export function SessionPage({ onBack, onNextStep }: SessionPageProps) {
  return (
    <div className="min-h-screen bg-[#ebe8e2] flex flex-col overflow-hidden relative">
      {/* Navigation Header */}
      <div className="h-[80px] bg-[#e7e2d9] border-b border-[#b4a69e]/30 flex items-center justify-between px-8 shrink-0 relative z-10">
        <div className="flex items-center gap-8">
            <button 
                onClick={onBack}
                className="bg-[#ed752a] hover:bg-[#d66a26] text-white px-4 py-2 rounded-xl text-[length:var(--text-base)] font-medium transition-colors"
            >
                학습 종료
            </button>
            <h1 className="text-[length:var(--text-xl)] font-semibold text-black tracking-tight line-clamp-1 max-w-2xl">
                ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game
            </h1>
        </div>
        
        <div className="flex gap-3">
            <button className="bg-[#f1ede5] hover:bg-[#e5e1d9] text-[#ed752a] px-4 py-2 rounded-xl text-[length:var(--text-base)] font-medium transition-colors">
                이전 단계
            </button>
            <button 
                onClick={onNextStep}
                className="bg-[#f1ede5] hover:bg-[#e5e1d9] text-[#ed752a] px-4 py-2 rounded-xl text-[length:var(--text-base)] font-medium transition-colors"
            >
                다음 단계
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-8 h-[calc(100vh-80px)]">
        
        {/* Left: Video Player */}
        <div className="w-1/2 h-full flex flex-col">
             <h2 className="text-[length:var(--text-2xl)] font-bold text-black leading-relaxed mb-6 tracking-tight whitespace-pre-wrap">
                이제, 스크립트를 보며 다시 들어보세요.{'\n'}
                어려운 문장이 있다면 클릭해서 분석해보세요.
             </h2>
             
             <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black group">
                <ImageWithFallback 
                    src={imgKimKardashian}
                    alt="Video Player"
                    className="w-full h-full object-cover opacity-80"
                />
                
                {/* Custom Controls Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-3">
                        {/* Time */}
                        <div className="bg-black/30 backdrop-blur-md px-3 py-2 rounded-full flex items-center gap-2 border border-[#b4a69e]/30">
                            <span className="text-[#f9f7f3] text-[length:var(--text-base)] font-medium">0:03</span>
                            <span className="text-[#f9f7f3]/50 text-[length:var(--text-base)] font-medium">/ 9:40</span>
                        </div>

                         {/* Volume */}
                         <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-full flex items-center border border-[#b4a69e]/30 hover:bg-black/40 cursor-pointer transition-colors">
                            <VolumeIcon />
                        </div>

                        {/* Speed */}
                        <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-1 border border-[#b4a69e]/30 hover:bg-black/40 cursor-pointer transition-colors ml-auto">
                             <ClockIcon />
                             <span className="text-[#f9f7f3] text-[length:var(--text-base)] font-medium">1배</span>
                        </div>
                    </div>
                </div>
             </div>
        </div>

        {/* Right: Script & Analysis */}
        <div className="w-1/2 h-full bg-[#f9f7f3] rounded-2xl p-8 overflow-y-auto relative">
             <ScriptList />
        </div>

      </div>
    </div>
  );
}

// Mock Data for Script
const SCRIPT_DATA = [
    { id: 1, text: "ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game" },
    { id: 2, text: "ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game" },
    { id: 3, text: "ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game" },
    { id: 4, text: "ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game" },
    { id: 5, text: "ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game" },
    { id: 6, text: "ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game" },
];

interface Highlight {
    text: string;
    comment: string;
}

function ScriptList() {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [selection, setSelection] = useState<{id: number, text: string} | null>(null);
    const [highlights, setHighlights] = useState<Record<number, Highlight[]>>({});
    const [commentInput, setCommentInput] = useState("");

    // Handle Text Selection
    const handleMouseUp = (id: number) => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();
        
        if (text && text.length > 0) {
            // Keep the expansion open if it's the same line, otherwise expand this line
            setExpandedId(id);
            setSelection({ id, text });
            setCommentInput(""); // Reset input for new selection
        }
    };

    const handleExpandToggle = (id: number) => {
        // Only toggle if we are NOT selecting text (simple check: no active selection in state)
        if (!selection) {
            setExpandedId(prev => prev === id ? null : id);
        }
    };

    const handleAddHighlight = () => {
        if (!selection || !commentInput.trim()) return;

        setHighlights(prev => ({
            ...prev,
            [selection.id]: [...(prev[selection.id] || []), {
                text: selection.text,
                comment: commentInput
            }]
        }));

        setSelection(null);
        setCommentInput("");
    };

    // Helper to render text with highlights
    const renderTextWithHighlights = (lineId: number, originalText: string) => {
        const lineHighlights = highlights[lineId] || [];
        if (lineHighlights.length === 0) return originalText;

        // Simple replacement strategy for demo (first occurrence)
        // In a real app, use indices to handle multiple occurrences correctly
        let parts = [originalText];
        
        lineHighlights.forEach(h => {
            const newParts: any[] = [];
            parts.forEach(part => {
                if (typeof part === 'string' && part.includes(h.text)) {
                    const split = part.split(h.text);
                    // Join back with the highlighted element
                    // Note: This is a simplified approach that handles one occurrence per split segment
                    for (let i = 0; i < split.length; i++) {
                        newParts.push(split[i]);
                        if (i < split.length - 1) {
                            newParts.push(
                                <span key={`${lineId}-${h.text}-${i}`} className="bg-[#ffe586]">
                                    {h.text}
                                </span>
                            );
                        }
                    }
                } else {
                    newParts.push(part);
                }
            });
            parts = newParts;
        });

        return <>{parts}</>;
    };

    return (
        <div className="flex flex-col gap-6 pb-20">
            {SCRIPT_DATA.map((line) => (
                <div key={line.id} className="flex flex-col gap-4">
                    {/* Script Line */}
                    <div className="relative">
                        <p 
                            onMouseUp={() => handleMouseUp(line.id)}
                            onClick={() => handleExpandToggle(line.id)}
                            className={`
                                text-[length:var(--text-lg)] leading-relaxed cursor-pointer transition-colors select-text
                                ${expandedId === line.id ? "font-semibold text-black" : "font-medium text-[#a6a6a6] hover:text-[#808080]"}
                            `}
                        >
                            {/* If currently selecting this line, show immediate highlight for selection feedback */}
                            {selection?.id === line.id ? (
                                <>
                                    {/* Rough replace for visual feedback during selection - works for unique strings */}
                                    {line.text.split(selection.text).map((part, i, arr) => (
                                        <span key={i}>
                                            {part}
                                            {i < arr.length - 1 && <span className="bg-[#ffe586]">{selection.text}</span>}
                                        </span>
                                    ))}
                                </>
                             ) : (
                                renderTextWithHighlights(line.id, line.text)
                             )}
                        </p>
                        
                        {/* Comment Popover */}
                        {selection?.id === line.id && (
                            <div className="absolute z-50 left-0 -bottom-14 animate-in fade-in zoom-in-95 duration-200">
                                <div className="bg-[#f9f7f3] rounded-xl border border-[#b4a69e]/30 shadow-lg w-[400px] flex items-center gap-2 p-3">
                                    <input 
                                        type="text" 
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        placeholder="코멘트 추가하기"
                                        className="flex-1 bg-transparent border-none outline-none text-[length:var(--text-base)] text-black placeholder:text-[#b4a69e]"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddHighlight()}
                                    />
                                    <button 
                                        onClick={handleAddHighlight}
                                        disabled={!commentInput.trim()}
                                        className={`
                                            w-6 h-6 rounded-full flex items-center justify-center transition-colors
                                            ${commentInput.trim() ? "bg-[#ed752a] hover:bg-[#d66a26]" : "bg-[#b4a69e] cursor-not-allowed"}
                                        `}
                                    >
                                        <ArrowUp className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Analysis Panel (Accordion) */}
                    {expandedId === line.id && (
                        <AnalysisPanel highlights={highlights[line.id] || []} />
                    )}
                </div>
            ))}
             {/* Extra scroll space */}
             <div className="h-20" />
        </div>
    );
}

function AnalysisPanel({ highlights }: { highlights: Highlight[] }) {
    const [analysisState, setAnalysisState] = useState<"initial" | "loading" | "done">("initial");

    const handleTagClick = () => {
        setAnalysisState("loading");
        // Simulate AI loading
        setTimeout(() => {
            setAnalysisState("done");
        }, 1500);
    };

    return (
        <div className="bg-[#ebe8e2] rounded-2xl p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-4 w-full">
                <h3 className="text-[length:var(--text-base)] font-medium text-black">이 문장이 왜 어려웠나요?</h3>
                
                {/* Tags */}
                <div className="flex gap-3 flex-wrap">
                    <button onClick={handleTagClick} className="px-3 py-2 rounded-lg bg-[#f9f7f3] text-[#757575] text-[length:var(--text-base)] hover:bg-white transition-colors border border-transparent hover:border-[#ed752a]/20">
                        속도가 빨라요
                    </button>
                    <button onClick={handleTagClick} className="px-3 py-2 rounded-lg bg-[#f9f7f3] text-[#757575] text-[length:var(--text-base)] hover:bg-white transition-colors border border-transparent hover:border-[#ed752a]/20">
                        모르는 단어가 많아요
                    </button>
                    <button onClick={handleTagClick} className={`px-3 py-2 rounded-lg text-[length:var(--text-base)] transition-colors border ${analysisState !== 'initial' ? 'bg-[#f9f7f3] text-[#ed752a] border-[#ed752a]' : 'bg-[#f9f7f3] text-[#757575] border-transparent hover:bg-white'}`}>
                        연음 때문에 알아듣기 힘들어요
                    </button>
                </div>

                {/* AI Analysis Area */}
                {analysisState === "loading" && (
                     <div className="w-full bg-[#b4a69e]/15 rounded-lg py-4 flex items-center justify-center">
                        <p className="text-[#757575] text-[length:var(--text-base)] animate-pulse">쉐도우가 힌트를 생성하고 있어요...</p>
                     </div>
                )}

                {analysisState === "done" && (
                    <div className="flex gap-3 items-start animate-in fade-in">
                         <div className="w-[3px] bg-[#ed752a] self-stretch rounded-full min-h-[24px] mt-1" />
                         <p className="text-[#757575] text-[length:var(--text-base)] leading-relaxed">
                            이 문장은 사용자가 선택한 문장이 어려운 이유에 대해서 AI가 분석해주면서 다음에 잘하려면 어떻게 해야 하는지 팁을 줍니다. 사용자는 바로 이해할 수도 있고, 그게 아니라면 이 하이라이트 노트를 따로 저장해서 나중에 홈화면에서 모아볼 수 있습니다.
                         </p>
                    </div>
                )}

                {/* Separator */}
                <div className="h-px w-full bg-[#b4a69e]/30 my-1" />

                {/* Highlights Section */}
                 <div className="flex flex-col gap-3">
                    <h3 className="text-[length:var(--text-base)] font-medium text-black">문장 하이라이트</h3>
                    
                    {highlights.length === 0 ? (
                        <p className="text-[#757575] text-[length:var(--text-base)] text-center py-2">
                            아직 하이라이트한 표현이 없어요
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {highlights.map((h, i) => (
                                <div key={i} className="flex flex-col gap-2 w-full">
                                    {/* Highlighted Text */}
                                    <div className="flex gap-2 items-center w-full">
                                        <div className="bg-[#ecc845] h-full min-h-[20px] w-[3px] shrink-0 rounded-full" />
                                        <p className="text-[length:var(--text-base)] text-black font-medium leading-relaxed break-words">
                                            {h.text}
                                        </p>
                                    </div>
                                    
                                    {/* Comment */}
                                    <div className="flex gap-2 items-start pl-3">
                                        <div className="shrink-0 mt-1">
                                            <ReplyArrowIcon />
                                        </div>
                                        <p className="text-[length:var(--text-base)] text-[#757575] leading-relaxed">
                                            {h.comment}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
