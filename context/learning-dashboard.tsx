
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { LEARNING_VIDEOS } from "../data/mock-data";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import imgRectangle2 from "figma:asset/0d10ac3c8c765382b7c7f94f899f714e3ba1756e.png";

export function LearningDashboard() {
  return (
    <div className="bg-[#f3f3f3] rounded-2xl p-4 h-full w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-1 relative mb-2 shrink-0">
            <h2 className="text-xl font-semibold text-black">학습 중인 영상</h2>
            <ChevronDown className="w-4 h-4 text-black" />
        </div>

        {/* Content List */}
        <div className="flex-1 min-h-0">
            <ScrollArea className="h-full -mr-3 pr-3">
                <div className="flex flex-col gap-4 pb-4">
                    {LEARNING_VIDEOS.map((video) => (
                        <div key={video.id} className="flex items-start gap-4 w-full">
                            {/* Thumbnail */}
                            <div className="w-[191px] h-[139px] rounded-xl overflow-hidden shrink-0 relative">
                                <ImageWithFallback 
                                    src={imgRectangle2} 
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 right-2 bg-black/35 backdrop-blur-sm px-2 py-1.5 rounded-md">
                                    <span className="text-white text-xs font-medium font-['SF_Pro_Display']">{video.duration}</span>
                                </div>
                            </div>

                            {/* Info Column */}
                            <div className="flex flex-col gap-4 flex-1 min-w-0">
                                {/* Title & Meta */}
                                <div className="flex flex-col items-start w-full">
                                    <h3 className="text-lg font-semibold text-black line-clamp-2 leading-tight mb-1 font-['SF_Pro_Display']">
                                        {video.title}
                                    </h3>
                                    <p className="text-lg font-medium text-[#767676]">
                                        {video.sentenceCount}문장 · {video.duration.split(':')[0]}분
                                    </p>
                                </div>

                                {/* Progress */}
                                <div className="flex items-center gap-2 w-full">
                                    <div className="w-[228px] h-1 bg-[#d8d8d8] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#a5d592] rounded-full" 
                                            style={{ width: `${video.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-black">{video.progress}%</span>
                                </div>

                                {/* Action Button */}
                                <button className="bg-neutral-200 hover:bg-neutral-300 transition-colors rounded-xl py-2 px-2.5 flex items-center justify-center w-fit">
                                    <span className="text-sm font-medium text-[#3f3f3f]">계속 학습하기</span>
                                </button>
                            </div>
                        </div>
                    ))}
                    {/* Duplicate for scrolling demo */}
                    {LEARNING_VIDEOS.map((video) => (
                        <div key={`${video.id}-dup`} className="flex items-start gap-4 w-full">
                            <div className="w-[191px] h-[139px] rounded-xl overflow-hidden shrink-0 relative">
                                <ImageWithFallback 
                                    src={imgRectangle2} 
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 right-2 bg-black/35 backdrop-blur-sm px-2 py-1.5 rounded-md">
                                    <span className="text-white text-xs font-medium font-['SF_Pro_Display']">{video.duration}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 flex-1 min-w-0">
                                <div className="flex flex-col items-start w-full">
                                    <h3 className="text-lg font-semibold text-black line-clamp-2 leading-tight mb-1 font-['SF_Pro_Display']">
                                        {video.title}
                                    </h3>
                                    <p className="text-lg font-medium text-[#767676]">
                                        {video.sentenceCount}문장 · {video.duration.split(':')[0]}분
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 w-full">
                                    <div className="w-[228px] h-1 bg-[#d8d8d8] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#a5d592] rounded-full" 
                                            style={{ width: `${video.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-black">{video.progress}%</span>
                                </div>
                                <button className="bg-neutral-200 hover:bg-neutral-300 transition-colors rounded-xl py-2 px-2.5 flex items-center justify-center w-fit">
                                    <span className="text-sm font-medium text-[#3f3f3f]">계속 학습하기</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    </div>
  );
}
