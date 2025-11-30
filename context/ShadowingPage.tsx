
import { useState, useEffect } from "react";
import { Mic, Play, Pause, RotateCcw, BarChart2 } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import imgKimKardashian from "figma:asset/05a7c61b6458a5b0392fad0cf1925b5a714fbe01.png";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "../ui/dropdown-menu";

// --- Icons & Assets ---

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

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="#F5F5F5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function WaveformGraphic({ color = "#D9D9D9", isAnimating = false, count = 20 }: { color?: string, isAnimating?: boolean, count?: number }) {
    const [bars, setBars] = useState(() => [...Array(count)].map(() => Math.max(4, Math.random() * 24)));

    useEffect(() => {
        setBars([...Array(count)].map(() => Math.max(4, Math.random() * 24)));
    }, [count]);

    useEffect(() => {
        if (!isAnimating) return;
        const interval = setInterval(() => {
            setBars([...Array(count)].map(() => Math.max(4, Math.random() * 24)));
        }, 150);
        return () => clearInterval(interval);
    }, [isAnimating, count]);

    return (
        <div className="flex items-center gap-[2px] h-[24px]">
            {bars.map((height, i) => (
                <div 
                    key={i} 
                    className="w-[3px] rounded-full transition-all duration-150"
                    style={{ 
                        height: `${height}px`,
                        backgroundColor: color,
                    }} 
                />
            ))}
        </div>
    )
}

// --- Mock Data ---
const SCRIPT_DATA = [
    { id: 1, text: "ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game" },
    { id: 2, text: "ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game" },
    { id: 3, text: "ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game" },
    { id: 4, text: "ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game" },
    { id: 5, text: "ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game" },
    { id: 6, text: "ROSÉ Reminisces on Her BLACKPINK Audition, Shows Jimmy How to Play the APT. Drinking Game" },
];

// --- Components ---

interface ShadowingPageProps {
  onBack: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export function ShadowingPage({ onBack, onPrevStep, onNextStep }: ShadowingPageProps) {
  const [mode, setMode] = useState<"sentence" | "paragraph" | "total">("sentence");

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
            <button 
                onClick={onPrevStep}
                className="bg-[#f1ede5] hover:bg-[#e5e1d9] text-[#ed752a] px-4 py-2 rounded-xl text-[length:var(--text-base)] font-medium transition-colors"
            >
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

        {/* Right: Shadowing Script & Tools */}
        <div className="w-1/2 h-full bg-[#f9f7f3] rounded-2xl p-8 overflow-hidden flex flex-col">
             {/* Mode Toggles */}
             <div className="flex gap-3 mb-6 shrink-0">
                <button 
                    onClick={() => setMode("sentence")}
                    className={`px-3 py-2 rounded-lg text-[length:var(--text-base)] font-medium flex items-center gap-2 transition-colors ${mode === 'sentence' ? 'bg-[#2c2c2c] text-[#f5f5f5]' : 'bg-[#f3f3f3] text-[#757575] hover:bg-[#e5e5e5]'}`}
                >
                    {mode === 'sentence' && <CheckIcon />}
                    한 문장씩
                </button>
                <button 
                    onClick={() => setMode("paragraph")}
                    className={`px-3 py-2 rounded-lg text-[length:var(--text-base)] font-medium flex items-center gap-2 transition-colors ${mode === 'paragraph' ? 'bg-[#2c2c2c] text-[#f5f5f5]' : 'bg-[#f3f3f3] text-[#757575] hover:bg-[#e5e5e5]'}`}
                >
                    {mode === 'paragraph' && <CheckIcon />}
                    한 문단씩
                </button>
                <button 
                    onClick={() => setMode("total")}
                    className={`px-3 py-2 rounded-lg text-[length:var(--text-base)] font-medium flex items-center gap-2 transition-colors ${mode === 'total' ? 'bg-[#2c2c2c] text-[#f5f5f5]' : 'bg-[#f3f3f3] text-[#757575] hover:bg-[#e5e5e5]'}`}
                >
                    {mode === 'total' && <CheckIcon />}
                    전체
                </button>
             </div>

             {/* Script List */}
             <div className="flex-1 overflow-y-auto pb-20">
                 <ScriptList mode={mode} />
             </div>
        </div>

      </div>
    </div>
  );
}

function ScriptList({ mode }: { mode: "sentence" | "paragraph" | "total" }) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {SCRIPT_DATA.map((line) => (
                <div key={line.id} className="flex flex-col gap-4">
                    <p 
                        onClick={() => toggleExpand(line.id)}
                        className={`
                            text-[length:var(--text-lg)] leading-relaxed cursor-pointer transition-colors
                            ${expandedId === line.id ? "font-semibold text-black" : "font-medium text-[#a6a6a6] hover:text-[#808080]"}
                        `}
                    >
                        {line.text}
                    </p>

                    {/* Shadowing Player Panel (Accordion) */}
                    {expandedId === line.id && (
                        <ShadowingPlayer />
                    )}
                </div>
            ))}
             <div className="h-20" />
        </div>
    );
}

function ShadowingPlayer() {
    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState<number>(1.25);
    
    // Recording state
    const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording" | "review">("idle");
    const [isReviewPlaying, setIsReviewPlaying] = useState(false);

    // Simulate audio playback ending automatically
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isPlaying) {
            timeout = setTimeout(() => {
                setIsPlaying(false);
            }, 5000); // Simulate 5 second clip
        }
        return () => clearTimeout(timeout);
    }, [isPlaying]);

    // Simulate review playback ending automatically
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isReviewPlaying) {
            timeout = setTimeout(() => {
                setIsReviewPlaying(false);
            }, 3000); // Simulate 3 second clip
        }
        return () => clearTimeout(timeout);
    }, [isReviewPlaying]);

    // Pause playback if recording starts
    useEffect(() => {
        if (recordingStatus === 'recording') {
            setIsPlaying(false);
        }
    }, [recordingStatus]);

    const handleSpeedSelect = (speed: number) => {
        setPlaybackRate(speed);
    };

    const handleMicClick = () => {
        if (recordingStatus === "idle" || recordingStatus === "review") {
            setRecordingStatus("recording");
            setIsReviewPlaying(false);
        } else if (recordingStatus === "recording") {
            setRecordingStatus("review");
            setIsReviewPlaying(true); // Auto play after recording stops
        }
    };

    const handleContainerClick = () => {
        if (recordingStatus === "review") {
            setIsReviewPlaying(!isReviewPlaying);
        }
    };

    return (
        <div className="bg-[#ebe8e2] rounded-2xl p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-6 w-full">
                
                {/* Section 1: Original Audio */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-[length:var(--text-base)] font-semibold text-black">
                            먼저 강세와 억양에 유의하며 반복해서 들어보세요.
                        </h3>
                    </div>
                    
                    {/* Player Controls */}
                    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-sm min-w-[250px] justify-between">
                         <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-8 h-8 rounded-full bg-[#ed752a] flex items-center justify-center text-white hover:bg-[#d66a26] transition-colors shrink-0"
                         >
                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                         </button>
                         
                         {/* Waveform Visual */}
                         <div className="flex items-center gap-2 px-2 flex-1 justify-end">
                            <WaveformGraphic 
                                color={isPlaying ? "#ed752a" : "#d9d9d9"} 
                                isAnimating={isPlaying}
                                count={20}
                            />
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-xs text-[#757575] font-medium tabular-nums hover:text-[#ed752a] transition-colors outline-none cursor-pointer min-w-[40px] text-right">
                                        {playbackRate}x
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[80px]">
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                        <DropdownMenuItem 
                                            key={rate} 
                                            onClick={() => handleSpeedSelect(rate)}
                                            className={`cursor-pointer justify-center font-medium ${playbackRate === rate ? 'text-[#ed752a]' : ''}`}
                                        >
                                            {rate}x
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                    </div>
                </div>

                <div className="h-px w-full bg-[#b4a69e]/30" />

                {/* Section 2: Recording */}
                 <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                        <h3 className="text-[length:var(--text-base)] font-semibold text-black">
                            녹음 버튼을 눌러 쉐도잉을 시작하세요.
                        </h3>
                        <p className="text-[length:var(--text-sm)] text-[#757575]">
                            원본과 비교해 들으며 부족한 부분을 분석해보세요.
                        </p>
                    </div>
                    
                    {/* Recorder Controls */}
                    <div 
                        onClick={handleContainerClick}
                        className={`
                            flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-sm min-w-[250px] justify-between transition-colors select-none
                            ${recordingStatus === 'review' ? 'cursor-pointer hover:bg-gray-50' : ''}
                        `}
                    >
                         <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMicClick();
                            }}
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors shrink-0
                                ${recordingStatus === 'recording' ? "bg-red-500 animate-pulse" : "bg-[#d9d9d9] hover:bg-[#c0c0c0]"}
                            `}
                         >
                            <Mic className="w-4 h-4" />
                         </button>
                         
                         {/* Waveform Visual */}
                         <div className="flex items-center gap-2 px-2 flex-1 justify-end">
                            <WaveformGraphic 
                                color={recordingStatus === 'recording' ? '#ef4444' : (recordingStatus === 'review' ? '#ed752a' : '#d9d9d9')}
                                isAnimating={recordingStatus === 'recording' || isReviewPlaying}
                                count={30}
                            />
                         </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
